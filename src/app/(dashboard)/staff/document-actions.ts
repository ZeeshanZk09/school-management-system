'use server';

import { revalidatePath } from 'next/cache';
import { writeAuditLog } from '@/lib/audit';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

export async function uploadStaffDocument(staffId: string, formData: FormData) {
  try {
    const user = await requirePermission('staff.manage');

    const title = formData.get("title") as string;
    const fileName = formData.get("fileName") as string;
    const filePath = formData.get("filePath") as string;
    const mimeType = formData.get("mimeType") as string;
    const sizeBytes = Number.parseInt(formData.get("sizeBytes") as string, 10);

    const document = await prisma.staffDocument.create({
      data: {
        staffId,
        title,
        fileName,
        filePath,
        mimeType,
        sizeBytes,
        uploadedById: user.id,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'CREATE',
      tableName: 'StaffDocument',
      recordId: document.id,
      newValue: document,
    });

    revalidatePath(`/staff/${staffId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function deleteStaffDocument(id: string, staffId: string) {
  try {
    const user = await requirePermission('staff.manage');

    await prisma.staffDocument.update({
      where: { id },
      data: { isDeleted: true },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: 'DELETE',
      tableName: 'StaffDocument',
      recordId: id,
    });

    revalidatePath(`/staff/${staffId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
