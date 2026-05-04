import prisma from '@/lib/prisma';

const getTodayRange = () => ({
  gte: new Date(new Date().setHours(0, 0, 0, 0)),
  lt: new Date(new Date().setHours(23, 59, 59, 999)),
});

// ============ COMMON DATA (All Roles) ============
export const getCommonDashboardData = async () => {
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
};

// ============ ADMIN DASHBOARD DATA ============
export const getAdminDashboardData = async () => {
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
    // School-wide student count
    prisma.student.count({
      where: { isDeleted: false, status: 'ACTIVE' },
    }),
    // School-wide staff count
    prisma.staff.count({
      where: { isDeleted: false },
    }),
    // Total fees collected
    prisma.feePayment.aggregate({
      where: { isDeleted: false },
      _sum: { amountPaid: true },
    }),
    // Pending leave requests
    prisma.leaveRequest.count({
      where: {
        status: 'PENDING',
        isDeleted: false,
      },
    }),
    // Recent audit logs
    prisma.auditLog.findMany({
      take: 6,
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
    // Outstanding fees
    prisma.feeRecord.aggregate({
      where: { isDeleted: false },
      _sum: { outstandingAmount: true },
    }),
    // Staff attendance today
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
    prisma.$queryRaw<any[]>`
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
    // Upcoming fees (due within 7 days)
    prisma.feeRecord.findMany({
      where: {
        isDeleted: false,
        outstandingAmount: { gt: 0 },
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
      },
      include: { student: true, feeStructure: true },
      take: 5,
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  return {
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
  };
};

// ============ TEACHER DASHBOARD DATA ============
export const getTeacherDashboardData = async (staffId: string) => {
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
      take: 10,
    }),
    // Pending leave requests from students
    prisma.leaveRequest.count({
      where: {
        status: 'PENDING',
        isDeleted: false,
        // Could filter by students in teacher's classes if needed
      },
    }),
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
};

// ============ ACCOUNTANT DASHBOARD DATA ============
export const getAccountantDashboardData = async () => {
  const [
    totalCollection,
    outstandingBalance,
    upcomingFees,
    overdueFees,
    feePaymentsRecent,
    feeStructures,
    classWiseFeeStatus,
  ] = await Promise.all([
    // Total fees collected
    prisma.feePayment.aggregate({
      where: { isDeleted: false },
      _sum: { amountPaid: true },
    }),
    // Outstanding fees
    prisma.feeRecord.aggregate({
      where: { isDeleted: false },
      _sum: { outstandingAmount: true },
    }),
    // Fees due within 7 days
    prisma.feeRecord.findMany({
      where: {
        isDeleted: false,
        outstandingAmount: { gt: 0 },
        dueDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lte: new Date(new Date().setDate(new Date().getDate() + 7)),
        },
      },
      include: { student: true, feeStructure: true },
      take: 5,
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
      take: 5,
      orderBy: { dueDate: 'asc' },
    }),
    // Recent fee payments
    prisma.feePayment.findMany({
      where: { isDeleted: false },
      include: { feeRecord: { include: { student: true, feeStructure: true } } },
      orderBy: { paidAt: 'desc' },
      take: 10,
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
    totalCollection,
    outstandingBalance,
    upcomingFees,
    overdueFees,
    feePaymentsRecent,
    feeStructures,
    classWiseFeeStatus,
  };
};
