"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { approveUser } from "./actions";

export function ApprovalButton({
  userId,
  roles,
}: Readonly<{
  userId: string;
  roles: any[];
}>) {
  const [open, setOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    if (selectedRoles.length === 0) {
      toast.error("Please assign at least one role");
      return;
    }

    setIsPending(true);
    try {
      const result = await approveUser(userId, selectedRoles);
      if (result.success) {
        toast.success("User approved successfully");
        setOpen(false);
      } else {
        toast.error(result.message || "Approval failed");
      }
    } catch (_error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold"
        >
          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
          Approve
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-none">
        <DialogHeader>
          <DialogTitle className="font-outfit">Approve Account</DialogTitle>
          <DialogDescription>
            Assign initial roles to this user to activate their institutional
            access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center space-x-2">
              <Checkbox
                id={role.id}
                checked={selectedRoles.includes(role.id)}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedRoles([...selectedRoles, role.id]);
                  else
                    setSelectedRoles(
                      selectedRoles.filter((id) => id !== role.id),
                    );
                }}
              />
              <Label htmlFor={role.id} className="font-medium">
                {role.name}
              </Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            className="gradient-primary"
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Activate Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
