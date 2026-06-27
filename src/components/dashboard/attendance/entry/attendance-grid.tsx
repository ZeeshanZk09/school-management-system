"use client";

import * as React from "react";
import type { AttendanceStudent, Status } from "./types";
import { StudentAttendanceCard } from "./student-attendance-card";

interface AttendanceGridProps {
  students: AttendanceStudent[];
  attendance: Record<string, Status>;
  updateStatus: (studentId: string, status: Status) => void;
}

export function AttendanceGrid({
  students,
  attendance,
  updateStatus,
}: Readonly<AttendanceGridProps>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {students.map((student) => (
        <StudentAttendanceCard
          key={student.id}
          student={student}
          status={attendance[student.id]}
          updateStatus={updateStatus}
        />
      ))}
    </div>
  );
}
