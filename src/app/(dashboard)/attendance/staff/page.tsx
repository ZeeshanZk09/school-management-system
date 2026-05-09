import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { StaffAttendanceForm } from './staff-attendance-form';
import { PageHeader } from '@/components/dashboard/page-header';

export default async function StaffAttendancePage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ date?: string }>;
}>) {
  await requirePermission('attendance.manage');
  const params = await searchParams;
  const selectedDate = params.date ? new Date(params.date) : new Date();
  selectedDate.setHours(0, 0, 0, 0);

  const [staff, existing] = await Promise.all([
    prisma.staff.findMany({
      where: { isDeleted: false },
      orderBy: { fullName: 'asc' },
    }),
    prisma.staffAttendance.findMany({
      where: {
        attendanceDate: selectedDate,
        isDeleted: false,
      },
    }),
  ]);

  const staffMembers = staff.map((s) => ({
    id: s.id,
    fullName: s.fullName,
    employeeId: s.staffNumber,
    designation: s.designation,
  }));

  const existingAttendance = existing.map((a) => ({
    staffId: a.staffId,
    status: a.status,
    note: a.note ?? '',
  }));

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <PageHeader
        title='Staff Attendance'
        description='Mark daily attendance for all active staff members.'
      />

      <StaffAttendanceForm
        staffMembers={staffMembers}
        existingAttendance={existingAttendance}
        date={selectedDate}
      />
    </div>
  );
}
