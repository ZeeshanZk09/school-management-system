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
import { createClass, updateClass } from "./actions";

export function ClassForm({
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
      ? await updateClass(initialData.id, formData)
      : await createClass(formData);

    setIsPending(false);

    if (result.success) {
      toast.success(initialData ? "Class updated" : "Class created");
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
              {initialData ? "Edit Class" : "New Class"}
            </DialogTitle>
            <DialogDescription>
              Define a new class level. Classes act as containers for sections.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Class Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name}
                placeholder="e.g. Class 10"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
              {errors.name && (
                <p className="text-xs text-rose-500">{errors.name[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">Class Code</Label>
              <Input
                id="code"
                name="code"
                defaultValue={initialData?.code}
                placeholder="e.g. C10"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none uppercase"
              />
              {errors.code && (
                <p className="text-xs text-rose-500">{errors.code[0]}</p>
              )}
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
              {initialData ? "Update Class" : "Create Class"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
