"use client";

import { DollarSign, Loader2 } from "lucide-react";
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
import { recordSalaryDisbursement } from "./actions";

export function DisbursementDialog({
  children,
  slip,
  staffName,
}: Readonly<{
  children: React.ReactNode;
  slip: any;
  staffName: string;
}>) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      amountPaid: Number.parseFloat(formData.get("amountPaid") as string),
      method: formData.get("method") as any,
      referenceNumber: formData.get("referenceNumber") as string,
      paidAt: new Date(formData.get("paidAt") as string),
    };

    const result = await recordSalaryDisbursement(slip.id, data);

    setIsPending(false);

    if (result.success) {
      toast.success("Payment recorded successfully");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to record payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-outfit text-2xl">
              Disburse Salary
            </DialogTitle>
            <DialogDescription>
              Record salary payment for {staffName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amountPaid">Amount to Pay</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  defaultValue={Number.parseFloat(slip.netPay)}
                  required
                  className="pl-10 bg-slate-50 dark:bg-slate-900 border-none"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="method">Payment Method</Label>
              <Select name="method" defaultValue="BANK_TRANSFER" required>
                <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paidAt">Payment Date</Label>
              <Input
                id="paidAt"
                name="paidAt"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">Reference / Check #</Label>
              <Input
                id="referenceNumber"
                name="referenceNumber"
                placeholder="Optional reference number"
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
                <DollarSign className="mr-2 h-4 w-4" />
              )}
              Confirm Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
