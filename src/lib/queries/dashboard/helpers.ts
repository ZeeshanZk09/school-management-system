import prisma from "@/lib/prisma";
import type { Decimal } from "@prisma/client/runtime/client";

export const getTodayRange = (): { gte: Date; lt: Date } => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { gte: start, lt: end };
};

export async function getStudentCount(): Promise<number> {
  return prisma.student.count({
    where: { isDeleted: false, status: "ACTIVE" },
  });
}

export async function getStaffCount(): Promise<number> {
  return prisma.staff.count({
    where: { isDeleted: false },
  });
}

export async function getTotalCollection(): Promise<{
  _sum: {
    amountPaid: Decimal | null;
  };
}> {
  return prisma.feePayment.aggregate({
    where: { isDeleted: false },
    _sum: { amountPaid: true },
  });
}

export async function getOutstandingBalance(): Promise<{
  _sum: {
    outstandingAmount: Decimal | null;
  };
}> {
  return prisma.feeRecord.aggregate({
    where: { isDeleted: false },
    _sum: { outstandingAmount: true },
  });
}

export async function getPendingLeaveCount(): Promise<number> {
  return prisma.leaveRequest.count({
    where: {
      status: "PENDING",
      isDeleted: false,
    },
  });
}
export const DASHBOARD_RECENT_LOGS_LIMIT = 6;
export const DASHBOARD_UPCOMING_FEES_DAYS = 7;
export const DASHBOARD_UPCOMING_FEES_LIMIT = 5;
export const DASHBOARD_RECENT_ATTENDANCE_LIMIT = 10;
export const DASHBOARD_RECENT_PAYMENTS_LIMIT = 10;
