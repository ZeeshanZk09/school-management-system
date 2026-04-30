"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requireRole } from "@/lib/auth/permissions";
import { revokeAllUserSessions } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function approvePasswordReset(requestId: string) {
  try {
    const admin = await requireRole("ADMIN");

    const request = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!request) {
      return { success: false, message: "Request not found." };
    }

    if (request.status !== "PENDING_APPROVAL") {
      return {
        success: false,
        message: "This request has already been processed.",
      };
    }

    if (request.expiresAt <= new Date()) {
      await prisma.passwordResetRequest.update({
        where: { id: requestId },
        data: { status: "EXPIRED" },
      });
      return { success: false, message: "This request has expired." };
    }

    // Update the user's password
    await prisma.user.update({
      where: { id: request.userId },
      data: { passwordHash: request.newPasswordHash },
    });

    // Revoke all sessions
    await revokeAllUserSessions(request.userId, "PASSWORD_CHANGED");

    // Mark request as approved
    await prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        decidedAt: new Date(),
        decidedByUserId: admin.id,
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "UPDATE",
      tableName: "PasswordResetRequest",
      recordId: requestId,
      newValue: {
        action: "APPROVED",
        targetUser: request.user.email,
      },
    });

    revalidatePath("/password-requests");
    return {
      success: true,
      message: `Password reset approved for ${request.user.fullName}.`,
    };
  } catch (error: any) {
    console.error("[password-requests] Approve error:", error);
    return { success: false, message: error.message || "Failed to approve." };
  }
}

export async function rejectPasswordReset(requestId: string, note?: string) {
  try {
    const admin = await requireRole("ADMIN");

    const request = await prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!request) {
      return { success: false, message: "Request not found." };
    }

    if (request.status !== "PENDING_APPROVAL") {
      return {
        success: false,
        message: "This request has already been processed.",
      };
    }

    await prisma.passwordResetRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        decidedAt: new Date(),
        decidedByUserId: admin.id,
        decisionNote: note || null,
      },
    });

    await writeAuditLog({
      actorUserId: admin.id,
      action: "UPDATE",
      tableName: "PasswordResetRequest",
      recordId: requestId,
      newValue: {
        action: "REJECTED",
        targetUser: request.user.email,
        note,
      },
    });

    revalidatePath("/password-requests");
    return {
      success: true,
      message: `Password reset rejected for ${request.user.fullName}.`,
    };
  } catch (error: any) {
    console.error("[password-requests] Reject error:", error);
    return { success: false, message: error.message || "Failed to reject." };
  }
}
