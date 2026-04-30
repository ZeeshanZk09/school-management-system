'use server';

import { revalidatePath } from 'next/cache';
import { writeAuditLog } from '@/lib/audit';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { studentEnrollmentSchema, studentSchema } from '@/lib/validations/student';
import { z } from 'zod';

export type ActionResponse = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[] | undefined>;
  [key: string]: any;
};

export async function createStudent(data: any) {
  const user = await requirePermission('students.manage');

  const validated = studentSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    const student = await prisma.student.create({
      data: {
        ...validated.data,
        dateOfBirth: new Date(validated.data.dateOfBirth),
        admissionDate: new Date(validated.data.admissionDate),
        email: validated.data.email || null,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'CREATE',
      tableName: 'Student',
      recordId: student.id,
      newValue: student,
    });

    return { success: true, studentId: student.id };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, message: 'Admission number already exists' };
    }
    return { success: false, message: 'Failed to create student' };
  }
}

export async function enrollStudent(data: any) {
  const user = await requirePermission('students.manage');

  const validated = studentEnrollmentSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    const enrollment = await prisma.studentEnrollment.create({
      data: validated.data,
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'CREATE',
      tableName: 'StudentEnrollment',
      recordId: enrollment.id,
      newValue: enrollment,
    });

    revalidatePath('/students');
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Failed to enroll student' };
  }
}

export async function updateStudent(id: string, data: any) {
  const user = await requirePermission('students.manage');

  const validated = studentSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    const oldStudent = await prisma.student.findUnique({ where: { id } });
    const student = await prisma.student.update({
      where: { id },
      data: {
        ...validated.data,
        dateOfBirth: new Date(validated.data.dateOfBirth),
        admissionDate: new Date(validated.data.admissionDate),
        email: validated.data.email || null,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'UPDATE',
      tableName: 'Student',
      recordId: id,
      oldValue: oldStudent,
      newValue: student,
    });

    revalidatePath('/students');
    revalidatePath(`/students/${id}`);
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Failed to update student' };
  }
}

export async function deleteStudent(id: string) {
  const user = await requirePermission('students.manage');

  try {
    await prisma.student.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'DELETE',
      tableName: 'Student',
      recordId: id,
    });

    revalidatePath('/students');
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Failed to delete student' };
  }
}

// Guardian Actions
export async function addGuardian(studentId: string, data: any): Promise<ActionResponse> {
  const user = await requirePermission('students.manage');
  const { guardianSchema } = await import('@/lib/validations/guardian');

  const validated = guardianSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Create the Guardian record
      const guardian = await tx.guardian.create({
        data: {
          fullName: validated.data.fullName,
          primaryPhone: validated.data.phoneNumber,
          email: validated.data.email || null,
          occupation: validated.data.occupation || null,
        },
      });

      // 2. If setting as primary, unset others for this student
      if (validated.data.isPrimary) {
        await tx.studentGuardian.updateMany({
          where: { studentId, isPrimaryEmergency: true },
          data: { isPrimaryEmergency: false },
        });
      }

      // 3. Create the link
      await tx.studentGuardian.create({
        data: {
          studentId,
          guardianId: guardian.id,
          relationship: validated.data.relation,
          isPrimaryEmergency: validated.data.isPrimary,
        },
      });

      await writeAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        tableName: 'Guardian',
        recordId: guardian.id,
        newValue: guardian,
      });

      revalidatePath(`/students/${studentId}`);
      return { success: true };
    });
  } catch (_error) {
    return { success: false, message: 'Failed to add guardian' };
  }
}

