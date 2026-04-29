"use server";

import { revalidatePath } from "next/cache";

import { getActiveAcademicYear } from "@/lib/academic-year";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

type StaffAttendanceStatus = "PRESENT" | "ABSENT" | "ON_LEAVE" | "HALF_DAY";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Unexpected error";
}

export async function markStaffAttendance(
  staffId: string,
  data: { status: StaffAttendanceStatus; note?: string; date: Date },
) {
  try {
    const user = await requirePermission("attendance.manage");

    const attendance = await prisma.staffAttendance.upsert({
      where: {
        staffId_attendanceDate: {
          staffId,
          attendanceDate: new Date(data.date.setHours(0, 0, 0, 0)),
        },
      },
      create: {
        staffId,
        attendanceDate: new Date(data.date.setHours(0, 0, 0, 0)),
        status: data.status,
        note: data.note,
        recordedByUserId: user.id,
      },
      update: {
        status: data.status,
        note: data.note,
        recordedByUserId: user.id,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE", // upsert is create/update
      tableName: "StaffAttendance",
      recordId: attendance.id,
      newValue: attendance,
    });

    revalidatePath("/attendance/staff");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function submitLeaveRequest(data: {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
}) {
  try {
    const user = await requirePermission("attendance.read"); // Anyone can apply

    // Get staff ID for current user
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { staff: true },
    });

    if (!dbUser?.staff)
      throw new Error("Only staff members can apply for leave");

    // Get active academic year
    const activeYear = await getActiveAcademicYear();
    if (!activeYear) throw new Error("No active academic year found");

    const request = await prisma.leaveRequest.create({
      data: {
        staffId: dbUser.staff.id,
        academicYearId: activeYear.id,
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
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}

export async function decideLeaveRequest(
  requestId: string,
  decision: "APPROVED" | "REJECTED",
  note?: string,
) {
  try {
    const user = await requirePermission("system.manage"); // Only admin/manager can approve

    await prisma.leaveRequest.update({
      where: { id: requestId },
      data: {
        status: decision,
        decidedAt: new Date(),
        decidedByUserId: user.id,
        decisionNote: note,
      },
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "UPDATE",
      tableName: "LeaveRequest",
      recordId: requestId,
      note: `Decision: ${decision}`,
    });

    revalidatePath("/leave");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, message: getErrorMessage(error) };
  }
}
