"use client";

import { Check, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { decideLeaveRequest } from "../../attendance/staff-actions";

export function LeaveApprovalActions({
  requestId,
}: Readonly<{ requestId: string }>) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleDecision = async (decision: "APPROVED" | "REJECTED") => {
    setIsPending(true);
    const result = await decideLeaveRequest(requestId, decision);
    setIsPending(false);

    if (result.success) {
      toast.success(`Leave request ${decision.toLowerCase()}`);
      router.refresh();
    } else {
      toast.error(result.message || "Action failed");
    }
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100"
        onClick={() => handleDecision("REJECTED")}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <X className="mr-1 h-3 w-3" />
        )}
        Reject
      </Button>
      <Button
        size="sm"
        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
        onClick={() => handleDecision("APPROVED")}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Check className="mr-1 h-3 w-3" />
        )}
        Approve
      </Button>
    </div>
  );
}
