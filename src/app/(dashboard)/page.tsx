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
  TrendingUp,
  Users,
  Zap,
  Book,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { DashboardCharts } from '@/components/dashboard/dashboard-charts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireAuth } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { cn } from '@/lib/utils';
import {
  getAdminDashboardData,
  getTeacherDashboardData,
  getAccountantDashboardData,
  getCommonDashboardData,
} from '@/lib/dashboard-data';

const STAT_COLOR_STYLES: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-200 ring-1 ring-blue-500/20 group-hover:bg-blue-500 group-hover:text-white',
  emerald:
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white',
  amber:
    'bg-amber-500/10 text-amber-600 dark:text-amber-200 ring-1 ring-amber-500/20 group-hover:bg-amber-500 group-hover:text-white',
  indigo:
    'bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white',
  rose: 'bg-rose-500/10 text-rose-600 dark:text-rose-200 ring-1 ring-rose-500/20 group-hover:bg-rose-500 group-hover:text-white',
};

export default async function DashboardPage() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes('ADMIN');
  const isTeacher = user.roles.includes('TEACHER');
  const isAccountant = user.roles.includes('ACCOUNTANT');

  // Get common data for all roles
  const commonData = await getCommonDashboardData();

  // ==================== ADMIN DASHBOARD ====================
  if (isAdmin) {
    const adminData = await getAdminDashboardData();

    const classBreakdown = adminData.studentEnrollments.reduce((acc: any, curr) => {
      const className = curr.class.name;
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    }, {});

    const deptBreakdown = adminData.staffList.reduce((acc: any, curr) => {
      const dept = curr.department || 'Unassigned';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});

    const attendanceRate =
      adminData.totalAttendanceToday > 0
        ? Math.round((adminData.presentToday / adminData.totalAttendanceToday) * 100)
        : 0;

    const stats = [
      {
        title: 'Total Students',
        value: adminData.studentCount.toString(),
        icon: GraduationCap,
        description: 'Active enrollments',
        color: 'blue',
        trend: '+12% this month',
        href: '/students',
      },
      {
        title: 'Staff Presence',
        value: `${adminData.staffPresentToday} / ${adminData.staffCount}`,
        icon: Briefcase,
        description: `${adminData.staffAbsentToday} Absent • ${adminData.staffOnLeaveToday} Leave`,
        color: 'emerald',
        href: '/attendance/reports',
      },
      {
        title: 'Collected Fees',
        value: `Rs ${(Number(adminData.totalCollection._sum.amountPaid) || 0).toLocaleString()}`,
        icon: TrendingUp,
        description: 'Total revenue',
        color: 'indigo',
        href: '/finance/reports',
      },
      {
        title: 'Outstanding',
        value: `Rs ${(Number(adminData.outstandingBalance._sum.outstandingAmount) || 0).toLocaleString()}`,
        icon: DollarSign,
        description: 'Pending dues',
        color: 'rose',
        href: '/finance/records',
      },
      {
        title: 'Attendance',
        value: `${attendanceRate}%`,
        icon: Users,
        description: 'Present today',
        color: 'blue',
        href: '/attendance',
      },
      {
        title: 'Pending Leaves',
        value: adminData.pendingLeaveCount.toString(),
        icon: Calendar,
        description: 'Requests',
        color: 'amber',
        href: '/leave',
      },
    ];

    return (
      <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        {/* Hero Section */}
        <div className='relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 text-white shadow-2xl dark:bg-slate-950'>
          <div className='absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-primary/20 to-transparent pointer-events-none' />
          <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none' />

          <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8'>
            <div className='space-y-3'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md'>
                <Zap className='h-3 w-3 text-amber-400' />
                Administrator Dashboard
              </div>
              <h1 className='font-outfit text-4xl md:text-5xl font-black tracking-tight'>
                Welcome back, <span className='text-primary'>{user.fullName.split(' ')[0]}</span> 👋
              </h1>
              <p className='max-w-md text-base text-slate-400 font-medium leading-relaxed opacity-90'>
                Everything is running smoothly. Here is your overview for today.
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
              <div className=' flex-col items-end px-6 border-r border-white/10 hidden lg:flex'>
                <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1'>
                  Current Time
                </span>
                <span className='text-2xl font-black font-outfit tabular-nums'>
                  {format(new Date(), 'HH:mm')}
                </span>
              </div>
              <Button
                asChild
                className='h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 px-6 font-black shadow-xl transition-all hover:scale-105 active:scale-95'
              >
                <Link href='/attendance'>
                  <Calendar className='mr-2 h-4 w-4 text-primary' />
                  {format(new Date(), 'EEE, MMM dd')}
                </Link>
              </Button>
              <Button
                asChild
                className='gradient-primary h-12 px-6 rounded-2xl shadow-xl shadow-blue-500/25 font-black transition-all hover:scale-105 active:scale-95'
              >
                <Link href='/announcements'>
                  <Bell className='mr-2 h-4 w-4' />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href} className='group'>
              <Card className='relative overflow-hidden border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900 h-full'>
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5',
                    stat.color === 'blue' && 'bg-blue-600',
                    stat.color === 'emerald' && 'bg-emerald-600',
                    stat.color === 'amber' && 'bg-amber-600',
                    stat.color === 'indigo' && 'bg-indigo-600',
                    stat.color === 'rose' && 'bg-rose-600'
                  )}
                />

                <CardContent className='p-5'>
                  <div className='flex items-center justify-between mb-3'>
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg',
                        STAT_COLOR_STYLES[stat.color] || STAT_COLOR_STYLES.blue
                      )}
                    >
                      <stat.icon className='h-4 w-4' />
                    </div>
                  </div>

                  <div className='space-y-0.5 relative z-10'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]'>
                      {stat.title}
                    </p>
                    <h3 className='text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white'>
                      {stat.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Charts Section */}
        <DashboardCharts
          attendanceHistory={adminData.attendanceHistory}
          classBreakdown={classBreakdown}
          deptBreakdown={deptBreakdown}
        />

        {/* Main Grid */}
        <div className='grid gap-6 lg:grid-cols-12'>
          <div className='flex flex-col gap-6 lg:col-span-6'>
            {commonData.announcements.length > 0 && (
              <Card className='lg:col-span-4 group relative overflow-hidden rounded-[2rem] border-none bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-xl transition-all duration-500 hover:shadow-indigo-500/20'>
                <div className='absolute right-0 top-0 p-8 opacity-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12'>
                  <Megaphone className='h-48 w-48 -mr-16 -mt-16' />
                </div>
                <CardContent className='p-8 relative z-10'>
                  <div className='flex flex-wrap items-center gap-4 mb-6'>
                    <Badge className='bg-white/20 text-white border-none backdrop-blur-xl px-4 py-1.5 text-[10px] font-black tracking-[0.2em]'>
                      PRIORITY NOTICE
                    </Badge>
                    <span className='text-xs font-bold opacity-70 flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      {format(new Date(commonData.announcements[0].publishedAt), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                  <h2 className='text-3xl md:text-4xl font-black mb-4 font-outfit tracking-tight leading-tight'>
                    {commonData.announcements[0].title}
                  </h2>
                  <p className='text-indigo-50/90 text-lg max-w-2xl line-clamp-2 leading-relaxed font-medium mb-8'>
                    {commonData.announcements[0].body}
                  </p>
                  <div className='flex flex-wrap items-center gap-4'>
                    <Button
                      asChild
                      variant='secondary'
                      className='bg-white text-indigo-600 hover:bg-indigo-50 font-black px-8 rounded-2xl h-14 shadow-2xl transition-all hover:scale-105 active:scale-95'
                    >
                      <Link href='/announcements'>READ STORY</Link>
                    </Button>
                    <Button
                      asChild
                      variant='ghost'
                      className='text-white hover:bg-white/10 h-14 px-6 rounded-2xl font-bold tracking-wider'
                    >
                      <Link href='/announcements'>ALL UPDATES</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className='overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900'>
              <CardHeader className='p-8 pb-3'>
                <div className='flex items-center justify-between mb-2'>
                  <CardTitle className='text-xl font-black font-outfit tracking-tight'>
                    Workforce Strength
                  </CardTitle>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'>
                    <Briefcase className='h-5 w-5' />
                  </div>
                </div>
                <CardDescription className='font-bold text-slate-500 text-xs'>
                  Departmental distribution and counts.
                </CardDescription>
              </CardHeader>
              <CardContent className='p-8 pt-2'>
                <div className='grid gap-3 sm:grid-cols-2'>
                  {Object.entries(deptBreakdown).map(([dept, count]: [string, any]) => (
                    <Link
                      key={dept}
                      href={`/staff?query=${dept}`}
                      className='flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] group/dept border border-transparent hover:border-slate-100 dark:hover:border-slate-700'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='h-2 w-2 rounded-full bg-primary transition-transform group-hover/dept:scale-150' />
                        <span className='text-sm font-black text-slate-700 dark:text-slate-300 group-hover/dept:text-primary transition-colors'>
                          {dept}
                        </span>
                      </div>
                      <Badge className='bg-primary text-white border-none font-black px-3 py-0.5 text-[10px] tabular-nums'>
                        {count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className='lg:col-span-6 overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900 ring-1 ring-rose-500/10 flex flex-col justify-between'>
            <CardHeader className='p-8 pb-3 border-b border-slate-50 dark:border-slate-800'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl font-black font-outfit tracking-tight'>
                  Critical Dues
                </CardTitle>
                <Badge className='bg-rose-500 text-white border-none animate-pulse px-3 py-0.5 text-[10px]'>
                  ACTION
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='divide-y divide-slate-50 dark:divide-slate-800'>
                {adminData.upcomingFees.length === 0 ? (
                  <div className='flex flex-col items-center py-12 px-8 opacity-30'>
                    <History className='h-12 w-12 mb-3 text-slate-300' />
                    <p className='text-base font-black italic text-slate-400'>All caught up!</p>
                  </div>
                ) : (
                  adminData.upcomingFees.map((fee) => (
                    <Link
                      key={fee.id}
                      href={`/students/${fee.student.id}/finance`}
                      className='flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group'
                    >
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors'>
                          {fee.student.fullName}
                        </span>
                        <span className='text-[8px] text-slate-400 font-black uppercase tracking-widest'>
                          {fee.feeStructure.name.substring(0, 20)}...
                        </span>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <span className='text-base font-black text-rose-600 tabular-nums'>
                          Rs {Number(fee.outstandingAmount).toLocaleString()}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className='p-6'>
                <Button
                  asChild
                  variant='outline'
                  className='w-full h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs tracking-[0.2em] uppercase hover:bg-slate-50'
                >
                  <Link href='/finance/records'>VIEW ALL</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className='overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900'>
          <CardHeader className='p-8 pb-3'>
            <CardTitle className='text-xl font-black font-outfit tracking-tight'>
              Live Feed
            </CardTitle>
          </CardHeader>
          <CardContent className='p-8 pt-2'>
            <div className='space-y-6'>
              {adminData.recentLogs.length === 0 ? (
                <p className='text-sm text-slate-400 text-center py-6 italic'>
                  No recent activity.
                </p>
              ) : (
                adminData.recentLogs.map((log) => (
                  <div
                    key={log.id}
                    className='flex gap-4 relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 group'
                  >
                    <div className='absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-all group-hover:bg-primary group-hover:scale-125' />
                    <div className='flex flex-col gap-1 min-w-0'>
                      <p className='text-[10px] font-black text-slate-900 dark:text-white leading-tight'>
                        <span className='text-primary'>{log.action}</span> {log.tableName}
                      </p>
                      <div className='flex items-center gap-3 text-[8px] text-slate-500 font-black uppercase tracking-[0.15em]'>
                        <span className='flex items-center gap-1'>
                          {log.actor?.fullName.split(' ')[0] || 'System'}
                        </span>
                        <span className='flex items-center gap-1'>
                          {format(new Date(log.createdAt), 'HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button
              asChild
              variant='outline'
              className='w-full mt-6 h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs tracking-[0.2em] uppercase hover:bg-slate-50'
            >
              <Link href='/audit-logs'>AUDIT TRAIL</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== TEACHER DASHBOARD ====================
  if (isTeacher) {
    const staff = await prisma.staff.findUnique({
      where: { userId: user.id },
    });

    if (!staff) {
      return (
        <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
          <Card className='border-none bg-white shadow-sm dark:bg-slate-900'>
            <CardContent className='p-8 text-center'>
              <AlertCircle className='h-12 w-12 mx-auto mb-3 text-amber-500' />
              <p className='text-slate-600 dark:text-slate-400 font-semibold'>
                Staff profile not found. Please contact administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const teacherData = await getTeacherDashboardData(staff.id);

    const stats = [
      {
        title: 'Assigned Classes',
        value: teacherData.assignedClasses.length.toString(),
        icon: Book,
        description: 'Classes teaching',
        color: 'blue',
        href: '/classes',
      },
      {
        title: 'Total Students',
        value: teacherData.studentEnrollmentsInClasses.length.toString(),
        icon: GraduationCap,
        description: 'Under your instruction',
        color: 'emerald',
        href: '/students',
      },
      {
        title: 'Attendance Today',
        value: `${teacherData.attendanceSummary.rate}%`,
        icon: Users,
        description: 'Present',
        color: 'indigo',
        href: '/attendance',
      },
      {
        title: 'Pending Leaves',
        value: teacherData.pendingLeaveCount.toString(),
        icon: Calendar,
        description: 'Requests',
        color: 'amber',
        href: '/leave',
      },
    ];

    return (
      <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        {/* Hero Section */}
        <div className='relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 text-white shadow-2xl dark:bg-slate-950'>
          <div className='absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-primary/20 to-transparent pointer-events-none' />
          <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none' />

          <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8'>
            <div className='space-y-3'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md'>
                <Zap className='h-3 w-3 text-amber-400' />
                Teacher Dashboard
              </div>
              <h1 className='font-outfit text-4xl md:text-5xl font-black tracking-tight'>
                Welcome back, <span className='text-primary'>{user.fullName.split(' ')[0]}</span> 👋
              </h1>
              <p className='max-w-md text-base text-slate-400 font-medium leading-relaxed opacity-90'>
                Here is your teaching overview for today.
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
              <div className=' flex-col items-end px-6 border-r border-white/10 hidden lg:flex'>
                <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1'>
                  Current Time
                </span>
                <span className='text-2xl font-black font-outfit tabular-nums'>
                  {format(new Date(), 'HH:mm')}
                </span>
              </div>
              <Button
                asChild
                className='h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 px-6 font-black shadow-xl transition-all hover:scale-105 active:scale-95'
              >
                <Link href='/attendance'>
                  <Calendar className='mr-2 h-4 w-4 text-primary' />
                  {format(new Date(), 'EEE, MMM dd')}
                </Link>
              </Button>
              <Button
                asChild
                className='gradient-primary h-12 px-6 rounded-2xl shadow-xl shadow-blue-500/25 font-black transition-all hover:scale-105 active:scale-95'
              >
                <Link href='/announcements'>
                  <Bell className='mr-2 h-4 w-4' />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href} className='group'>
              <Card className='relative overflow-hidden border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900 h-full'>
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5',
                    stat.color === 'blue' && 'bg-blue-600',
                    stat.color === 'emerald' && 'bg-emerald-600',
                    stat.color === 'amber' && 'bg-amber-600',
                    stat.color === 'indigo' && 'bg-indigo-600'
                  )}
                />

                <CardContent className='p-5'>
                  <div className='flex items-center justify-between mb-3'>
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg',
                        STAT_COLOR_STYLES[stat.color] || STAT_COLOR_STYLES.blue
                      )}
                    >
                      <stat.icon className='h-4 w-4' />
                    </div>
                  </div>

                  <div className='space-y-0.5 relative z-10'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]'>
                      {stat.title}
                    </p>
                    <h3 className='text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white'>
                      {stat.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className='grid gap-6 lg:grid-cols-12'>
          <div className='lg:col-span-7'>
            {commonData.announcements.length > 0 && (
              <Card className='group relative overflow-hidden rounded-[2rem] border-none bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-xl transition-all duration-500 hover:shadow-indigo-500/20'>
                <div className='absolute right-0 top-0 p-8 opacity-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12'>
                  <Megaphone className='h-48 w-48 -mr-16 -mt-16' />
                </div>
                <CardContent className='p-8 relative z-10'>
                  <div className='flex flex-wrap items-center gap-4 mb-6'>
                    <Badge className='bg-white/20 text-white border-none backdrop-blur-xl px-4 py-1.5 text-[10px] font-black tracking-[0.2em]'>
                      ANNOUNCEMENT
                    </Badge>
                    <span className='text-xs font-bold opacity-70 flex items-center gap-2'>
                      <Clock className='h-4 w-4' />
                      {format(new Date(commonData.announcements[0].publishedAt), 'MMMM dd, yyyy')}
                    </span>
                  </div>
                  <h2 className='text-2xl md:text-3xl font-black mb-4 font-outfit tracking-tight leading-tight'>
                    {commonData.announcements[0].title}
                  </h2>
                  <p className='text-indigo-50/90 max-w-2xl line-clamp-2 leading-relaxed font-medium mb-6'>
                    {commonData.announcements[0].body}
                  </p>
                  <Button
                    asChild
                    variant='secondary'
                    className='bg-white text-indigo-600 hover:bg-indigo-50 font-black px-6 rounded-2xl h-12 shadow-2xl transition-all hover:scale-105 active:scale-95'
                  >
                    <Link href='/announcements'>READ MORE</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className='lg:col-span-5'>
            <Card className='overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900 h-full'>
              <CardHeader className='p-8 pb-3'>
                <div className='flex items-center justify-between mb-2'>
                  <CardTitle className='text-xl font-black font-outfit tracking-tight'>
                    Your Classes
                  </CardTitle>
                  <div className='flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20'>
                    <Book className='h-5 w-5' />
                  </div>
                </div>
                <CardDescription className='font-bold text-slate-500 text-xs'>
                  Classes assigned to you.
                </CardDescription>
              </CardHeader>
              <CardContent className='p-8 pt-2'>
                {teacherData.assignedClasses.length === 0 ? (
                  <div className='text-center py-6 opacity-50'>
                    <p className='text-sm text-slate-500 font-semibold'>No classes assigned yet.</p>
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {teacherData.assignedClasses.map((cls) => (
                      <Link
                        key={cls.id}
                        href={`/classes/${cls.id}`}
                        className='flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group'
                      >
                        <span className='text-sm font-black text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors'>
                          {cls.name}
                        </span>
                        <Badge className='bg-primary text-white border-none font-black px-2 py-0.5 text-[10px]'>
                          {
                            teacherData.studentEnrollmentsInClasses.filter(
                              (e) => e.classId === cls.id
                            ).length
                          }
                        </Badge>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ==================== ACCOUNTANT DASHBOARD ====================
  if (isAccountant) {
    const accountantData = await getAccountantDashboardData();

    const stats = [
      {
        title: 'Total Collection',
        value: `Rs ${(Number(accountantData.totalCollection._sum.amountPaid) || 0).toLocaleString()}`,
        icon: TrendingUp,
        description: 'Total revenue',
        color: 'emerald',
        href: '/finance/reports',
      },
      {
        title: 'Outstanding',
        value: `Rs ${(Number(accountantData.outstandingBalance._sum.outstandingAmount) || 0).toLocaleString()}`,
        icon: DollarSign,
        description: 'Pending dues',
        color: 'rose',
        href: '/finance/records',
      },
      {
        title: 'Upcoming Due',
        value: accountantData.upcomingFees.length.toString(),
        icon: Calendar,
        description: 'Next 7 days',
        color: 'amber',
        href: '/finance/records',
      },
      {
        title: 'Overdue',
        value: accountantData.overdueFees.length.toString(),
        icon: AlertCircle,
        description: 'Past due',
        color: 'rose',
        href: '/finance/records',
      },
    ];

    return (
      <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        {/* Hero Section */}
        <div className='relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 text-white shadow-2xl dark:bg-slate-950'>
          <div className='absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-primary/20 to-transparent pointer-events-none' />
          <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none' />

          <div className='relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8'>
            <div className='space-y-3'>
              <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md'>
                <Zap className='h-3 w-3 text-amber-400' />
                Finance Dashboard
              </div>
              <h1 className='font-outfit text-4xl md:text-5xl font-black tracking-tight'>
                Welcome back, <span className='text-primary'>{user.fullName.split(' ')[0]}</span> 👋
              </h1>
              <p className='max-w-md text-base text-slate-400 font-medium leading-relaxed opacity-90'>
                Manage your school finances efficiently.
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-4'>
              <div className=' flex-col items-end px-6 border-r border-white/10 hidden lg:flex'>
                <span className='text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1'>
                  Current Time
                </span>
                <span className='text-2xl font-black font-outfit tabular-nums'>
                  {format(new Date(), 'HH:mm')}
                </span>
              </div>
              <Button
                asChild
                className='h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 px-6 font-black shadow-xl transition-all hover:scale-105 active:scale-95'
              >
                <Link href='/finance/reports'>
                  <DollarSign className='mr-2 h-4 w-4 text-primary' />
                  Reports
                </Link>
              </Button>
              <Button
                asChild
                className='gradient-primary h-12 px-6 rounded-2xl shadow-xl shadow-blue-500/25 font-black transition-all hover:scale-105 active:scale-95'
              >
                <Link href='/announcements'>
                  <Bell className='mr-2 h-4 w-4' />
                  Notifications
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href} className='group'>
              <Card className='relative overflow-hidden border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900 h-full'>
                <div
                  className={cn(
                    'absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5',
                    stat.color === 'blue' && 'bg-blue-600',
                    stat.color === 'emerald' && 'bg-emerald-600',
                    stat.color === 'amber' && 'bg-amber-600',
                    stat.color === 'indigo' && 'bg-indigo-600',
                    stat.color === 'rose' && 'bg-rose-600'
                  )}
                />

                <CardContent className='p-5'>
                  <div className='flex items-center justify-between mb-3'>
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg',
                        STAT_COLOR_STYLES[stat.color] || STAT_COLOR_STYLES.blue
                      )}
                    >
                      <stat.icon className='h-4 w-4' />
                    </div>
                  </div>

                  <div className='space-y-0.5 relative z-10'>
                    <p className='text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]'>
                      {stat.title}
                    </p>
                    <h3 className='text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white'>
                      {stat.value}
                    </h3>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Main Content */}
        <div className='grid gap-6 lg:grid-cols-12'>
          <Card className='lg:col-span-7 overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900 ring-1 ring-rose-500/10'>
            <CardHeader className='p-8 pb-3 border-b border-slate-50 dark:border-slate-800'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl font-black font-outfit tracking-tight'>
                  Overdue Fees
                </CardTitle>
                <Badge className='bg-rose-500 text-white border-none animate-pulse px-3 py-0.5 text-[10px]'>
                  {accountantData.overdueFees.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='divide-y divide-slate-50 dark:divide-slate-800'>
                {accountantData.overdueFees.length === 0 ? (
                  <div className='flex flex-col items-center py-12 px-8 opacity-30'>
                    <CheckCircle className='h-12 w-12 mb-3 text-slate-300' />
                    <p className='text-base font-black italic text-slate-400'>No overdue fees!</p>
                  </div>
                ) : (
                  accountantData.overdueFees.map((fee) => (
                    <Link
                      key={fee.id}
                      href={`/students/${fee.student.id}/finance`}
                      className='flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group'
                    >
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors'>
                          {fee.student.fullName}
                        </span>
                        <span className='text-[8px] text-slate-400 font-black uppercase tracking-widest'>
                          {fee.feeStructure.name}
                        </span>
                      </div>
                      <div className='flex flex-col items-end gap-1'>
                        <span className='text-base font-black text-rose-600 tabular-nums'>
                          Rs {Number(fee.outstandingAmount).toLocaleString()}
                        </span>
                        <span className='text-[8px] text-rose-500 font-black'>
                          Due: {format(new Date(fee.dueDate), 'MMM dd')}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className='p-6'>
                <Button
                  asChild
                  variant='outline'
                  className='w-full h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs tracking-[0.2em] uppercase hover:bg-slate-50'
                >
                  <Link href='/finance/records'>VIEW ALL</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className='lg:col-span-5 overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900 ring-1 ring-amber-500/10'>
            <CardHeader className='p-8 pb-3 border-b border-slate-50 dark:border-slate-800'>
              <div className='flex items-center justify-between'>
                <CardTitle className='text-xl font-black font-outfit tracking-tight'>
                  Due Soon
                </CardTitle>
                <Badge className='bg-amber-500 text-white border-none px-3 py-0.5 text-[10px]'>
                  {accountantData.upcomingFees.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <div className='divide-y divide-slate-50 dark:divide-slate-800 max-h-80 overflow-y-auto'>
                {accountantData.upcomingFees.length === 0 ? (
                  <div className='flex flex-col items-center py-8 px-6 opacity-30'>
                    <CheckCircle className='h-10 w-10 mb-2 text-slate-300' />
                    <p className='text-sm font-black text-slate-400'>All set!</p>
                  </div>
                ) : (
                  accountantData.upcomingFees.map((fee) => (
                    <Link
                      key={fee.id}
                      href={`/students/${fee.student.id}/finance`}
                      className='flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group'
                    >
                      <div className='flex flex-col gap-0.5 min-w-0'>
                        <span className='text-xs font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate'>
                          {fee.student.fullName}
                        </span>
                        <span className='text-[7px] text-slate-400 font-black uppercase tracking-widest'>
                          {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <span className='text-sm font-black text-amber-600 tabular-nums whitespace-nowrap ml-2'>
                        Rs {Number(fee.outstandingAmount).toLocaleString()}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Payments */}
        <Card className='overflow-hidden rounded-[2rem] border-none bg-white shadow-sm dark:bg-slate-900'>
          <CardHeader className='p-8 pb-3'>
            <CardTitle className='text-xl font-black font-outfit tracking-tight'>
              Recent Payments
            </CardTitle>
          </CardHeader>
          <CardContent className='p-8 pt-2'>
            <div className='space-y-3 max-h-96 overflow-y-auto'>
              {accountantData.feePaymentsRecent.length === 0 ? (
                <p className='text-sm text-slate-400 text-center py-6 italic'>
                  No recent payments.
                </p>
              ) : (
                accountantData.feePaymentsRecent.map((payment) => (
                  <Link
                    key={payment.id}
                    href={`/finance/records`}
                    className='flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.01] group'
                  >
                    <div className='flex flex-col gap-1 min-w-0'>
                      <span className='text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate'>
                        {payment.feeRecord.student.fullName}
                      </span>
                      <span className='text-[8px] text-slate-400 font-black uppercase tracking-widest'>
                        {format(new Date(payment.paidAt), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                    <div className='flex flex-col items-end gap-1'>
                      <span className='text-sm font-black text-emerald-600 tabular-nums'>
                        +Rs {Number(payment.amountPaid).toLocaleString()}
                      </span>
                      <Badge className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-none font-black px-2 py-0.5 text-[8px]'>
                        {payment.method}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==================== FALLBACK: Generic Dashboard ====================
  return (
    <div className='space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <Card className='relative overflow-hidden rounded-[2.5rem] border-none bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-2xl dark:bg-slate-950'>
        <div className='absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-primary/10 to-transparent pointer-events-none' />
        <div className='absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none' />

        <CardContent className='p-8 relative z-10'>
          <div className='flex items-center gap-4 mb-4'>
            <div className='h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center'>
              <Zap className='h-6 w-6 text-primary' />
            </div>
            <div>
              <h1 className='font-outfit text-3xl font-black'>
                Welcome, <span className='text-primary'>{user.fullName}</span> 👋
              </h1>
              <p className='text-slate-400 text-sm font-semibold mt-1'>
                Your dashboard will be available shortly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {commonData.announcements.length > 0 && (
        <Card className='group relative overflow-hidden rounded-[2rem] border-none bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-xl transition-all duration-500 hover:shadow-indigo-500/20'>
          <div className='absolute right-0 top-0 p-8 opacity-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12'>
            <Megaphone className='h-48 w-48 -mr-16 -mt-16' />
          </div>
          <CardContent className='p-8 relative z-10'>
            <div className='flex flex-wrap items-center gap-4 mb-6'>
              <Badge className='bg-white/20 text-white border-none backdrop-blur-xl px-4 py-1.5 text-[10px] font-black tracking-[0.2em]'>
                ANNOUNCEMENT
              </Badge>
              <span className='text-xs font-bold opacity-70 flex items-center gap-2'>
                <Clock className='h-4 w-4' />
                {format(new Date(commonData.announcements[0].publishedAt), 'MMMM dd, yyyy')}
              </span>
            </div>
            <h2 className='text-3xl md:text-4xl font-black mb-4 font-outfit tracking-tight leading-tight'>
              {commonData.announcements[0].title}
            </h2>
            <p className='text-indigo-50/90 text-lg max-w-2xl leading-relaxed font-medium mb-6'>
              {commonData.announcements[0].body}
            </p>
            <Button
              asChild
              variant='secondary'
              className='bg-white text-indigo-600 hover:bg-indigo-50 font-black px-8 rounded-2xl h-14 shadow-2xl transition-all hover:scale-105 active:scale-95'
            >
              <Link href='/announcements'>READ MORE</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
