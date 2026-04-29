"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function updateSettings(formData: FormData) {
  try {
    const user = await requirePermission("system.manage");

    const data = {
      schoolName: formData.get("schoolName") as string,
      schoolLogoUrl: formData.get("schoolLogoUrl") as string,
      addressLine1: formData.get("addressLine1") as string,
      addressLine2: formData.get("addressLine2") as string,
      city: formData.get("city") as string,
      contactEmail: formData.get("contactEmail") as string,
      contactPhone: formData.get("contactPhone") as string,
    };

    const settings = await prisma.systemSettings.findFirst();

    if (settings) {
      await prisma.systemSettings.update({
        where: { id: settings.id },
        data,
      });

      await writeAuditLog({
        actorUserId: user.id,
        action: "UPDATE",
        tableName: "SystemSettings",
        recordId: settings.id.toString(),
        oldValue: settings,
        newValue: data,
      });
    } else {
      const newSettings = await prisma.systemSettings.create({
        data,
      });

      await writeAuditLog({
        actorUserId: user.id,
        action: "CREATE",
        tableName: "SystemSettings",
        recordId: newSettings.id.toString(),
        newValue: data,
      });
    }

    revalidatePath("/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return { success: false, message: error.message };
  }
}
