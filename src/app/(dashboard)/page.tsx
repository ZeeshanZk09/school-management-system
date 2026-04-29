import { format } from 'date-fns';
import {
  Bell,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  GraduationCap,
  History,
  Megaphone,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';

export default async function DashboardPage() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes('ADMIN');

  const [
    studentCount,
    staffCount,
    totalCollection,
    recentLogs,
    presentToday,
    totalAttendanceToday,
    _outstandingBalance,
    announcements,
    staffPresentToday,
    staffAbsentToday,
    staffOnLeaveToday,
    attendanceHistory,
    studentEnrollments,
    staffList,
    upcomingFees,
  ] = await Promise.all([
    prisma.student.count({ where: { isDeleted: false, status: 'ACTIVE' } }),
    prisma.staff.count({ where: { isDeleted: false } }),
    prisma.feePayment.aggregate({
      where: { isDeleted: false },
      _sum: { amountPaid: true },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    }),
    prisma.studentAttendance.count({
      where: {
        attendanceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: 'PRESENT',
        isDeleted: false,
      },
    }),
    prisma.studentAttendance.count({
      where: {
        attendanceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        isDeleted: false,
      },
    }),
    prisma.feeRecord.aggregate({
      where: { isDeleted: false },
      _sum: { outstandingAmount: true },
    }),
    prisma.announcement.findMany({
      where: {
        isDeleted: false,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: 'PRESENT',
        isDeleted: false,
      },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: 'ABSENT',
        isDeleted: false,
      },
    }),
    prisma.staffAttendance.count({
      where: {
        attendanceDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
        status: 'ON_LEAVE',
        isDeleted: false,
      },
    }),
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
    prisma.studentEnrollment.findMany({
      where: { academicYear: { isActive: true } },
      include: { class: true },
    }),
    prisma.staff.findMany({
      where: { isDeleted: false },
      select: { department: true },
    }),
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

  const classBreakdown = studentEnrollments.reduce((acc: any, curr) => {
    const className = curr.class.name;
    acc[className] = (acc[className] || 0) + 1;
    return acc;
  }, {});

  const deptBreakdown = staffList.reduce((acc: any, curr) => {
    const dept = curr.department || 'Unassigned';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const attendanceRate =
    totalAttendanceToday > 0 ? Math.round((presentToday / totalAttendanceToday) * 100) : 0;

  const stats = [
    {
      title: 'Total Students',
      value: studentCount.toString(),
      icon: GraduationCap,
      description: 'Active enrollments',
      color: 'blue',
    },
    {
      title: 'Staff Presence',
      value: `${staffPresentToday} / ${staffCount}`,
      icon: Briefcase,
      description: `${staffAbsentToday} Absent • ${staffOnLeaveToday} Leave`,
      color: 'emerald',
    },
    {
      title: 'Total Collection',
      value: `Rs${(Number(totalCollection._sum.amountPaid) || 0).toLocaleString()}`,
      icon: DollarSign,
      description: 'Fees received',
      color: 'amber',
      adminOnly: true,
    },
    {
      title: 'Attendance',
      value: `${attendanceRate}%`,
      icon: Users,
      description: 'Present today',
      color: 'indigo',
    },
  ].filter((stat) => !stat.adminOnly || isAdmin);

  return (
    <div className='space-y-8 animate-in fade-in duration-700'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-4xl font-black tracking-tight font-outfit text-slate-900 dark:text-white'>
            Welcome back, <span className='text-primary'>{user.fullName.split(' ')[0]}</span>
          </h1>
          <p className='text-slate-500 dark:text-slate-400 font-medium'>
            Here's what's happening at your school today.
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <Button
            variant='outline'
            className='h-11 rounded-xl bg-white dark:bg-slate-900 border-none shadow-sm'
          >
            <Calendar className='mr-2 h-4 w-4' />
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </Button>
          <Button className='gradient-primary h-11 px-6 rounded-xl shadow-lg shadow-blue-500/20'>
            <Bell className='mr-2 h-4 w-4' />
            Notifications
          </Button>
        </div>
      </div>

      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {stats.map((stat, i) => (
          <Card key={i} className='border-none shadow-sm glass hover-lift overflow-hidden group'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div
                  className={cn(
                    'p-3 rounded-2xl group-hover:scale-110 transition-transform',
                    stat.color === 'blue'
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                      : stat.color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : stat.color === 'amber'
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400'
                  )}
                >
                  <stat.icon className='h-6 w-6' />
                </div>
                {stat.title === 'Attendance' && attendanceHistory.length > 0 && (
                  <div className='flex items-end gap-0.5 h-8'>
                    {attendanceHistory.map((day, idx) => (
                      <div
                        key={idx}
                        className='w-1.5 bg-primary/20 rounded-full'
                        style={{ height: `${Math.max(day.rate, 20)}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className='space-y-1'>
                <p className='text-sm font-bold text-slate-400 uppercase tracking-widest'>
                  {stat.title}
                </p>
                <h3 className='text-3xl font-black font-outfit'>{stat.value}</h3>
                <p className='text-xs text-slate-500 font-medium'>{stat.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {announcements.length > 0 && (
        <div className='grid gap-6'>
          <Card className='border-none shadow-sm bg-gradient-to-r from-blue-600 to-indigo-700 text-white overflow-hidden relative group'>
            <div className='absolute right-0 top-0 p-8 opacity-10 group-hover:scale-110 transition-transform'>
              <Megaphone className='h-32 w-32 -mr-12 -mt-12' />
            </div>
            <CardContent className='p-8 relative z-10'>
              <div className='flex items-center gap-2 mb-4'>
                <Badge className='bg-white/20 text-white border-none backdrop-blur-md'>
                  NEW ANNOUNCEMENT
                </Badge>
                <span className='text-xs font-medium opacity-80'>
                  {new Date(announcements[0].publishedAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className='text-3xl font-black mb-2 font-outfit tracking-tight'>
                {announcements[0].title}
              </h2>
              <p className='text-blue-50 text-lg opacity-90 max-w-2xl line-clamp-2'>
                {announcements[0].body}
              </p>
              <Button
                asChild
                variant='secondary'
                className='mt-6 bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 rounded-xl h-11'
              >
                <Link href='/announcements'>Read More</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className='grid gap-6 md:grid-cols-7'>
        <Card
          className={cn(
            'border-none shadow-sm glass overflow-hidden',
            isAdmin ? 'md:col-span-4' : 'md:col-span-7'
          )}
        >
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='text-xl font-bold font-outfit'>Class Distribution</CardTitle>
                <CardDescription>Enrollment breakdown by academic grade.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Object.entries(classBreakdown).map(([className, count]: [string, any]) => (
                <div key={className} className='space-y-1'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium text-slate-700 dark:text-slate-300'>
                      {className}
                    </span>
                    <span className='font-bold'>{count} Students</span>
                  </div>
                  <div className='h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary rounded-full transition-all duration-500'
                      style={{ width: `${(count / studentCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className='md:col-span-3 border-none shadow-sm glass overflow-hidden'>
            <CardHeader>
              <CardTitle className='text-xl font-bold font-outfit'>Upcoming Fee Dues</CardTitle>
              <CardDescription>Fees due in the next 7 days.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {upcomingFees.length === 0 ? (
                  <p className='text-sm text-slate-400 text-center py-8 italic'>
                    No upcoming dues found.
                  </p>
                ) : (
                  upcomingFees.map((fee) => (
                    <div
                      key={fee.id}
                      className='flex items-center justify-between p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800'
                    >
                      <div className='flex flex-col'>
                        <span className='text-sm font-bold truncate max-w-[150px]'>
                          {fee.student.fullName}
                        </span>
                        <span className='text-[10px] text-slate-500 uppercase tracking-wider'>
                          {fee.feeStructure.name}
                        </span>
                      </div>
                      <div className='flex flex-col items-end'>
                        <span className='text-sm font-black text-rose-600'>
                          ${Number(fee.outstandingAmount).toLocaleString()}
                        </span>
                        <span className='text-[10px] text-slate-400 font-medium'>
                          Due: {format(new Date(fee.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button
                asChild
                variant='outline'
                className='w-full mt-6 rounded-xl border-slate-100 dark:border-slate-800'
              >
                <Link href='/finance/records'>View All Records</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className='grid gap-6 md:grid-cols-7'>
        <Card
          className={cn(
            'border-none shadow-sm glass overflow-hidden',
            isAdmin ? 'md:col-span-3' : 'md:col-span-7'
          )}
        >
          <CardHeader>
            <CardTitle className='text-xl font-bold font-outfit'>Departmental Workforce</CardTitle>
            <CardDescription>Staff distribution by department.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {Object.entries(deptBreakdown).map(([dept, count]: [string, any]) => (
                <div
                  key={dept}
                  className='flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800'
                >
                  <span className='text-sm font-bold'>{dept}</span>
                  <Badge variant='secondary' className='bg-primary/10 text-primary border-none'>
                    {count} Staff
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className='md:col-span-4 border-none shadow-sm glass overflow-hidden'>
            <CardHeader>
              <CardTitle className='text-xl font-bold font-outfit'>Recent Activity</CardTitle>
              <CardDescription>Latest system changes and updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-6'>
                {recentLogs.length === 0 ? (
                  <p className='text-sm text-slate-400 text-center py-8'>No recent activity.</p>
                ) : (
                  recentLogs.map((log) => (
                    <div
                      key={log.id}
                      className='flex gap-4 relative pl-4 border-l-2 border-slate-100 dark:border-slate-800'
                    >
                      <div className='absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-primary' />
                      <div className='flex flex-col gap-1 min-w-0'>
                        <p className='text-sm font-bold text-slate-900 dark:text-white truncate'>
                          {log.action} {log.tableName}
                        </p>
                        <div className='flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider'>
                          <History className='h-3 w-3' />
                          {log.actor?.fullName || 'System'}
                          <Clock className='h-3 w-3 ml-1' />
                          {format(new Date(log.createdAt), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <Button
                asChild
                variant='outline'
                className='w-full mt-8 rounded-xl border-slate-100 dark:border-slate-800'
              >
                <Link href='/audit-logs'>View All Logs</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
