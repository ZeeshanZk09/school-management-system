"use client";

import * as React from "react";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Status = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface AttendanceRecord {
  id: string;
  status: Status;
  attendanceDate: Date | string;
  session: {
    name: string;
  };
}

interface TabAttendanceProps {
  student: {
    attendance: AttendanceRecord[];
  };
}

export function TabAttendance({ student }: Readonly<TabAttendanceProps>) {
  return (
    <div className="pt-6">
      <Card className="border-none shadow-sm glass overflow-hidden">
        <CardHeader className="pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <CardTitle className="text-lg font-bold">Recent Attendance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {student.attendance.length === 0 ? (
              <div className="h-32 flex items-center justify-center text-slate-400 italic text-sm">
                No attendance records found.
              </div>
            ) : (
              student.attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        record.status === "PRESENT" && "bg-emerald-100 text-emerald-600",
                        record.status === "ABSENT" && "bg-rose-100 text-rose-600",
                        record.status === "LATE" && "bg-amber-100 text-amber-600",
                        record.status === "EXCUSED" && "bg-blue-100 text-blue-600",
                      )}
                    >
                      {record.status === "PRESENT" && <CheckCircle2 className="h-4 w-4" />}
                      {record.status === "ABSENT" && <XCircle className="h-4 w-4" />}
                      {record.status === "LATE" && <Clock className="h-4 w-4" />}
                      {record.status === "EXCUSED" && <AlertCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {format(new Date(record.attendanceDate), "PPPP")}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                        {record.session.name}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] font-bold border-none",
                      record.status === "PRESENT" && "bg-emerald-50 text-emerald-700",
                      record.status === "ABSENT" && "bg-rose-50 text-rose-700",
                      record.status === "LATE" && "bg-amber-50 text-amber-700",
                      record.status === "EXCUSED" && "bg-blue-50 text-blue-700",
                    )}
                  >
                    {record.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
