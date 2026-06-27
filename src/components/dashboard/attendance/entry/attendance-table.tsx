"use client";

import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { AttendanceStudent, Status } from "./types";

interface AttendanceTableProps {
  students: AttendanceStudent[];
  attendance: Record<string, Status>;
  updateStatus: (studentId: string, status: Status) => void;
}

export function AttendanceTable({
  students,
  attendance,
  updateStatus,
}: Readonly<AttendanceTableProps>) {
  return (
    <Card className="border-none shadow-premium dark-card-border overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
          <TableRow className="border-none hover:bg-transparent">
            <TableHead className="w-[100px] font-bold text-xs">Student</TableHead>
            <TableHead className="font-bold text-xs">Full Name</TableHead>
            <TableHead className="font-bold text-xs">Rate</TableHead>
            <TableHead className="text-right font-bold text-xs">Status Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const status = attendance[student.id];
            const isLowAttendance =
              student.attendanceRate !== undefined && student.attendanceRate < 75;
            return (
              <TableRow
                key={student.id}
                className={cn(
                  "border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors",
                  isLowAttendance && "bg-rose-50/30 dark:bg-rose-900/10",
                )}
              >
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px] font-bold">
                      {student.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{student.fullName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {student.admissionNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  {student.attendanceRate !== undefined && (
                    <span
                      className={cn(
                        "text-xs font-bold",
                        student.attendanceRate < 75 ? "text-rose-500" : "text-emerald-500",
                      )}
                    >
                      {student.attendanceRate}%
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant={status === "PRESENT" ? "default" : "outline"}
                      className={cn(
                        "h-9 px-4 rounded-lg text-[10px] font-black tracking-widest transition-all min-w-[80px]",
                        status === "PRESENT"
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-transparent text-slate-400 hover:text-emerald-600 border-none",
                      )}
                      onClick={() => updateStatus(student.id, "PRESENT")}
                    >
                      PRESENT
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "ABSENT" ? "destructive" : "outline"}
                      className={cn(
                        "h-9 px-4 rounded-lg text-[10px] font-black tracking-widest transition-all min-w-[80px]",
                        status === "ABSENT"
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-transparent text-slate-400 hover:text-rose-600 border-none",
                      )}
                      onClick={() => updateStatus(student.id, "ABSENT")}
                    >
                      ABSENT
                    </Button>
                    <Button
                      size="sm"
                      variant={status === "LATE" ? "secondary" : "outline"}
                      className={cn(
                        "h-9 px-4 rounded-lg text-[10px] font-black tracking-widest transition-all min-w-[80px]",
                        status === "LATE"
                          ? "bg-amber-500 text-white"
                          : "bg-transparent text-slate-400 hover:text-amber-600 border-none",
                      )}
                      onClick={() => updateStatus(student.id, "LATE")}
                    >
                      LATE
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
