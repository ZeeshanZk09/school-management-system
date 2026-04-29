"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { classSchema, sectionSchema } from "@/lib/validations/class";

// Class Actions
export async function createClass(formData: FormData) {
  const user = await requirePermission("classes.manage");

  const validated = classSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    const cls = await prisma.class.create({
      data: {
        name: validated.data.name,
        code: validated.data.code,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "Class",
      recordId: cls.id,
      newValue: cls,
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to create class" };
  }
}

export async function updateClass(id: string, formData: FormData) {
  const user = await requirePermission("classes.manage");

  const validated = classSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code"),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    const oldCls = await prisma.class.findUnique({ where: { id } });
    const cls = await prisma.class.update({
      where: { id },
      data: {
        name: validated.data.name,
        code: validated.data.code,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "Class",
      recordId: cls.id,
      oldValue: oldCls,
      newValue: cls,
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to update class" };
  }
}

export async function deleteClass(id: string) {
  const user = await requirePermission("classes.manage");

  try {
    await prisma.class.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DELETE",
      tableName: "Class",
      recordId: id,
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to delete class" };
  }
}

// Section Actions
export async function createSection(formData: FormData) {
  const user = await requirePermission("classes.manage");

  const validated = sectionSchema.safeParse({
    name: formData.get("name"),
    classId: formData.get("classId"),
    capacity: formData.get("capacity"),
    classTeacherId: formData.get("classTeacherId"),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    const section = await prisma.section.create({
      data: {
        name: validated.data.name,
        classId: validated.data.classId,
        capacity: validated.data.capacity,
        classTeacherId: validated.data.classTeacherId,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "Section",
      recordId: section.id,
      newValue: section,
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to create section" };
  }
}

export async function updateSection(id: string, formData: FormData) {
  const user = await requirePermission("classes.manage");

  const validated = sectionSchema.safeParse({
    name: formData.get("name"),
    classId: formData.get("classId"),
    capacity: formData.get("capacity"),
    classTeacherId: formData.get("classTeacherId"),
  });

  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  try {
    const oldSection = await prisma.section.findUnique({ where: { id } });
    const section = await prisma.section.update({
      where: { id },
      data: {
        name: validated.data.name,
        capacity: validated.data.capacity,
        classTeacherId: validated.data.classTeacherId,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "Section",
      recordId: section.id,
      oldValue: oldSection,
      newValue: section,
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to update section" };
  }
}

export async function deleteSection(id: string) {
  const user = await requirePermission("classes.manage");

  try {
    await prisma.section.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "DELETE",
      tableName: "Section",
      recordId: id,
    });

    revalidatePath("/classes");
    return { success: true };
  } catch (_error) {
    return { success: false, message: "Failed to delete section" };
  }
}
