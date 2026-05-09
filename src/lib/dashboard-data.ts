import prisma from '@/lib/prisma';

// ============ CONSTANTS ============
const DASHBOARD_RECENT_LOGS_LIMIT = 6;
const DASHBOARD_UPCOMING_FEES_DAYS = 7;
const DASHBOARD_UPCOMING_FEES_LIMIT = 5;
const DASHBOARD_RECENT_ATTENDANCE_LIMIT = 10;
const DASHBOARD_RECENT_PAYMENTS_LIMIT = 10;

// ============ TYPES ============
export interface DashboardAnnouncements {
  announcements: any[]; // Replace with actual Prisma type if available
}

export interface AttendanceHistoryEntry {
  date: Date;
  rate: number;
}

export interface AdminDashboardData {
  studentCount: number;
  staffCount: number;
  totalCollection: { _sum: { amountPaid: number | null } };
  pendingLeaveCount: number;
  recentLogs: any[];
  presentToday: number;
  totalAttendanceToday: number;
  outstandingBalance: { _sum: { outstandingAmount: number | null } };
  staffPresentToday: number;
  staffAbsentToday: number;
  staffOnLeaveToday: number;
  attendanceHistory: AttendanceHistoryEntry[];
  studentEnrollments: any[];
  staffList: any[];
  upcomingFees: any[];
}

/**
 * Returns a Prisma-compatible date range for today (00:00:00 to 23:59:59).
 */
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  
  return { gte: start, lt: end };
};

/**
 * Fetches recent announcements for the common dashboard view.
 */
export async function getCommonDashboardData(): Promise<DashboardAnnouncements> {
  const announcements = await prisma.announcement.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
  });

  return { announcements };
}

// ============ ATOMIC QUERIES (Shared) ============

/**
 * Gets the total count of active students.
 */
async function getStudentCount() {
  return prisma.student.count({
    where: { isDeleted: false, status: 'ACTIVE' },
  });
}

/**
 * Gets the total count of active staff.
 */
async function getStaffCount() {
  return prisma.staff.count({
    where: { isDeleted: false },
  });
}

/**
 * Gets total fee collection aggregate.
 */
async function getTotalCollection() {
  return prisma.feePayment.aggregate({
    where: { isDeleted: false },
    _sum: { amountPaid: true },
  });
}

/**
 * Gets total outstanding balance aggregate.
 */
async function getOutstandingBalance() {
  return prisma.feeRecord.aggregate({
    where: { isDeleted: false },
    _sum: { outstandingAmount: true },
  });
}

/**
 * Gets count of pending leave requests.
 */
