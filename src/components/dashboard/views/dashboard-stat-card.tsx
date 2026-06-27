import * as React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const STAT_COLOR_STYLES: Record<string, string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-200 ring-1 ring-blue-500/20 group-hover:bg-blue-500 group-hover:text-white",
  emerald:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-200 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white",
  amber:
    "bg-amber-500/10 text-amber-600 dark:text-amber-200 ring-1 ring-amber-500/20 group-hover:bg-amber-500 group-hover:text-white",
  indigo:
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-200 ring-1 ring-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-200 ring-1 ring-rose-500/20 group-hover:bg-rose-500 group-hover:text-white",
};

export interface DashboardStatProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  color: string;
  trend?: string;
  href: string;
}

export function DashboardStatCard({
  title,
  value,
  icon: Icon,
  color,
  href,
}: Readonly<DashboardStatProps>) {
  return (
    <Link href={href} className="group">
      <Card className="relative overflow-hidden border-none bg-white shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-slate-900 h-full">
        <div
          className={cn(
            "absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-5",
            color === "blue" && "bg-blue-600",
            color === "emerald" && "bg-emerald-600",
            color === "amber" && "bg-amber-600",
            color === "indigo" && "bg-indigo-600",
            color === "rose" && "bg-rose-600",
          )}
        />

        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg",
                STAT_COLOR_STYLES[color] || STAT_COLOR_STYLES.blue,
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-0.5 relative z-10">
            <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.25em]">
              {title}
            </p>
            <h3 className="text-xl font-black font-outfit tracking-tight text-slate-900 dark:text-white">
              {value}
            </h3>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
