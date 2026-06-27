"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Book, GraduationCap, Users, Calendar, Megaphone, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import type { HeroAction } from "./dashboard-hero";
import { DashboardHero } from "./dashboard-hero";
import { DashboardStatCard } from "./dashboard-stat-card";
import type { TeacherDashboardData } from "@/lib/dashboard-data";

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: Date | string;
}

interface TeacherDashboardProps {
  user: { fullName: string };
  teacherData: TeacherDashboardData;
  commonData: { announcements: Announcement[] };
}

export function TeacherDashboard({
  user,
  teacherData,
  commonData,
}: Readonly<TeacherDashboardProps>) {
  const heroActions: HeroAction[] = [
    {
      label: "Mark Attendance",
      href: "/attendance",
      icon: Calendar,
      iconColorClass: "text-blue-400",
      glowClass: "glow-primary",
    },
    {
      label: "Submit Leave",
      href: "/leave",
      icon: Clock,
      iconColorClass: "text-amber-400",
      glowClass: "glow-amber",
    },
  ];

  const stats = [
    {
      title: "Assigned Classes",
      value: teacherData.assignedClasses.length.toString(),
      icon: Book,
      description: "Classes teaching",
      color: "blue",
      href: "/classes",
    },
    {
      title: "Total Students",
      value: teacherData.studentEnrollmentsInClasses.length.toString(),
      icon: GraduationCap,
      description: "Under your instruction",
      color: "emerald",
      href: "/students",
    },
    {
      title: "Attendance Today",
      value: `${teacherData.attendanceSummary.rate}%`,
      icon: Users,
      description: "Present",
      color: "indigo",
      href: "/attendance",
    },
    {
      title: "Pending Leaves",
      value: teacherData.pendingLeaveCount.toString(),
      icon: Calendar,
      description: "Requests",
      color: "amber",
      href: "/leave",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHero
        roleTitle="Teacher Dashboard"
        fullName={user.fullName}
        description="Here is your teaching overview for today."
        actions={heroActions}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <DashboardStatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            color={stat.color}
            href={stat.href}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          {commonData.announcements.length > 0 && (
            <Card className="group relative overflow-hidden rounded-4xl border-none bg-linear-to-br from-indigo-600 to-blue-700 text-white shadow-xl transition-all duration-500 hover:shadow-indigo-500/20">
              <div className="absolute right-0 top-0 p-8 opacity-10 transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-12">
                <Megaphone className="h-48 w-48 -mr-16 -mt-16" />
              </div>
              <CardContent className="p-8 relative z-10">
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <Badge className="bg-white/20 text-white border-none backdrop-blur-xl px-4 py-1.5 text-[10px] font-black tracking-[0.2em]">
                    ANNOUNCEMENT
                  </Badge>
                  <span className="text-xs font-bold opacity-70 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {format(new Date(commonData.announcements[0].publishedAt), "MMMM dd, yyyy")}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black mb-4 font-outfit tracking-tight leading-tight">
                  {commonData.announcements[0].title}
                </h2>
                <p className="text-indigo-50/90 max-w-2xl line-clamp-2 leading-relaxed font-medium mb-6">
                  {commonData.announcements[0].body}
                </p>
                <Link
                  href="/announcements"
                  className={cn(
                    buttonVariants({ variant: "secondary" }),
                    "bg-white text-indigo-600 hover:bg-indigo-50 font-black px-6 rounded-2xl h-12 shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center",
                  )}
                >
                  READ MORE
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-5">
          <Card className="overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900 h-full">
            <CardHeader className="p-8 pb-3">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="text-xl font-black font-outfit tracking-tight">
                  Your Classes
                </CardTitle>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-900/20">
                  <Book className="h-5 w-5" />
                </div>
              </div>
              <CardDescription className="font-bold text-slate-500 text-xs">
                Classes assigned to you.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-2">
              {teacherData.assignedClasses.length === 0 ? (
                <div className="text-center py-6 opacity-50">
                  <p className="text-sm text-slate-500 font-semibold">No classes assigned yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {teacherData.assignedClasses.map((cls) => (
                    <Link
                      key={cls.id}
                      href={`/classes/${cls.id}`}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group"
                    >
                      <span className="text-sm font-black text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                        {cls.name}
                      </span>
                      <Badge className="bg-primary text-white border-none font-black px-2 py-0.5 text-[10px]">
                        {
                          teacherData.studentEnrollmentsInClasses.filter(
                            (e) => e.classId === cls.id,
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
