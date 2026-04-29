"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateLeaveRequestStatus } from "./actions";

export function LeaveApprovalButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState<"APPROVING" | "REJECTING" | null>(
    null,
  );

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setIsPending(status === "APPROVED" ? "APPROVING" : "REJECTING");
    try {
      const result = await updateLeaveRequestStatus(id, status);
      if (result.success) {
        toast.success(`Leave request ${status.toLowerCase()} successfully`);
      } else {
        toast.error(result.message || "Action failed");
      }
    } catch (_error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsPending(null);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        variant="ghost"
        className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 font-bold"
        onClick={() => handleAction("REJECTED")}
        disabled={isPending !== null}
      >
        {isPending === "REJECTING" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="mr-2 h-4 w-4" />
        )}
        Reject
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="h-8 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold"
        onClick={() => handleAction("APPROVED")}
        disabled={isPending !== null}
      >
        {isPending === "APPROVING" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="mr-2 h-4 w-4" />
        )}
        Approve
      </Button>
    </div>
  );
}