export async function updateGuardian(
  id: string,
  studentId: string,
  data: any
): Promise<ActionResponse> {
  const user = await requirePermission('students.manage');
  const { guardianSchema } = await import('@/lib/validations/guardian');

  const validated = guardianSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: z.flattenError(validated.error).fieldErrors };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const oldGuardian = await tx.guardian.findUnique({ where: { id } });

      // 1. Update Guardian record
      const guardian = await tx.guardian.update({
        where: { id },
        data: {
          fullName: validated.data.fullName,
          primaryPhone: validated.data.phoneNumber,
          email: validated.data.email || null,
          occupation: validated.data.occupation || null,
        },
      });

      // 2. Update StudentGuardian link
      const oldLink = await tx.studentGuardian.findUnique({
        where: { studentId_guardianId: { studentId, guardianId: id } },
      });

      // If setting as primary, unset others
      if (validated.data.isPrimary && !oldLink?.isPrimaryEmergency) {
        await tx.studentGuardian.updateMany({
          where: { studentId, isPrimaryEmergency: true },
          data: { isPrimaryEmergency: false },
        });
      }

      await tx.studentGuardian.update({
        where: { studentId_guardianId: { studentId, guardianId: id } },
        data: {
          relationship: validated.data.relation,
          isPrimaryEmergency: validated.data.isPrimary,
        },
      });

      await writeAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        tableName: 'Guardian',
        recordId: id,
        oldValue: oldGuardian,
        newValue: guardian,
      });

      revalidatePath(`/students/${studentId}`);
      return { success: true };
    });
  } catch (_error) {
    return { success: false, message: 'Failed to update guardian' };
  }
}

export async function deleteGuardian(id: string, studentId: string) {
  const user = await requirePermission('students.manage');

  try {
    // We just remove the link, or soft delete the guardian?
    // In this schema, we'll just remove the StudentGuardian link for now
    // or soft delete the Guardian record if it's only for this student.
    // For simplicity, we'll soft delete the link if it had an isDeleted field,
    // but StudentGuardian doesn't have it.
    // So we'll just DELETE the link.
    await prisma.studentGuardian.delete({
      where: { studentId_guardianId: { studentId, guardianId: id } },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'DELETE',
      tableName: 'StudentGuardian',
      recordId: `${studentId}_${id}`,
    });

    revalidatePath(`/students/${studentId}`);
    return { success: true };
  } catch (_error) {
    return { success: false, message: 'Failed to remove guardian link' };
  }
}

// Sibling Actions
export async function linkSiblings(studentId: string, siblingStudentId: string) {
  const user = await requirePermission('students.manage');

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Check if either student already has a sibling group
      const student1 = await tx.studentSibling.findFirst({
        where: { studentId },
      });
      const student2 = await tx.studentSibling.findFirst({
        where: { studentId: siblingStudentId },
      });

      let groupId: string;

      if (student1 && student2) {
        if (student1.siblingGroupId === student2.siblingGroupId) {
          return { success: true, message: 'Already linked' };
        }
        // Merge groups? For simplicity, we'll just throw an error or handle one
        groupId = student1.siblingGroupId;
        // Move student2 and their siblings to student1's group
        await tx.studentSibling.updateMany({
          where: { siblingGroupId: student2.siblingGroupId },
          data: { siblingGroupId: groupId },
        });
      } else if (student1) {
        groupId = student1.siblingGroupId;
        await tx.studentSibling.create({
          data: { studentId: siblingStudentId, siblingGroupId: groupId },
        });
      } else if (student2) {
        groupId = student2.siblingGroupId;
        await tx.studentSibling.create({
          data: { studentId, siblingGroupId: groupId },
        });
      } else {
        const group = await tx.siblingGroup.create({ data: {} });
        groupId = group.id;
        await tx.studentSibling.createMany({
          data: [
            { studentId, siblingGroupId: groupId },
            { studentId: siblingStudentId, siblingGroupId: groupId },
          ],
        });
      }

      await writeAuditLog({
        actorUserId: user.id,
        action: 'UPDATE',
        tableName: 'StudentSibling',
        recordId: groupId,
        note: `Linked ${studentId} and ${siblingStudentId} as siblings`,
      });

      revalidatePath(`/students/${studentId}`);
      revalidatePath(`/students/${siblingStudentId}`);
      return { success: true };
    });
  } catch (_error) {
    return { success: false, message: 'Failed to link siblings' };
  }
}

