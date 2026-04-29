"use client";

import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle,
  Clock,
  Coffee,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { markStaffAttendance } from "../staff-actions";

export function StaffAttendanceForm({
  staffMembers,
  existingAttendance,
  date,
}: {
  staffMembers: any[];
  existingAttendance: any[];
  date: Date;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [attendance, setAttendance] = useState<
    Record<string, { status: string; note: string }>
  >(
    staffMembers.reduce((acc, staff) => {
      const existing = existingAttendance.find((a) => a.staffId === staff.id);
      acc[staff.id] = {
        status: existing?.status || "PRESENT",
        note: existing?.note || "",
      };
      return acc;
    }, {} as any),
  );

  const handleStatusChange = (staffId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], status },
    }));
  };

  const handleNoteChange = (staffId: string, note: string) => {
    setAttendance((prev) => ({
      ...prev,
      [staffId]: { ...prev[staffId], note },
    }));
  };

  const handleSave = async () => {
    setIsPending(true);
    try {
      // In a real app, you might want to bulk this in one action,
      // but here we'll iterate or use a transaction-based action.
      // I'll update the action to handle bulk or just call it multiple times for now.
      const promises = staffMembers.map((staff) =>
        markStaffAttendance(staff.id, {
          status: attendance[staff.id].status,
          note: attendance[staff.id].note,
          date: date,
        }),
      );

      const results = await Promise.all(promises);
      const allSuccess = results.every((r) => r.success);

      if (allSuccess) {
        toast.success("Staff attendance saved successfully");
        router.refresh();
      } else {
        toast.error("Some attendance records failed to save");
      }
    } catch (_error) {
      toast.error("Failed to save attendance");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm glass">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold font-outfit">
              Attendance Entry
            </CardTitle>
            <CardDescription>
              Select date and mark status for each staff member.
            </CardDescription>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal bg-white dark:bg-slate-900 border-none shadow-sm",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) =>
                  d &&
                  router.push(
                    `/attendance/staff?date=${format(d, "yyyy-MM-dd")}`,
                  )
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
                <TableHead>Staff Member</TableHead>
                <TableHead className="w-[200px]">Status</TableHead>
                <TableHead>Note / Reason</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staffMembers.map((staff) => (
                <TableRow
                  key={staff.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {staff.fullName}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                        {staff.designation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={attendance[staff.id].status}
                      onValueChange={(val) => handleStatusChange(staff.id, val)}
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-900 border-none shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="PRESENT"
                          className="text-emerald-600 font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-3.5 w-3.5" /> Present
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="ABSENT"
                          className="text-rose-600 font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <XCircle className="h-3.5 w-3.5" /> Absent
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="LATE"
                          className="text-amber-600 font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" /> Late
                          </div>
                        </SelectItem>
                        <SelectItem
                          value="ON_LEAVE"
                          className="text-blue-600 font-bold"
                        >
                          <div className="flex items-center gap-2">
                            <Coffee className="h-3.5 w-3.5" /> On Leave
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Add note..."
                      className="bg-white dark:bg-slate-900 border-none shadow-sm"
                      value={attendance[staff.id].note}
                      onChange={(e) =>
                        handleNoteChange(staff.id, e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-8 flex justify-end">
            <Button
              className="gradient-primary px-8 h-12 rounded-xl shadow-lg"
              onClick={handleSave}
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
        </CardContent>
      </Card>
    </div>
  );
}
