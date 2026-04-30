"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { submitLeaveRequest } from "./actions";

export function LeaveRequestDialog({
  children,
  leaveTypes,
  staffMembers,
  activeYearId,
}: Readonly<{
  children: React.ReactNode;
  leaveTypes: any[];
  staffMembers: any[];
  activeYearId: string;
}>) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      staffId: formData.get("staffId") as string,
      academicYearId: activeYearId,
      leaveTypeId: formData.get("leaveTypeId") as string,
      startDate: new Date(formData.get("startDate") as string),
      endDate: new Date(formData.get("endDate") as string),
      reason: formData.get("reason") as string,
    };

    const result = await submitLeaveRequest(data);
    setIsPending(false);

    if (result.success) {
      toast.success("Leave request submitted successfully");
      setOpen(false);
    } else {
      toast.error(result.message || "Failed to submit request");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-outfit text-2xl">
              Leave Application
            </DialogTitle>
            <DialogDescription>
              Submit a new leave request for a staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="staffId">Staff Member</Label>
              <Select name="staffId" required>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none h-11">
                  <SelectValue placeholder="Select staff" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="leaveTypeId">Leave Type</Label>
              <Select name="leaveTypeId" required>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none h-11"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                name="reason"
                className="bg-slate-50 dark:bg-slate-900 border-none min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary h-11 px-8"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
