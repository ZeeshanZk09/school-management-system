import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { StaffAttendanceForm } from "./staff-attendance-form";

export default async function StaffAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  await requirePermission("attendance.manage");
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const [staffMembers, existingAttendance] = await Promise.all([
    prisma.staff.findMany({
      where: { isDeleted: false },
      orderBy: { fullName: "asc" },
    }),
    prisma.staffAttendance.findMany({
      where: {
        attendanceDate: selectedDate,
        isDeleted: false,
      },
    }),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Staff Attendance
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Mark daily attendance for all active staff members.
          </p>
        </div>
      </div>

      <StaffAttendanceForm
        staffMembers={staffMembers}
        existingAttendance={existingAttendance}
        date={selectedDate}
      />
    </div>
  );
}
