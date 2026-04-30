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
import { recordPayment } from "../actions";

export type PaymentRecord = {
  id: string;
  outstandingAmount: number | string | { toString(): string };
  student: {
    fullName: string;
  };
};

export function PaymentForm({
  children,
  record,
}: Readonly<{
  children: React.ReactNode;
  record: PaymentRecord;
}>) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<string | undefined>("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors("");

    const formData = new FormData(e.currentTarget);
    const result = await recordPayment({
      feeRecordId: record.id,
      amountPaid: formData.get("amountPaid"),
      paidAt: formData.get("paidAt"),
      method: formData.get("method"),
      referenceNumber: formData.get("referenceNumber"),
      note: formData.get("note"),
    });

    setIsPending(false);

    if (result.success) {
      toast.success("Payment recorded successfully");
      setOpen(false);
      router.refresh();
    } else if (result.message) {
      setErrors(result.message);
    } else {
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-106.25 glass border-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-outfit text-2xl">
              Record Fee Payment
            </DialogTitle>
            <DialogDescription>
              Enter payment details for{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {record.student.fullName}
              </span>
              . Remaining balance:{" "}
              <span className="font-black text-rose-600">
                Rs {Number(record.outstandingAmount).toLocaleString()}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="amountPaid">Amount Paid ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  defaultValue={Number(record.outstandingAmount)}
                  max={Number(record.outstandingAmount)}
                  required
                  className="pl-9 bg-slate-50 dark:bg-slate-900 border-none"
                />
              </div>
              {errors && <p className="text-xs text-rose-500">{errors}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                {errors && <p className="text-xs text-rose-500">{errors}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="method">Method</Label>
                <Select name="method" defaultValue="CASH" required>
                  <SelectTrigger className="bg-slate-50 dark:bg-slate-900 border-none">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">
                Ref # / Cheque # (Optional)
              </Label>
              <Input
                id="referenceNumber"
                name="referenceNumber"
                placeholder="e.g. TXN-12345"
                className="bg-slate-50 dark:bg-slate-900 border-none"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="note">Internal Note</Label>
              <Input
                id="note"
                name="note"
                placeholder="Any extra details..."
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
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