async function getPendingLeaveCount() {
  return prisma.leaveRequest.count({
    where: {
      status: 'PENDING',
      isDeleted: false,
    },
  });
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
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    }),
    // Student attendance today
    prisma.studentAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: 'PRESENT',
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
        status: 'PRESENT',
        isDeleted: false,
      },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: 'ABSENT',
        isDeleted: false,
      },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: 'ON_LEAVE',
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
          lte: new Date(new Date().getTime() + DASHBOARD_UPCOMING_FEES_DAYS * 24 * 60 * 60 * 1000),
        },
      },
      include: { student: true, feeStructure: true },
      take: DASHBOARD_UPCOMING_FEES_LIMIT,
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  return {
    studentCount,
    staffCount,
    totalCollection: {
      _sum: {
        amountPaid: totalCollection._sum.amountPaid ? Number(totalCollection._sum.amountPaid) : 0
      }
    },
    pendingLeaveCount,
    recentLogs,
    presentToday,
    totalAttendanceToday,
    outstandingBalance: {
      _sum: {
        outstandingAmount: outstandingBalance._sum.outstandingAmount ? Number(outstandingBalance._sum.outstandingAmount) : 0
      }
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

export interface TeacherDashboardData {
  classTeacherAssignments: any[];
  studentEnrollmentsInClasses: any[];
  attendanceSummary: {
    presentToday: number;
    totalToday: number;
    rate: number;
  };
  recentStudentAttendance: any[];
  pendingLeaveCount: number;
  assignedClasses: any[];
}

export interface AccountantDashboardData {
  totalCollection: { _sum: { amountPaid: number | null } };
  outstandingBalance: { _sum: { outstandingAmount: number | null } };
  upcomingFees: any[];
  overdueFees: any[];
  feePaymentsRecent: any[];
  feeStructures: any[];
  classWiseFeeStatus: any[];
}

/**
 * Aggregates all necessary data for the Teacher Dashboard.
 */
export async function getTeacherDashboardData(staffId: string): Promise<TeacherDashboardData> {
  // Get classes assigned to this teacher
  const classTeacherAssignments = await prisma.classTeacherAssignment.findMany({
    where: {
      staffId,
      isDeleted: false,
    },
    include: {
      academicYear: true,
      class: true,
    },
  });

  const classIds = classTeacherAssignments.map((a) => a.classId);

  if (classIds.length === 0) {
    return {
      classTeacherAssignments: [],
      studentEnrollmentsInClasses: [],
      attendanceSummary: { presentToday: 0, totalToday: 0, rate: 0 },
      recentStudentAttendance: [],
      pendingLeaveCount: 0,
      assignedClasses: [],
    };
  }

  const [
    studentEnrollmentsInClasses,
    presentToday,
    totalAttendanceToday,
    recentStudentAttendance,
    pendingLeaveCount,
  ] = await Promise.all([
    // Students in teacher's classes
    prisma.studentEnrollment.findMany({
      where: {
        classId: { in: classIds },
        academicYear: { isActive: true },
      },
      include: { class: true, student: true },
    }),
    // Present today in teacher's classes
    prisma.studentAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        status: 'PRESENT',
        isDeleted: false,
        student: {
          enrollments: {
            some: {
              classId: { in: classIds },
            },
          },
        },
      },
    }),
    // Total attendance today in teacher's classes
    prisma.studentAttendance.count({
      where: {
        attendanceDate: getTodayRange(),
        isDeleted: false,
        student: {
          enrollments: {
            some: {
              classId: { in: classIds },
            },
          },
        },
      },
    }),
    // Recent attendance records
    prisma.studentAttendance.findMany({
      where: {
        student: {
          enrollments: {
            some: {
              classId: { in: classIds },
            },
          },
        },
        isDeleted: false,
      },
      include: { student: true },
      orderBy: { attendanceDate: 'desc' },
      take: DASHBOARD_RECENT_ATTENDANCE_LIMIT,
    }),
    getPendingLeaveCount(),
  ]);

  const attendanceRate =
    totalAttendanceToday > 0 ? Math.round((presentToday / totalAttendanceToday) * 100) : 0;

  return {
    classTeacherAssignments,
    studentEnrollmentsInClasses,
    attendanceSummary: {
      presentToday,
      totalToday: totalAttendanceToday,
      rate: attendanceRate,
    },
    recentStudentAttendance,
    pendingLeaveCount,
    assignedClasses: classTeacherAssignments.map((a) => a.class),
  };
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
      orderBy: { dueDate: 'asc' },
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
      orderBy: { dueDate: 'asc' },
    }),
    // Recent fee payments
    prisma.feePayment.findMany({
      where: { isDeleted: false },
      include: { feeRecord: { include: { student: true, feeStructure: true } } },
      orderBy: { paidAt: 'desc' },
      take: DASHBOARD_RECENT_PAYMENTS_LIMIT,
    }),
    // Fee structures
    prisma.feeStructure.findMany({
      where: { isDeleted: false },
      include: { class: true },
    }),
    // Fee status by class
    prisma.$queryRaw<any[]>`
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
        amountPaid: totalCollection._sum.amountPaid ? Number(totalCollection._sum.amountPaid) : 0
      }
    },
    outstandingBalance: {
      _sum: {
        outstandingAmount: outstandingBalance._sum.outstandingAmount ? Number(outstandingBalance._sum.outstandingAmount) : 0
      }
    },
    upcomingFees,
    overdueFees,
    feePaymentsRecent,
    feeStructures,
    classWiseFeeStatus,
  };
}
