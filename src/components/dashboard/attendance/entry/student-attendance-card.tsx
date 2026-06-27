"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AttendanceStudent, Status } from "./types";

interface StudentAttendanceCardProps {
  student: AttendanceStudent;
  status: Status;
  updateStatus: (studentId: string, status: Status) => void;
}

export function StudentAttendanceCard({
  student,
  status,
  updateStatus,
}: Readonly<StudentAttendanceCardProps>) {
  const isLowAttendance = student.attendanceRate !== undefined && student.attendanceRate < 75;

  let statusStyles = "bg-amber-50/30 dark:bg-amber-900/5 ring-1 ring-amber-500/10";
  if (status === "PRESENT") {
    statusStyles = "bg-white dark:bg-slate-900 ring-1 ring-emerald-500/10";
  } else if (status === "ABSENT") {
    statusStyles = "bg-rose-50/30 dark:bg-rose-900/5 ring-1 ring-rose-500/10";
  }

  if (isLowAttendance) {
    statusStyles = "bg-rose-50/50 dark:bg-rose-900/10 ring-1 ring-rose-500/20";
  }

  return (
    <Card
      className={`border-none shadow-premium dark-card-border transition-all duration-300 ${statusStyles}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-800">
            <AvatarFallback className="bg-slate-100 text-slate-500 text-xs font-bold">
              {student.fullName
                .split(" ")
                .map((n: string) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-sm truncate">{student.fullName}</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-tighter">
              {student.admissionNumber}
            </span>
          </div>
          {student.attendanceRate !== undefined && student.attendanceRate < 75 && (
            <div
              title={`Attendance: ${student.attendanceRate}% — Below 75% threshold`}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black shrink-0"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              {student.attendanceRate}%
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={status === "PRESENT" ? "default" : "outline"}
            className={`flex-1 h-11 min-w-[44px] gap-1.5 transition-all ${
              status === "PRESENT"
                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                : "bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-none shadow-sm"
            }`}
            onClick={() => updateStatus(student.id, "PRESENT")}
          >
            <span className="text-[10px] font-black tracking-widest">PRES</span>
          </Button>
          <Button
            size="sm"
            variant={status === "ABSENT" ? "destructive" : "outline"}
            className={`flex-1 h-11 min-w-[44px] gap-1.5 transition-all ${
              status === "ABSENT"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-none shadow-sm"
            }`}
            onClick={() => updateStatus(student.id, "ABSENT")}
          >
            <span className="text-[10px] font-black tracking-widest">ABS</span>
          </Button>
          <Button
            size="sm"
            variant={status === "LATE" ? "secondary" : "outline"}
            className={`flex-1 h-11 min-w-[44px] gap-1.5 transition-all ${
              status === "LATE"
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "bg-white dark:bg-slate-900 text-slate-400 hover:text-amber-600 hover:bg-amber-50 border-none shadow-sm"
            }`}
            onClick={() => updateStatus(student.id, "LATE")}
          >
            <span className="text-[10px] font-black tracking-widest">LATE</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
