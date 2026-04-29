"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function submitLeaveRequest(data: {
  staffId: string;
  academicYearId: string;
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}) {
  try {
    const user = await requirePermission("attendance.manage"); // Or a specific leave permission

    // 1. Validate dates
    if (data.endDate < data.startDate) {
      throw new Error("End date cannot precede start date");
    }

    // 2. Check balance
    const balance = await prisma.leaveBalance.findUnique({
      where: {
        staffId_academicYearId_leaveTypeId: {
          staffId: data.staffId,
          academicYearId: data.academicYearId,
          leaveTypeId: data.leaveTypeId,
        },
      },
    });

    const requestedDays =
      Math.ceil(
        (data.endDate.getTime() - data.startDate.getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1;

    if (!balance || balance.totalDays - balance.usedDays < requestedDays) {
      throw new Error("Insufficient leave balance");
    }

    // 3. Create request
    const request = await prisma.leaveRequest.create({
      data: {
        staffId: data.staffId,
        academicYearId: data.academicYearId,
        leaveTypeId: data.leaveTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        status: "PENDING",
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "LeaveRequest",
      recordId: request.id,
      newValue: request,
    });

    revalidatePath("/leave");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateLeaveRequestStatus(
  id: string,
  status: "APPROVED" | "REJECTED",
  note?: string,
) {
  try {
    const user = await requirePermission("attendance.manage");

    const request = await prisma.leaveRequest.findUnique({
      where: { id },
      include: { leaveType: true },
    });

    if (!request) throw new Error("Request not found");

    await prisma.$transaction(async (tx) => {
      await tx.leaveRequest.update({
        where: { id },
        data: {
          status,
          decidedAt: new Date(),
          decidedByUserId: user.id,
          decisionNote: note,
        },
      });

      if (status === "APPROVED") {
        const requestedDays =
          Math.ceil(
            (request.endDate.getTime() - request.startDate.getTime()) /
              (1000 * 60 * 60 * 24),
          ) + 1;

        await tx.leaveBalance.update({
          where: {
            staffId_academicYearId_leaveTypeId: {
              staffId: request.staffId,
              academicYearId: request.academicYearId,
              leaveTypeId: request.leaveTypeId,
            },
          },
          data: {
            usedDays: { increment: requestedDays },
          },
        });
      }
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "LeaveRequest",
      recordId: id,
      note: `Leave request ${status.toLowerCase()}`,
    });

    revalidatePath("/leave");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
