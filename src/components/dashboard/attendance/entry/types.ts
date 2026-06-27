export type Status = "ABSENT" | "EXCUSED" | "LATE" | "PRESENT";

export interface AttendanceStudent {
  id: string;
  fullName: string;
  admissionNumber: string;
  attendanceRate?: number;
  attendance: Array<{
    status: Status;
  }>;
}
