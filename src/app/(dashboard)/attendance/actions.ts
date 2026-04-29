'use server';

import { revalidatePath } from 'next/cache';
import { writeAuditLog } from '@/lib/audit';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

export async function recordAttendance(data: {
  classId: string;
  sectionId: string;
  academicYearId: string;
  sessionId: string;
  attendanceDate: string;
  records: {
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    note?: string;
  }[];
}) {
  const user = await requirePermission('attendance.manage');

  try {
    const attendanceDate = new Date(data.attendanceDate);

    // Process records in a transaction
    await prisma.$transaction(async (tx) => {
      for (const record of data.records) {
        await tx.studentAttendance.upsert({
          where: {
            studentId_classId_attendanceDate_sessionId: {
              studentId: record.studentId,
              classId: data.classId,
              attendanceDate,
              sessionId: data.sessionId,
            },
          },
          update: {
            status: record.status,
            note: record.note,
            recordedByUserId: user.id,
          },
          create: {
            studentId: record.studentId,
            classId: data.classId,
            sectionId: data.sectionId,
            academicYearId: data.academicYearId,
            sessionId: data.sessionId,
            attendanceDate,
            status: record.status,
            note: record.note,
            recordedByUserId: user.id,
          },
        });
      }
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'UPDATE',
      tableName: 'StudentAttendance',
      recordId: `${data.classId}_${data.sectionId}_${data.attendanceDate}`,
      newValue: { count: data.records.length },
    });

    revalidatePath('/attendance');
    return { success: true };
  } catch (error) {
    console.error('Attendance Error:', error);
    return { success: false, message: 'Failed to record attendance' };
  }
}

export async function exportAttendanceCSV(
  type: 'student' | 'staff',
  month: number,
  year: number,
  classId?: string
) {
  try {
    await requirePermission('attendance.manage');
    const { startOfMonth: startOfMonthFn, endOfMonth: endOfMonthFn } = await import('date-fns');
    const Papa = (await import('papaparse')).default;

    const startDate = startOfMonthFn(new Date(year, month - 1));
    const endDate = endOfMonthFn(startDate);

    type AttendanceData = Record<string, string | number>;
    let data: AttendanceData[] = [];

    if (type === 'student' && classId) {
      const students = await prisma.student.findMany({
        where: {
          isDeleted: false,
          enrollments: { some: { classId } },
        },
        include: {
          attendance: {
            where: {
              attendanceDate: { gte: startDate, lte: endDate },
              isDeleted: false,
            },
          },
        },
      });

      data = students.map((s) => {
        const present = s.attendance.filter((a) => a.status === 'PRESENT').length;
        const absent = s.attendance.filter((a) => a.status === 'ABSENT').length;
        const total = s.attendance.length;
        return {
          Name: s.fullName,
          Present: present,
          Absent: absent,
          'Total Sessions': total,
          'Attendance %': total > 0 ? Math.round((present / total) * 100) : 0,
        };
      });
    } else {
      const staff = await prisma.staff.findMany({
        where: { isDeleted: false },
        include: {
          attendance: {
            where: {
              attendanceDate: { gte: startDate, lte: endDate },
              isDeleted: false,
            },
          },
        },
      });

      data = staff.map((s) => {
        const present = s.attendance.filter((a) => a.status === 'PRESENT').length;
        const absent = s.attendance.filter((a) => a.status === 'ABSENT').length;
        return {
          Name: s.fullName,
          Designation: s.designation,
          Present: present,
          Absent: absent,
          Leave: s.attendance.filter((a) => a.status === 'ON_LEAVE').length,
        };
      });
    }

    const csv = Papa.unparse(data);
    return { success: true, csv };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, message: error.message };
    }
    return { success: false, message: 'Failed to generate report' };
  }
}
