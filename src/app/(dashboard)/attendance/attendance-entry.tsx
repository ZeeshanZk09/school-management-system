"use client";

import {
  AlertCircle,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  Save,
  UserCheck,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { recordAttendance } from "./actions";
import { Separator } from "@/components/ui/separator";
import { feedback } from "@/lib/feedback";
import { SuccessAnimation } from "@/components/ui/success-animation";
import type { AttendanceStudent, Status } from "@/components/dashboard/attendance/entry";
import {
  BulkActionBar,
  AttendanceGrid,
  AttendanceTable,
} from "@/components/dashboard/attendance/entry";

export function AttendanceEntry({
  students,
  classId,
  sectionId,
  sessionId,
  academicYearId,
  date,
}: Readonly<{
  students: AttendanceStudent[];
  classId: string;
  sectionId: string;
  sessionId: string;
  academicYearId: string;
  date: string;
}>) {
  const [attendance, setAttendance] = useState<Record<string, Status>>(
    students.reduce<Record<string, Status>>((acc, student) => {
      acc[student.id] = student.attendance[0]?.status || "PRESENT";
      return acc;
    }, {}),
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [bulkNote, setBulkNote] = useState("");
  const router = useRouter();

  const hasExistingRecords = students.some((s) => s.attendance.length > 0);
  const isRetroactive = new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  const updateStatus = (studentId: string, status: Status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance = { ...attendance };
    students.forEach((student) => {
      newAttendance[student.id] = "PRESENT";
    });
    setAttendance(newAttendance);
    toast.success("All students marked as Present");
  };

  const markAllAbsent = () => {
    const newAttendance = { ...attendance };
    students.forEach((student) => {
      newAttendance[student.id] = "ABSENT";
    });
    setAttendance(newAttendance);
    toast.error("All students marked as Absent");
  };

  const handleSave = async () => {
    if (hasExistingRecords && !correctionReason) {
      toast.error("Please provide a reason for updating existing records");
      return;
    }

    setIsPending(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
      note: hasExistingRecords ? correctionReason : bulkNote || undefined,
    }));

    const result = await recordAttendance({
      classId,
      sectionId,
      academicYearId,
      sessionId,
      attendanceDate: date,
      records,
    });

    setIsPending(false);

    if (result.success) {
      feedback.success();
      setShowSuccess(true);
      toast.success("Attendance recorded successfully");
      setTimeout(() => {
        setShowSuccess(false);
        router.refresh();
      }, 2000);
    } else {
      feedback.error();
      toast.error(result.message || "Failed to save attendance");
    }
  };

  return (
    <div className="space-y-6">
      {hasExistingRecords && (
        <Card className="border-none bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">Records Already Exist</p>
              <p className="text-xs opacity-80 font-medium">
                You are about to overwrite existing attendance data for this session. A correction
                reason is required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isRetroactive && !hasExistingRecords && (
        <Card className="border-none bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-bold">Retroactive Entry</p>
              <p className="text-xs opacity-80 font-medium">
                You are recording attendance for a past date ({date}).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        {/* Stats & View Controls */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shadow-sm">
              <UserCheck className="h-3.5 w-3.5" />
              {Object.values(attendance).filter((v) => v === "PRESENT").length} Present
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 shadow-sm">
              <XCircle className="h-3.5 w-3.5" />
              {Object.values(attendance).filter((v) => v === "ABSENT").length} Absent
            </div>

            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 rounded-md"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-3 rounded-md"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSave}
              className="gradient-primary px-8 h-11 rounded-xl shadow-lg glow-primary"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Attendance
            </Button>
          </div>
        </div>

        {/* Bulk Management Bar */}
        <BulkActionBar
          presentCount={Object.values(attendance).filter((v) => v === "PRESENT").length}
          absentCount={Object.values(attendance).filter((v) => v === "ABSENT").length}
          hasExistingRecords={hasExistingRecords}
          correctionReason={correctionReason}
          setCorrectionReason={setCorrectionReason}
          bulkNote={bulkNote}
          setBulkNote={setBulkNote}
          markAllPresent={markAllPresent}
          markAllAbsent={markAllAbsent}
        />
      </div>

      {viewMode === "grid" ? (
        <AttendanceGrid students={students} attendance={attendance} updateStatus={updateStatus} />
      ) : (
        <AttendanceTable students={students} attendance={attendance} updateStatus={updateStatus} />
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4">
              <SuccessAnimation />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-black font-outfit text-slate-900 dark:text-white"
              >
                Attendance Saved!
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export type { AttendanceStudent };
