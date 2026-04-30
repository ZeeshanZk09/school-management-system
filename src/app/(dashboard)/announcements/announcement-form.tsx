"use client";

import { Loader2, Megaphone } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement } from "./actions";

export function AnnouncementForm({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      expiresAt: formData.get("expiresAt")
        ? new Date(formData.get("expiresAt") as string)
        : undefined,
    };

    const result = await createAnnouncement(data);

    setIsPending(false);

    if (result.success) {
      toast.success("Announcement posted successfully");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to post announcement");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-outfit text-2xl">
              New Announcement
            </DialogTitle>
            <DialogDescription>
              Post a notice to the institutional dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Summer Vacation Notice"
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="body">Content</Label>
              <Textarea
                id="body"
                name="body"
                placeholder="Write your announcement here..."
                required
                className="bg-slate-50 dark:bg-slate-900 border-none min-h-[150px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="expiresAt">Expiry Date (Optional)</Label>
              <Input
                id="expiresAt"
                name="expiresAt"
                type="date"
                className="bg-slate-50 dark:bg-slate-900 border-none"
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
              className="gradient-primary"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Megaphone className="mr-2 h-4 w-4" />
              )}
              Publish Notice
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
