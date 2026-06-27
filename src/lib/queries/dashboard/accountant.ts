import prisma from "@/lib/prisma";
import {
  getTotalCollection,
  getOutstandingBalance,
  DASHBOARD_UPCOMING_FEES_DAYS,
  DASHBOARD_UPCOMING_FEES_LIMIT,
  DASHBOARD_RECENT_PAYMENTS_LIMIT,
} from "./helpers";

import type {
  FeeRecord,
  Student,
  FeeStructure,
  FeePayment,
  Class,
} from "@/lib/generated/prisma/client";

export interface ClassWiseFeeStatus {
  class_name: string;
  total_students: number;
  pending_count: number;
  total_pending: number | null;
}

export interface AccountantDashboardData {
  totalCollection: { _sum: { amountPaid: number | null } };
  outstandingBalance: { _sum: { outstandingAmount: number | null } };
  upcomingFees: (FeeRecord & { student: Student; feeStructure: FeeStructure })[];
  overdueFees: (FeeRecord & { student: Student; feeStructure: FeeStructure })[];
  feePaymentsRecent: (FeePayment & {
    feeRecord: FeeRecord & { student: Student; feeStructure: FeeStructure };
  })[];
  feeStructures: (FeeStructure & { class: Class })[];
  classWiseFeeStatus: ClassWiseFeeStatus[];
}

/**
 * Aggregates all necessary data for the Accountant Dashboard.
 */
export async function getAccountantDashboardData(): Promise<AccountantDashboardData> {
  const [
    totalCollection,
    outstandingBalance,
    upcomingFees,
    overdueFees,
    feePaymentsRecent,
    feeStructures,
    classWiseFeeStatus,
  ] = await Promise.all([
    getTotalCollection(),
    getOutstandingBalance(),
    // Fees due within DASHBOARD_UPCOMING_FEES_DAYS
    prisma.feeRecord.findMany({
      where: {
        isDeleted: false,
        outstandingAmount: { gt: 0 },
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setDate(new Date().getDate() + DASHBOARD_UPCOMING_FEES_DAYS)),
        },
      },
      include: { student: true, feeStructure: true },
      take: DASHBOARD_UPCOMING_FEES_LIMIT,
      orderBy: { dueDate: "asc" },
    }),
    // Overdue fees
    prisma.feeRecord.findMany({
      where: {
        isDeleted: false,
        outstandingAmount: { gt: 0 },
        dueDate: {
          lt: new Date(),
        },
      },
      include: { student: true, feeStructure: true },
      take: DASHBOARD_UPCOMING_FEES_LIMIT,
      orderBy: { dueDate: "asc" },
    }),
    // Recent fee payments
    prisma.feePayment.findMany({
      where: { isDeleted: false },
      include: { feeRecord: { include: { student: true, feeStructure: true } } },
      orderBy: { paidAt: "desc" },
      take: DASHBOARD_RECENT_PAYMENTS_LIMIT,
    }),
    // Fee structures
    prisma.feeStructure.findMany({
      where: { isDeleted: false },
      include: { class: true },
    }),
    // Fee status by class
    prisma.$queryRaw<
      Array<{
        class_name: string;
        total_students: number;
        pending_count: number;
        total_pending: number;
      }>
    >`
      SELECT 
        c.name as class_name,
        COUNT(DISTINCT f.student_id) as total_students,
        COUNT(CASE WHEN f.outstanding_amount > 0 THEN 1 END) as pending_count,
        SUM(f.outstanding_amount) as total_pending
      FROM "FeeRecord" f
      JOIN "StudentEnrollment" se ON f.student_id = se.student_id
      JOIN "Class" c ON se.class_id = c.id
      WHERE f.is_deleted = false AND se.academic_year_id IN (
        SELECT id FROM "AcademicYear" WHERE is_active = true
      )
      GROUP BY c.id, c.name
      ORDER BY c.name
    `,
  ]);

  return {
    totalCollection: {
      _sum: {
        amountPaid: totalCollection._sum.amountPaid ? Number(totalCollection._sum.amountPaid) : 0,
      },
    },
    outstandingBalance: {
      _sum: {
        outstandingAmount: outstandingBalance._sum.outstandingAmount
          ? Number(outstandingBalance._sum.outstandingAmount)
          : 0,
      },
    },
    upcomingFees,
    overdueFees,
    feePaymentsRecent,
    feeStructures,
    classWiseFeeStatus,
  };
}
