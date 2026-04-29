import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { AttendanceExportButtons } from "./export-buttons";

export default async function AttendanceReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    type?: string;
    classId?: string;
    month?: string;
    year?: string;
  }>;
}) {
  await requirePermission("attendance.manage");
  const params = await searchParams;
  const type = params.type || "student";
  const month = params.month
    ? parseInt(params.month, 10)
    : new Date().getMonth() + 1;
  const year = params.year
    ? parseInt(params.year, 10)
    : new Date().getFullYear();
  const classId = params.classId;

  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(startDate);

  // Fetch classes for filtering
  const classes = await prisma.class.findMany({ where: { isDeleted: false } });

  let reportData: any[] = [];

  if (type === "student" && classId) {
    const students = await prisma.student.findMany({
      where: {
        isDeleted: false,
        enrollments: {
          some: {
            classId: classId,
            academicYear: { isActive: true },
          },
        },
      },
      include: {
        attendance: {
          where: {
            attendanceDate: {
              gte: startDate,
              lte: endDate,
            },
            isDeleted: false,
          },
        },
      },
    });

    const _daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

    reportData = students.map((student) => {
      const present = student.attendance.filter(
        (a) => a.status === "PRESENT",
      ).length;
      const absent = student.attendance.filter(
        (a) => a.status === "ABSENT",
      ).length;
      const late = student.attendance.filter((a) => a.status === "LATE").length;
      const total = student.attendance.length;
      const rate = total > 0 ? Math.round((present / total) * 100) : 0;

      return {
        id: student.id,
        name: student.fullName,
        present,
        absent,
        late,
        rate,
        belowThreshold: rate < 75,
      };
    });
  } else if (type === "staff") {
    const staff = await prisma.staff.findMany({
      where: { isDeleted: false },
      include: {
        attendance: {
          where: {
            attendanceDate: {
              gte: startDate,
              lte: endDate,
            },
            isDeleted: false,
          },
        },
      },
    });

    reportData = staff.map((s) => {
      const present = s.attendance.filter((a) => a.status === "PRESENT").length;
      const absent = s.attendance.filter((a) => a.status === "ABSENT").length;
      const leave = s.attendance.filter((a) => a.status === "ON_LEAVE").length;
      const total = s.attendance.length;

      return {
        id: s.id,
        name: s.fullName,
        designation: s.designation,
        present,
        absent,
        leave,
        total,
      };
    });
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Attendance Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monthly summaries and institutional participation analysis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AttendanceExportButtons
            type={type as "student" | "staff"}
            month={month}
            year={year}
            classId={classId}
          />
        </div>
      </div>

      <Card className="border-none shadow-sm glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Type
              </label>
              <Select name="type" defaultValue={type}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-none shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student Attendance</SelectItem>
                  <SelectItem value="staff">Staff Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type === "student" && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Class
                </label>
                <Select name="classId" defaultValue={classId}>
                  <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-none shadow-sm">
                    <SelectValue placeholder="Select class" />
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
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Month
              </label>
              <Select name="month" defaultValue={month.toString()}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-none shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i} value={(i + 1).toString()}>
                      {format(new Date(2024, i), "MMMM")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="gradient-primary h-10 px-6 rounded-xl"
            >
              Generate Report
            </Button>
          </form>
        </CardContent>
      </Card>

      {reportData.length > 0 ? (
        <Card className="border-none shadow-sm glass overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
                <TableHead>
                  {type === "student" ? "Student Name" : "Staff Member"}
                </TableHead>
                <TableHead className="text-center">Present</TableHead>
                <TableHead className="text-center">Absent</TableHead>
                <TableHead className="text-center">
                  {type === "student" ? "Late" : "Leave"}
                </TableHead>
                <TableHead className="text-right">Rate / Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.map((row) => (
                <TableRow
                  key={row.id}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {row.name}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {type === "student"
                          ? `Roll #: ${row.rollNumber || "N/A"}`
                          : row.designation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold text-emerald-600 bg-emerald-50/20">
                    {row.present}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-rose-600 bg-rose-50/20">
                    {row.absent}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-amber-600 bg-amber-50/20">
                    {type === "student" ? row.late : row.leave}
                  </TableCell>
                  <TableCell className="text-right">
                    {type === "student" ? (
                      <Badge
                        className={
                          row.belowThreshold
                            ? "bg-rose-50 text-rose-600 border-none"
                            : "bg-emerald-50 text-emerald-600 border-none"
                        }
                      >
                        {row.rate}%
                      </Badge>
                    ) : (
                      <span className="font-bold text-slate-600">
                        {row.total} Days
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
          <CalendarIcon className="h-12 w-12 mb-2 opacity-20" />
          <p className="italic">
            Select filters and generate a report to see data.
          </p>
        </div>
      )}
    </div>
  );
}