export async function promoteStudent(
  studentId: string,
  data: {
    targetAcademicYearId: string;
    targetClassId: string;
    targetSectionId?: string;
    targetRollNumber: string;
  }
) {
  const user = await requirePermission('students.manage');

  try {
    return await prisma.$transaction(async (tx) => {
      // 1. Check if already enrolled in target year
      const existing = await tx.studentEnrollment.findUnique({
        where: {
          studentId_academicYearId: {
            studentId,
            academicYearId: data.targetAcademicYearId,
          },
        },
      });

      if (existing) {
        return {
          success: false,
          message: 'Student is already enrolled in the target academic year',
        };
      }

      // 2. Create new enrollment
      const enrollment = await tx.studentEnrollment.create({
        data: {
          studentId,
          academicYearId: data.targetAcademicYearId,
          classId: data.targetClassId,
          sectionId: data.targetSectionId || null,
          rollNumber: data.targetRollNumber,
        },
      });

      await writeAuditLog({
        actorUserId: user.id,
        action: 'CREATE',
        tableName: 'StudentEnrollment',
        recordId: enrollment.id,
        newValue: enrollment,
        note: `Promoted student ${studentId} to next academic year`,
      });

      revalidatePath(`/students/${studentId}`);
      return { success: true };
    });
  } catch (error) {
    console.error('Promotion error:', error);
    return { success: false, message: 'Failed to promote student' };
  }
}

export async function bulkPromoteStudents(
  studentIds: string[],
  data: {
    targetAcademicYearId: string;
    targetClassId: string;
    targetSectionId?: string;
  }
) {
  const user = await requirePermission('students.manage');

  try {
    const results = await prisma.$transaction(async (tx) => {
      const promotions = [];
      for (const studentId of studentIds) {
        // Skip if already enrolled
        const existing = await tx.studentEnrollment.findUnique({
          where: {
            studentId_academicYearId: {
              studentId,
              academicYearId: data.targetAcademicYearId,
            },
          },
        });

        if (!existing) {
          // Fetch the most recent enrollment to carry over the roll number
          const lastEnrollment = await tx.studentEnrollment.findFirst({
            where: { studentId },
            orderBy: { createdAt: 'desc' },
          });

          const enrollment = await tx.studentEnrollment.create({
            data: {
              studentId,
              academicYearId: data.targetAcademicYearId,
              classId: data.targetClassId,
              sectionId: data.targetSectionId || null,
              rollNumber: lastEnrollment?.rollNumber || 'TBD',
            },
          });
          promotions.push(enrollment);
        }
      }
      return promotions;
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'CREATE',
      tableName: 'StudentEnrollment',
      note: `Bulk promoted ${results.length} students`,
    });

    revalidatePath('/students');
    return { success: true, count: results.length };
  } catch (error) {
    console.error('Bulk promotion error:', error);
    return { success: false, message: 'Failed to perform bulk promotion' };
  }
}

// Document Actions
export async function addStudentDocument(
  studentId: string,
  data: {
    title: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    sizeBytes: number;
  }
) {
  const user = await requirePermission('students.manage');

  try {
    const document = await prisma.studentDocument.create({
      data: {
        studentId,
        title: data.title,
        fileName: data.fileName,
        filePath: data.filePath,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        uploadedById: user.id,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'CREATE',
      tableName: 'StudentDocument',
      recordId: document.id,
      newValue: document,
    });

    revalidatePath(`/students/${studentId}`);
    return { success: true, document };
  } catch (error) {
    console.error('Error adding student document:', error);
    return { success: false, message: 'Failed to save document record' };
  }
}

export async function deleteStudentDocument(id: string, studentId: string) {
  const user = await requirePermission('students.manage');

  try {
    const document = await prisma.studentDocument.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'DELETE',
      tableName: 'StudentDocument',
      recordId: id,
      oldValue: document,
    });

    revalidatePath(`/students/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting student document:', error);
    return { success: false, message: 'Failed to delete document' };
  }
}
