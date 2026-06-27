import prisma from "@/lib/prisma";
import {
  getTodayRange,
  getStudentCount,
  getStaffCount,
  getTotalCollection,
  getOutstandingBalance,
  getPendingLeaveCount,
  DASHBOARD_RECENT_LOGS_LIMIT,
  DASHBOARD_UPCOMING_FEES_DAYS,
  DASHBOARD_UPCOMING_FEES_LIMIT,
} from "./helpers";

export interface AttendanceHistoryEntry {
  date: Date;
  rate: number;
}

import type {
  AuditLog,
  User,
  StudentEnrollment,
  Class,
  FeeRecord,
  Student,
  FeeStructure,
} from "@/lib/generated/prisma/client";

export interface AdminDashboardData {
  studentCount: number;
  staffCount: number;
  totalCollection: { _sum: { amountPaid: number | null } };
  pendingLeaveCount: number;
  recentLogs: (AuditLog & { actor: User | null })[];
  presentToday: number;
  totalAttendanceToday: number;
  outstandingBalance: { _sum: { outstandingAmount: number | null } };
  staffPresentToday: number;
  staffAbsentToday: number;
  staffOnLeaveToday: number;
  attendanceHistory: AttendanceHistoryEntry[];
  studentEnrollments: (StudentEnrollment & { class: Class })[];
  staffList: { department: string | null }[];
  upcomingFees: (FeeRecord & { student: Student; feeStructure: FeeStructure })[];
}

/**
 * Aggregates all necessary data for the Admin Dashboard.
 */
export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  const [
    studentCount,
    staffCount,
    totalCollection,
    pendingLeaveCount,
    recentLogs,
    presentToday,
    totalAttendanceToday,
    outstandingBalance,
    staffPresentToday,
    staffAbsentToday,
    staffOnLeaveToday,
    attendanceHistory,
    studentEnrollments,
    staffList,
    upcomingFees,
  ] = await Promise.all([
    getStudentCount(),
    getStaffCount(),
    getTotalCollection(),
    getPendingLeaveCount(),
    // Recent audit logs
    prisma.auditLog.findMany({
      take: DASHBOARD_RECENT_LOGS_LIMIT,
      orderBy: { createdAt: "desc" },
      include: { actor: true },
    }),
    // Student attendance today
    prisma.studentAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: "PRESENT",
        isDeleted: false,
      },
    }),
    prisma.studentAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        isDeleted: false,
      },
    }),
    getOutstandingBalance(),
    // Staff attendance breakdown
    prisma.staffAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: "PRESENT",
        isDeleted: false,
      },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: "ABSENT",
        isDeleted: false,
      },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: "ON_LEAVE",
        isDeleted: false,
      },
    }),
    // 7-day attendance history
    prisma.$queryRaw<AttendanceHistoryEntry[]>`
      SELECT 
        CAST("attendanceDate" AS DATE) as date,
        CAST(COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) AS FLOAT) / NULLIF(CAST(COUNT(*) AS FLOAT), 0) * 100 as rate
      FROM "StudentAttendance"
      WHERE is_deleted = false 
      AND "attendanceDate" >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY CAST("attendanceDate" AS DATE)
      ORDER BY date ASC
    `,
    // Class breakdown
    prisma.studentEnrollment.findMany({
      where: { academicYear: { isActive: true } },
      include: { class: true },
    }),
    // Department breakdown
    prisma.staff.findMany({
      where: { isDeleted: false },
      select: { department: true },
    }),
    // Upcoming fees
    prisma.feeRecord.findMany({
      where: {
        isDeleted: false,
        outstandingAmount: { gt: 0 },
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(Date.now() + DASHBOARD_UPCOMING_FEES_DAYS * 24 * 60 * 60 * 1000),
        },
      },
      include: { student: true, feeStructure: true },
      take: DASHBOARD_UPCOMING_FEES_LIMIT,
      orderBy: { dueDate: "asc" },
    }),
  ]);

  return {
    studentCount,
    staffCount,
    totalCollection: {
      _sum: {
        amountPaid: totalCollection._sum.amountPaid ? Number(totalCollection._sum.amountPaid) : 0,
      },
    },
    pendingLeaveCount,
    recentLogs,
    presentToday,
    totalAttendanceToday,
    outstandingBalance: {
      _sum: {
        outstandingAmount: outstandingBalance._sum.outstandingAmount
          ? Number(outstandingBalance._sum.outstandingAmount)
          : 0,
      },
    },
    staffPresentToday,
    staffAbsentToday,
    staffOnLeaveToday,
    attendanceHistory,
    studentEnrollments,
    staffList,
    upcomingFees,
  };
}
