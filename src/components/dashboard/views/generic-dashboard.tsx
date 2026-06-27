"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Megaphone, Zap, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

interface Announcement {
  id: string;
  title: string;
  body: string;
  publishedAt: Date | string;
}

interface GenericDashboardProps {
  user: { fullName: string };
  commonData: { announcements: Announcement[] };
}

export function GenericDashboard({ user, commonData }: Readonly<GenericDashboardProps>) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Card className="relative overflow-hidden rounded-[2.5rem] border-none bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-2xl dark:bg-slate-950">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-linear-to-l from-primary/10 to-transparent pointer-events-none" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <CardContent className="p-8 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-outfit text-3xl font-black">
                Welcome, <span className="text-primary">{user.fullName}</span> 👋
              </h1>
              <p className="text-slate-400 text-sm font-semibold mt-1">
                Your dashboard will be available shortly.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <h2 className="text-3xl md:text-4xl font-black mb-4 font-outfit tracking-tight leading-tight">
              {commonData.announcements[0].title}
            </h2>
            <p className="text-indigo-50/90 text-lg max-w-2xl leading-relaxed font-medium mb-6">
              {commonData.announcements[0].body}
            </p>
            <Link
              href="/announcements"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "bg-white text-indigo-600 hover:bg-indigo-50 font-black px-8 rounded-2xl h-14 shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center",
              )}
            >
              READ MORE
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
