"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Briefcase,
  Calendar,
  CalendarDays,
  DollarSign,
  GraduationCap,
  History,
  Megaphone,
  TrendingUp,
  Users,
  Wallet,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkline } from "@/components/dashboard/sparkline";
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import type { HeroAction } from "./dashboard-hero";
import { DashboardHero } from "./dashboard-hero";
import { DashboardStatCard } from "./dashboard-stat-card";
import type { AdminDashboardData } from "@/lib/dashboard-data";

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: Date | string;
}

interface AdminDashboardProps {
  user: { fullName: string };
  adminData: AdminDashboardData;
  commonData: { announcements: Announcement[] };
}

export function AdminDashboard({ user, adminData, commonData }: Readonly<AdminDashboardProps>) {
  const classBreakdown = adminData.studentEnrollments.reduce(
    (acc: Record<string, number>, curr) => {
      const className = curr.class.name;
      acc[className] = (acc[className] || 0) + 1;
      return acc;
    },
    {},
  );

  const deptBreakdown = adminData.staffList.reduce((acc: Record<string, number>, curr) => {
    const dept = curr.department || "Unassigned";
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const attendanceRate =
    adminData.totalAttendanceToday > 0
      ? Math.round((adminData.presentToday / adminData.totalAttendanceToday) * 100)
      : 0;

  const heroActions: HeroAction[] = [
    {
      label: "Register Student",
      href: "/students/new",
      icon: Users,
      iconColorClass: "text-blue-400",
      glowClass: "glow-primary",
    },
    {
      label: "New Staff",
      href: "/staff/new",
      icon: Briefcase,
      iconColorClass: "text-emerald-400",
      glowClass: "glow-emerald",
    },
    {
      label: "Create Invoice",
      href: "/finance/records",
      icon: DollarSign,
      iconColorClass: "text-amber-400",
      glowClass: "glow-amber",
    },
    {
      label: "Staff Attendance",
      href: "/attendance/staff",
      icon: CalendarDays,
      iconColorClass: "text-rose-400",
      glowClass: "glow-rose",
    },
    {
      label: "Payroll",
      href: "/finance/payroll",
      icon: Wallet,
      iconColorClass: "text-indigo-400",
      glowClass: "glow-primary",
    },
  ];

  const stats = [
    {
      title: "Total Students",
      value: adminData.studentCount.toString(),
      icon: GraduationCap,
      description: "Active enrollments",
      color: "blue",
      trend: "+12% this month",
      href: "/students",
    },
    {
      title: "Staff Presence",
      value: `${adminData.staffPresentToday} / ${adminData.staffCount}`,
      icon: Briefcase,
      description: `${adminData.staffAbsentToday} Absent • ${adminData.staffOnLeaveToday} Leave`,
      color: "emerald",
      href: "/attendance/reports",
    },
    {
      title: "Collected Fees",
      value: `Rs ${(Number(adminData.totalCollection._sum.amountPaid) || 0).toLocaleString()}`,
      icon: TrendingUp,
      description: "Total revenue",
      color: "indigo",
      href: "/finance/reports",
    },
    {
      title: "Outstanding",
      value: `Rs ${(Number(adminData.outstandingBalance._sum.outstandingAmount) || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Pending dues",
      color: "rose",
      href: "/finance/records",
    },
    {
      title: "Attendance",
      value: `${attendanceRate}%`,
      icon: Users,
      description: "Present today",
      color: "blue",
      href: "/attendance",
    },
    {
      title: "Pending Leaves",
      value: adminData.pendingLeaveCount.toString(),
      icon: Calendar,
      description: "Requests",
      color: "amber",
      href: "/leave",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHero
        roleTitle="Administrator Dashboard"
        fullName={user.fullName}
        description="Everything is running smoothly. Here is your overview for today."
        actions={heroActions}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            color={stat.color}
            trend={stat.trend}
            href={stat.href}
          />
        ))}
      </div>

      {/* Charts Section */}
      <DashboardCharts
        attendanceHistory={adminData.attendanceHistory}
        classBreakdown={classBreakdown}
        deptBreakdown={deptBreakdown}
      />

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-6 lg:col-span-6">
          {commonData.announcements.length > 0 && (
            <Card className="lg:col-span-4 group relative overflow-hidden rounded-4xl border-none bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-xl transition-all duration-500 hover:shadow-indigo-500/20">
              <div className="absolute right-0 top-0 p-8 opacity-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12">
                <Megaphone className="h-48 w-48 -mr-16 -mt-16" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-xl px-4 py-1.5 text-[10px] font-black tracking-[0.2em]">
                    PRIORITY NOTICE
                  </Badge>
                  <span className="text-xs font-bold opacity-70 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(commonData.announcements[0].publishedAt), "MMMM dd, yyyy")}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 font-outfit tracking-tight leading-tight">
                  {commonData.announcements[0].title}
                </h2>
                <p className="text-indigo-50/90 text-lg max-w-2xl line-clamp-2 leading-relaxed font-medium mb-8">
                  {commonData.announcements[0].body}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    href="/announcements"
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "bg-white text-indigo-600 hover:bg-indigo-50 font-black px-8 rounded-2xl h-14 shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center",
                    )}
                  >
                    READ STORY
                  </Link>
                  <Link
                    href="/announcements"
                    className={cn(
                      buttonVariants({ variant: "ghost" }),
                      "text-white hover:bg-white/10 h-14 px-6 rounded-2xl font-bold tracking-wider flex items-center justify-center",
                    )}
                  >
                    ALL UPDATES
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900">
            <CardHeader className="p-8 pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-black font-outfit tracking-tight">
                  Workforce Strength
                </CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20">
                  <Briefcase className="h-5 w-5" />
                </div>
              </div>
              <CardDescription className="font-bold text-slate-500 text-xs">
                Departmental distribution and counts.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-2">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(deptBreakdown).map(([dept, count]) => (
                  <Link
                    key={dept}
                    href={`/staff?query=${dept}`}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] group/dept border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary transition-transform group-hover/dept:scale-150" />
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 group-hover/dept:text-primary transition-colors">
                        {dept}
                      </span>
                    </div>
                    <Badge className="bg-primary text-white border-none font-black px-3 py-0.5 text-[10px] tabular-nums">
                      {count}
                    </Badge>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="lg:col-span-6 overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900 ring-1 ring-rose-500/10 flex flex-col justify-between">
          <CardHeader className="p-8 pb-3 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black font-outfit tracking-tight">
                Critical Dues
              </CardTitle>
              <Badge className="bg-rose-500 text-white border-none animate-pulse px-3 py-0.5 text-[10px]">
                ACTION
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {adminData.upcomingFees.length === 0 ? (
                <div className="flex flex-col items-center py-12 px-8 opacity-30">
                  <History className="h-12 w-12 mb-3 text-slate-300" />
                  <p className="text-base font-black italic text-slate-400">All caught up!</p>
                </div>
              ) : (
                adminData.upcomingFees.map((fee) => {
                  const history = [
                    Number(fee.outstandingAmount) * 0.8,
                    Number(fee.outstandingAmount) * 0.9,
                    Number(fee.outstandingAmount) * 0.85,
                    Number(fee.outstandingAmount),
                  ];

                  return (
                    <Link
                      key={fee.id}
                      href={`/students/${fee.student.id}/finance`}
                      className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {fee.student.fullName}
                          </span>
                          <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                            {fee.feeStructure.name.substring(0, 20)}...
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="hidden sm:block">
                          <Sparkline data={history} color="#f43f5e" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-base font-black text-rose-600 tabular-nums">
                            Rs {Number(fee.outstandingAmount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
            <div className="p-6">
              <Link
                href="/finance/records"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs tracking-[0.2em] uppercase hover:bg-slate-50 flex items-center justify-center",
                )}
              >
                VIEW ALL
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900">
        <CardHeader className="p-8 pb-3">
          <CardTitle className="text-xl font-black font-outfit tracking-tight">Live Feed</CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-2">
          <div className="space-y-6">
            {adminData.recentLogs.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 italic">No recent activity.</p>
            ) : (
              adminData.recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex gap-4 relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 group"
                >
                  <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-all group-hover:bg-primary group-hover:scale-125" />
                  <div className="flex flex-col gap-1 min-w-0">
                    <p className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">
                      <span className="text-primary">{log.action}</span> {log.tableName}
                    </p>
                    <div className="flex items-center gap-3 text-[8px] text-slate-500 font-black uppercase tracking-[0.15em]">
                      <span className="flex items-center gap-1">
                        {log.actor?.fullName.split(" ")[0] || "System"}
                      </span>
                      <span className="flex items-center gap-1">
                        {format(new Date(log.createdAt), "HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/audit-logs"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full mt-6 h-11 rounded-2xl border-slate-200 dark:border-slate-800 font-black text-xs tracking-[0.2em] uppercase hover:bg-slate-50 flex items-center justify-center",
            )}
          >
            AUDIT TRAIL
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
