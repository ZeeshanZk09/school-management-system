"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function createAnnouncement(data: {
  title: string;
  body: string;
  expiresAt?: Date;
}): Promise<{
  success: boolean;
  data?: {
    id: string;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
    isActive: boolean;
    title: string;
    body: string;
    publishedAt: Date;
    createdByUserId: string;
  };
  message?: string;
}> {
  try {
    const actor = await requirePermission("system.manage");

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        expiresAt: data.expiresAt,
        createdByUserId: actor.id,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      tableName: "Announcement",
      recordId: announcement.id,
      newValue: announcement,
      actorUserId: actor.id,
    });

    revalidatePath("/announcements");
    revalidatePath("/");
    return { success: true, data: announcement };
  } catch (error) {
    console.error("Create announcement error:", error);
    return { success: false, message: "Failed to create announcement" };
  }
}

export async function deleteAnnouncement(
  id: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const actor = await requirePermission("system.manage");

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      action: "DELETE",
      tableName: "Announcement",
      recordId: id,
      oldValue: announcement,
      actorUserId: actor.id,
    });

    revalidatePath("/announcements");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Delete announcement error:", error);
    return { success: false, message: "Failed to delete announcement" };
  }
}
