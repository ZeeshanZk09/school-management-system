"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { academicYearSchema } from "@/lib/validations/academic-year";

export async function createAcademicYear(formData: FormData) {
  const user = await requirePermission("settings.manage");

  const validated = academicYearSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "true",
  });

  if (!validated.success) {
    return {
      success: false,
      errors: z.flattenError(validated.error).fieldErrors,
    };
  }

  const { name, startDate, endDate, isActive } = validated.data;

  try {
    // If setting to active, deactivate others
    if (isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const year = await prisma.academicYear.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "AcademicYear",
      recordId: year.id,
      newValue: year,
    });

    revalidatePath("/academic-years");
    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      const prismaError = error as unknown as Record<string, string>;
      if (prismaError.code === "P2002") {
        return { success: false, message: "Academic year name already exists" };
      }
    }
    return { success: false, message: "Failed to create academic year" };
  }
}

export async function updateAcademicYear(id: string, formData: FormData) {
  const user = await requirePermission("settings.manage");

  const validated = academicYearSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "true",
  });

  if (!validated.success) {
    return {
      success: false,
      errors: z.flattenError(validated.error).fieldErrors,
    };
  }

  const { name, startDate, endDate, isActive } = validated.data;

  try {
    const oldYear = await prisma.academicYear.findUnique({ where: { id } });

    if (!oldYear) {
      return { success: false, message: "Academic year not found" };
    }

    // If setting to active, deactivate others
    if (isActive && !oldYear.isActive) {
      await prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });
    }

    const year = await prisma.academicYear.update({
      where: { id },
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isActive,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "AcademicYear",
      recordId: year.id,
      oldValue: oldYear,
      newValue: year,
    });

    revalidatePath("/academic-years");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to update academic year" };
  }
}

export async function deleteAcademicYear(id: string) {
  const user = await requirePermission("settings.manage");

  try {
    const _year = await prisma.academicYear.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DELETE",
      tableName: "AcademicYear",
      recordId: id,
    });

    revalidatePath("/academic-years");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to delete academic year" };
  }
}

export async function setActiveAcademicYear(id: string) {
  const user = await requirePermission("settings.manage");

  try {
    await prisma.$transaction([
      prisma.academicYear.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      }),
      prisma.academicYear.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "AcademicYear",
      recordId: id,
      newValue: { isActive: true },
    });

    revalidatePath("/academic-years");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to set active academic year" };
  }
}
