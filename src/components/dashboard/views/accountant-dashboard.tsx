"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Wallet, DollarSign, TrendingUp, Calendar, AlertCircle, CheckCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

import type { HeroAction } from "./dashboard-hero";
import { DashboardHero } from "./dashboard-hero";
import { DashboardStatCard } from "./dashboard-stat-card";
import type { AccountantDashboardData } from "@/lib/dashboard-data";

interface AccountantDashboardProps {
  user: { fullName: string };
  accountantData: AccountantDashboardData;
}

export function AccountantDashboard({ user, accountantData }: Readonly<AccountantDashboardProps>) {
  const heroActions: HeroAction[] = [
    {
      label: "Record Fees",
      href: "/finance/records",
      icon: Wallet,
      iconColorClass: "text-emerald-400",
      glowClass: "glow-emerald",
    },
    {
      label: "Generate Invoice",
      href: "/finance/records",
      icon: DollarSign,
      iconColorClass: "text-blue-400",
      glowClass: "glow-primary",
    },
  ];

  const stats = [
    {
      title: "Total Collection",
      value: `Rs ${(Number(accountantData.totalCollection._sum.amountPaid) || 0).toLocaleString()}`,
      icon: TrendingUp,
      description: "Total revenue",
      color: "emerald",
      href: "/finance/reports",
    },
    {
      title: "Outstanding",
      value: `Rs ${(Number(accountantData.outstandingBalance._sum.outstandingAmount) || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Pending dues",
      color: "rose",
      href: "/finance/records",
    },
    {
      title: "Upcoming Due",
      value: accountantData.upcomingFees.length.toString(),
      icon: Calendar,
      description: "Next 7 days",
      color: "amber",
      href: "/finance/records",
    },
    {
      title: "Overdue",
      value: accountantData.overdueFees.length.toString(),
      icon: AlertCircle,
      description: "Past due",
      color: "rose",
      href: "/finance/records",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <DashboardHero
        roleTitle="Finance Dashboard"
        fullName={user.fullName}
        description="Manage your school finances efficiently."
        actions={heroActions}
        calendarHref="/finance/reports"
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
        <Card className="lg:col-span-7 overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900 ring-1 ring-rose-500/10">
          <CardHeader className="p-8 pb-3 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black font-outfit tracking-tight">
                Overdue Fees
              </CardTitle>
              <Badge className="bg-rose-500 text-white border-none animate-pulse px-3 py-0.5 text-[10px]">
                {accountantData.overdueFees.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {accountantData.overdueFees.length === 0 ? (
                <div className="flex flex-col items-center py-12 px-8 opacity-30">
                  <CheckCircle className="h-12 w-12 mb-3 text-slate-300" />
                  <p className="text-base font-black italic text-slate-400">No overdue fees!</p>
                </div>
              ) : (
                accountantData.overdueFees.map((fee) => (
                  <Link
                    key={fee.id}
                    href={`/students/${fee.student.id}/finance`}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                        {fee.student.fullName}
                      </span>
                      <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                        {fee.feeStructure.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-base font-black text-rose-600 tabular-nums">
                        Rs {Number(fee.outstandingAmount).toLocaleString()}
                      </span>
                      <span className="text-[8px] text-rose-500 font-black">
                        Due: {format(new Date(fee.dueDate), "MMM dd")}
                      </span>
                    </div>
                  </Link>
                ))
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

        <Card className="lg:col-span-5 overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900 ring-1 ring-amber-500/10">
          <CardHeader className="p-8 pb-3 border-b border-slate-50 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-black font-outfit tracking-tight">
                Due Soon
              </CardTitle>
              <Badge className="bg-amber-500 text-white border-none px-3 py-0.5 text-[10px]">
                {accountantData.upcomingFees.length}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-80 overflow-y-auto">
              {accountantData.upcomingFees.length === 0 ? (
                <div className="flex flex-col items-center py-8 px-6 opacity-30">
                  <CheckCircle className="h-10 w-10 mb-2 text-slate-300" />
                  <p className="text-sm font-black text-slate-400">All set!</p>
                </div>
              ) : (
                accountantData.upcomingFees.map((fee) => (
                  <Link
                    key={fee.id}
                    href={`/students/${fee.student.id}/finance`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                        {fee.student.fullName}
                      </span>
                      <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">
                        {format(new Date(fee.dueDate), "MMM dd, yyyy")}
                      </span>
                    </div>
                    <span className="text-sm font-black text-amber-600 tabular-nums whitespace-nowrap ml-2">
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
      <Card className="overflow-hidden rounded-4xl border-none bg-white shadow-sm dark:bg-slate-900">
        <CardHeader className="p-8 pb-3">
          <CardTitle className="text-xl font-black font-outfit tracking-tight">
            Recent Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 pt-2">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {accountantData.feePaymentsRecent.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6 italic">No recent payments.</p>
            ) : (
              accountantData.feePaymentsRecent.map((payment) => (
                <Link
                  key={payment.id}
                  href={`/finance/records`}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.01] group"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {payment.feeRecord.student.fullName}
                    </span>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">
                      {format(new Date(payment.paidAt), "MMM dd, HH:mm")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm font-black text-emerald-600 tabular-nums">
                      +Rs {Number(payment.amountPaid).toLocaleString()}
                    </span>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-none font-black px-2 py-0.5 text-[8px]">
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
