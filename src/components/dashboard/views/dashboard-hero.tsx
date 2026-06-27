"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Calendar, Zap } from "lucide-react";
import { CurrentTime } from "@/components/dashboard/current-time";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export interface HeroAction {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColorClass: string;
  glowClass: string;
}

interface DashboardHeroProps {
  roleTitle: string;
  fullName: string;
  description: string;
  actions: HeroAction[];
  calendarHref?: string;
  notificationsHref?: string;
}

export function DashboardHero({
  roleTitle,
  fullName,
  description,
  actions,
  calendarHref = "/attendance",
  notificationsHref = "/announcements",
}: Readonly<DashboardHeroProps>) {
  const firstName = fullName.split(" ")[0];

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 px-8 py-10 text-white shadow-2xl dark:bg-slate-950">
      <div className="absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-primary/20 to-transparent pointer-events-none" />
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Zap className="h-3 w-3 text-amber-400" />
            {roleTitle}
          </div>
          <h1 className="font-outfit text-4xl md:text-5xl font-black tracking-tight">
            Welcome back, <span className="text-primary">{firstName}</span> 👋
          </h1>
          <p className="max-w-md text-base text-slate-400 font-medium leading-relaxed opacity-90">
            {description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {actions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "bg-white/10 hover:bg-white/20 border-none rounded-xl h-10 px-4 text-xs font-bold transition-all hover:scale-105 active:scale-95",
                  action.glowClass,
                )}
              >
                <action.icon className={cn("mr-2 h-3.5 w-3.5", action.iconColorClass)} />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-col items-end px-6 border-r border-white/10 hidden lg:flex">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
              Current Time
            </span>
            <span className="text-2xl font-black font-outfit tabular-nums">
              <CurrentTime pattern="HH:mm" />
            </span>
          </div>
          <Link
            href={calendarHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-12 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 px-6 font-black shadow-xl transition-all hover:scale-105 active:scale-95 border-none",
            )}
          >
            <Calendar className="mr-2 h-4 w-4 text-primary" />
            <CurrentTime pattern="EEE, MMM dd" />
          </Link>
          <Link
            href={notificationsHref}
            className={cn(
              buttonVariants(),
              "gradient-primary h-12 px-6 rounded-2xl shadow-xl shadow-blue-500/25 font-black transition-all hover:scale-105 active:scale-95",
            )}
          >
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
