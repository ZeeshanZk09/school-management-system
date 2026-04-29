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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addGuardian, updateGuardian } from "../actions";

export function GuardianForm({
  children,
  studentId,
  initialData,
}: {
  children: React.ReactNode;
  studentId: string;
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
    const data = Object.fromEntries(formData.entries());
    data.isPrimary = formData.get("isPrimary") === "true";

    const result = initialData
      ? await updateGuardian(initialData.id, studentId, data)
      : await addGuardian(studentId, data);

    setIsPending(false);

    if (result.success) {
      toast.success(initialData ? "Guardian updated" : "Guardian added");
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
              {initialData ? "Edit Guardian" : "New Guardian"}
            </DialogTitle>
            <DialogDescription>
              Provide contact details for the student's guardian or parent.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                defaultValue={initialData?.fullName}
                placeholder="e.g. John Doe"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.fullName && (
                <p className="text-xs text-rose-500">{errors.fullName[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="relation">Relation</Label>
              <Select
                name="relation"
                defaultValue={initialData?.relation || "FATHER"}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                  <SelectValue placeholder="Select Relation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FATHER">Father</SelectItem>
                  <SelectItem value="MOTHER">Mother</SelectItem>
                  <SelectItem value="GUARDIAN">Guardian</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.relation && (
                <p className="text-xs text-rose-500">{errors.relation[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={initialData?.phoneNumber}
                placeholder="+1..."
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.phoneNumber && (
                <p className="text-xs text-rose-500">{errors.phoneNumber[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email}
                placeholder="guardian@example.com"
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.email && (
                <p className="text-xs text-rose-500">{errors.email[0]}</p>
              )}
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isPrimary"
                name="isPrimary"
                value="true"
                defaultChecked={initialData?.isPrimary}
                className="border-slate-300 dark:border-slate-700"
              />
              <Label
                htmlFor="isPrimary"
                className="text-sm font-medium leading-none"
              >
                Set as primary contact
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
              {initialData ? "Update Guardian" : "Add Guardian"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
