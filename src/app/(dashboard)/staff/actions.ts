"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/security/password";
import { staffSchema } from "@/lib/validations/staff";

export async function createStaff(data: any) {
  const user = await requirePermission("staff.manage");

  const validated = staffSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    const { email, fullName, ...staffData } = validated.data;

    // Start a transaction to create both User and Staff
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User account first
      // Default password is staff number for now
      const passwordHash = await hashPassword(staffData.staffNumber);

      const userAccount = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          fullName,
          passwordHash,
          status: "ACTIVE",
        },
      });

      // 2. Assign TEACHER role by default (can be changed later)
      const teacherRole = await tx.role.findUnique({
        where: { name: "TEACHER" },
      });
      if (teacherRole) {
        await tx.userRole.create({
          data: {
            userId: userAccount.id,
            roleId: teacherRole.id,
            assignedById: user.id,
          },
        });
      }

      // 3. Create Staff record
      const staff = await tx.staff.create({
        data: {
          ...staffData,
          fullName,
          email,
          userId: userAccount.id,
          dateOfBirth: new Date(staffData.dateOfBirth),
          joiningDate: new Date(staffData.joiningDate),
        },
      });

      return staff;
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "Staff",
      recordId: result.id,
      newValue: result,
    });

    return { success: true, staffId: result.id };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Email or staff number already exists",
      };
    }
    return { success: false, message: "Failed to create staff" };
  }
}

export async function updateStaff(id: string, data: any) {
  const user = await requirePermission("staff.manage");

  const validated = staffSchema.safeParse(data);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    const oldStaff = await prisma.staff.findUnique({ where: { id } });
    const staff = await prisma.staff.update({
      where: { id },
      data: {
        ...validated.data,
        dateOfBirth: new Date(validated.data.dateOfBirth),
        joiningDate: new Date(validated.data.joiningDate),
      },
    });

    // Also update linked user's name and email if changed
    if (staff.userId) {
      await prisma.user.update({
        where: { id: staff.userId },
        data: {
          fullName: validated.data.fullName,
          email: validated.data.email.toLowerCase(),
        },
      });
    }

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "Staff",
      recordId: id,
      oldValue: oldStaff,
      newValue: staff,
    });

    revalidatePath("/staff");
    revalidatePath(`/staff/${id}`);
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to update staff" };
  }
}

export async function deleteStaff(id: string) {
  const user = await requirePermission("staff.manage");

  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: { isDeleted: true },
    });

    // Deactivate linked user account
    if (staff.userId) {
      await prisma.user.update({
        where: { id: staff.userId },
        data: { status: "DEACTIVATED", isDeleted: true },
      });
    }

    await writeAuditLog({
      actorUserId: user.id,
      action: "DELETE",
      tableName: "Staff",
      recordId: id,
    });

    revalidatePath("/staff");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to delete staff" };
  }
}
