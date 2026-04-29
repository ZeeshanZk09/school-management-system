"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createAcademicYear, updateAcademicYear } from "./actions";

export function AcademicYearForm({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData?: any;
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
    const result = initialData
      ? await updateAcademicYear(initialData.id, formData)
      : await createAcademicYear(formData);

    setIsPending(false);

    if (result.success) {
      toast.success(
        initialData ? "Academic year updated" : "Academic year created",
      );
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
              {initialData ? "Edit Academic Year" : "New Academic Year"}
            </DialogTitle>
            <DialogDescription>
              Enter the details for the school session. Active years define
              current student enrollment contexts.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Session Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name}
                placeholder="e.g. 2026-2027"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name[0]}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={
                    initialData?.startDate
                      ? new Date(initialData.startDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none"
                />
                {errors.startDate && (
                  <p className="text-xs text-rose-500">{errors.startDate[0]}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  defaultValue={
                    initialData?.endDate
                      ? new Date(initialData.endDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none"
                />
                {errors.endDate && (
                  <p className="text-xs text-rose-500">{errors.endDate[0]}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isActive"
                name="isActive"
                value="true"
                defaultChecked={initialData?.isActive}
                className="border-slate-300 dark:border-slate-700"
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-medium leading-none"
              >
                Set as active session
              </Label>
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
              {initialData ? "Update Year" : "Create Year"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
