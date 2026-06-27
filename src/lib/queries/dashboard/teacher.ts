import prisma from "@/lib/prisma";
import { getTodayRange, getPendingLeaveCount, DASHBOARD_RECENT_ATTENDANCE_LIMIT } from "./helpers";

import type {
  ClassTeacherAssignment,
  StudentEnrollment,
  StudentAttendance,
  Class,
  Student,
  AcademicYear,
} from "@/lib/generated/prisma/client";

export interface TeacherDashboardData {
  classTeacherAssignments: (ClassTeacherAssignment & {
    class: Class;
    academicYear: AcademicYear;
  })[];
  studentEnrollmentsInClasses: (StudentEnrollment & {
    class: Class;
    student: Student;
  })[];
  attendanceSummary: {
    presentToday: number;
    totalToday: number;
    rate: number;
  };
  recentStudentAttendance: (StudentAttendance & {
    student: Student;
  })[];
  pendingLeaveCount: number;
  assignedClasses: Class[];
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
        status: "PRESENT",
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
      orderBy: { attendanceDate: "desc" },
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
