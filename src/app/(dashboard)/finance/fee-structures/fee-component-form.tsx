"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { addFeeComponent } from "./actions";

export function FeeComponentForm({
  children,
  feeStructureId,
}: {
  children: React.ReactNode;
  feeStructureId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await addFeeComponent({
      feeStructureId,
      label: formData.get("label"),
      amount: formData.get("amount"),
      dueDate: formData.get("dueDate"),
      frequency: formData.get("frequency"),
    });

    setIsPending(false);

    if (result.success) {
      toast.success("Component added");
      setOpen(false);
      router.refresh();
    } else {
      if (result.errors) {
        setErrors(result.errors);
      } else {
        toast.error(result.message || "Something went wrong");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-outfit text-2xl">
              Add Fee Component
            </DialogTitle>
            <DialogDescription>
              Define a specific fee (e.g. Tuition, Lab Fee, Admission) and its
              schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="label">Component Label</Label>
              <Input
                id="label"
                name="label"
                placeholder="e.g. Monthly Tuition"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.label && (
                <p className="text-xs text-rose-500">{errors.label[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="e.g. 500"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.amount && (
                <p className="text-xs text-rose-500">{errors.amount[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Initial Due Date</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.dueDate && (
                <p className="text-xs text-rose-500">{errors.dueDate[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency" defaultValue="MONTHLY" required>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                  <SelectValue placeholder="Select Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="SEMESTER">Semester</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                  <SelectItem value="ONE_TIME">One Time</SelectItem>
                </SelectContent>
              </Select>
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
              className="gradient-primary"
              disabled={isPending}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Component
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
