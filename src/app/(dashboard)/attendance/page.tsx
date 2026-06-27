import { Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getActiveAcademicYear } from "@/lib/academic-year";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { AttendanceEntry, type AttendanceStudent } from "./attendance-entry";

import { PageHeader } from "@/components/dashboard/page-header";

export default async function AttendancePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    classId?: string;
    sectionId?: string;
    sessionId?: string;
    date?: string;
  }>;
}>) {
  // ... rest of logic ...
  const user = await requirePermission("attendance.read");
  const isTeacher = user.roles.includes("TEACHER");
  const params = await searchParams;

  const allClasses = await prisma.class.findMany({
    where: { isDeleted: false },
    include: { sections: { where: { isDeleted: false } } },
    orderBy: { name: "asc" },
  });

  // Teachers only see their own assigned classes
  let classes = allClasses;
  if (isTeacher && user.assignedClasses && user.assignedClasses.length > 0) {
    const assignedClassIds = new Set(user.assignedClasses.map((a) => a.classId));
    classes = allClasses.filter((c) => assignedClassIds.has(c.id));
  }

  const [sessions, academicYear] = await Promise.all([
    prisma.attendanceSession.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    getActiveAcademicYear(),
  ]);

  const selectedClassId = params.classId || "";
  const selectedSectionId = params.sectionId || "";
  const selectedSessionId = params.sessionId || sessions[0]?.id || "";
  const selectedDate = params.date || new Date().toISOString().split("T")[0];
  let students: AttendanceStudent[] = [];
  if (selectedClassId && selectedSectionId) {
    const rawStudents = await prisma.student.findMany({
      where: {
        isDeleted: false,
        status: "ACTIVE",
        enrollments: {
          some: {
            classId: selectedClassId,
            sectionId: selectedSectionId,
            academicYearId: academicYear?.id,
          },
        },
      },
      include: {
        // Today's session attendance (for existing-record detection)
        attendance: {
          where: {
            attendanceDate: new Date(selectedDate),
            sessionId: selectedSessionId,
          },
        },
        // Full-year attendance for rate calculation
        _count: {
          select: {
            attendance: {
              where: {
                isDeleted: false,
                academicYearId: academicYear?.id,
              },
            },
          },
        },
      },
      orderBy: { fullName: "asc" },
    });

    // Compute per-student present counts for rate
    const studentIds = rawStudents.map((s) => s.id);
    const presentCounts = await prisma.studentAttendance.groupBy({
      by: ["studentId"],
      where: {
        studentId: { in: studentIds },
        status: "PRESENT",
        isDeleted: false,
        academicYearId: academicYear?.id,
      },
      _count: { id: true },
    });
    const presentMap = Object.fromEntries(presentCounts.map((p) => [p.studentId, p._count.id]));

    students = rawStudents.map((s) => {
      const total = s._count.attendance;
      const present = presentMap[s.id] ?? 0;
      const attendanceRate = total > 0 ? Math.round((present / total) * 100) : undefined;
      return {
        id: s.id,
        fullName: s.fullName,
        admissionNumber: s.admissionNumber,
        attendanceRate,
        attendance: s.attendance,
      };
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Daily Attendance"
        description="Record and monitor student presence across sessions."
      />

      <Card className="border-none shadow-sm glass overflow-hidden">
        <CardContent className="p-6">
          <form
            action="/attendance"
            method="GET"
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="grid gap-2">
              <label
                htmlFor="classId"
                className="text-xs font-bold uppercase text-slate-400 tracking-wider"
              >
                Class
              </label>
              <Select name="classId" defaultValue={selectedClassId}>
                <SelectTrigger id="classId" className="bg-slate-50 dark:bg-slate-900 border-none">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="sectionId"
                className="text-xs font-bold uppercase text-slate-400 tracking-wider"
              >
                Section
              </label>
              <Select name="sectionId" defaultValue={selectedSectionId}>
                <SelectTrigger id="sectionId" className="bg-slate-50 dark:bg-slate-900 border-none">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .find((c) => c.id === selectedClassId)
                    ?.sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="sessionId"
                className="text-xs font-bold uppercase text-slate-400 tracking-wider"
              >
                Session
              </label>
              <Select name="sessionId" defaultValue={selectedSessionId}>
                <SelectTrigger id="sessionId" className="bg-slate-50 dark:bg-slate-900 border-none">
                  <SelectValue placeholder="Select Session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="gradient-primary h-10">
              <Search className="mr-2 h-4 w-4" />
              Load Students
            </Button>
          </form>
        </CardContent>
      </Card>

      {selectedClassId && selectedSectionId ? (
        <AttendanceEntry
          students={students}
          classId={selectedClassId}
          sectionId={selectedSectionId}
          sessionId={selectedSessionId}
          academicYearId={academicYear?.id || ""}
          date={selectedDate}
        />
      ) : (
        <div className="h-64 flex flex-col items-center justify-center bg-white/30 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <Users className="h-12 w-12 text-slate-300 mb-2" />
          <p className="text-slate-500 font-medium">
            Select a class and section to begin recording attendance.
          </p>
        </div>
      )}
    </div>
  );
}
