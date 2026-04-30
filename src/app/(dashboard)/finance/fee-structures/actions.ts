"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import {
  feeComponentSchema,
  feeStructureSchema,
} from "@/lib/validations/finance";

export async function createFeeStructure(data: any) {
  const user = await requirePermission("finance.manage");

  const validated = feeStructureSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: z.flattenError(validated.error).fieldErrors,
    };
  }

  try {
    const structure = await prisma.feeStructure.create({
      data: validated.data,
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "FeeStructure",
      recordId: structure.id,
      newValue: structure,
    });

    revalidatePath("/finance/fee-structures");
    return { success: true, structureId: structure.id };
  } catch (_error) {
    return { success: false, message: "Failed to create fee structure" };
  }
}

export async function addFeeComponent(data: any) {
  const user = await requirePermission("finance.manage");

  const validated = feeComponentSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: z.flattenError(validated.error).fieldErrors,
    };
  }

  try {
    const component = await prisma.feeComponent.create({
      data: {
        ...validated.data,
        dueDate: new Date(validated.data.dueDate),
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "FeeComponent",
      recordId: component.id,
      newValue: component,
    });

    revalidatePath("/finance/fee-structures");
    return { success: true };
  } catch (_error) {
    console.log("error adding FeeComponent: ", _error);
    await writeAuditLog({
      actorUserId: user.id,
      action: "ERROR",
      tableName: "FeeComponent",
      recordId: "",
      newValue: "",
    });
    return { success: false, message: "Failed to add fee component" };
  }
}

export async function deleteFeeComponent(id: string) {
  const user = await requirePermission("finance.manage");

  try {
    await prisma.feeComponent.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DELETE",
      tableName: "FeeComponent",
      recordId: id,
    });

    revalidatePath("/finance/fee-structures");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to delete fee component" };
  }
}

export async function deleteFeeStructure(id: string) {
  const user = await requirePermission("finance.manage");

  try {
    await prisma.feeStructure.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DELETE",
      tableName: "FeeStructure",
      recordId: id,
    });

    revalidatePath("/finance/fee-structures");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to delete fee structure" };
  }
}
