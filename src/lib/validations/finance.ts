import { z } from "zod";

export const feeStructureSchema = z.object({
  name: z.string().min(2, "Name is required"),
  classId: z.string().min(1, "Class is required"),
  academicYearId: z.string().min(1, "Year is required"),
  isActive: z.boolean().default(true),
});

export const feeComponentSchema = z.object({
  feeStructureId: z.string().min(1),
  label: z.string().min(1, "Label is required"),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  dueDate: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid due date",
  }),
  frequency: z.enum(["MONTHLY", "SEMESTER", "YEARLY", "ONE_TIME"]),
});

export const feePaymentSchema = z.object({
  feeRecordId: z.string().min(1),
  amountPaid: z.coerce.number().positive("Amount must be positive"),
  paidAt: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !Number.isNaN(date.getTime()) && date <= new Date();
    },
    {
      message: "Payment date cannot be in the future",
    },
  ),
  method: z.enum(["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE"]),
  referenceNumber: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});
