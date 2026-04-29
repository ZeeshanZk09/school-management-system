"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function createSalaryStructure(
  staffId: string,
  data: {
    basePay: number;
    validFrom: Date;
    components: {
      label: string;
      amount: number;
      type: "ALLOWANCE" | "DEDUCTION";
    }[];
  },
) {
  try {
    const actor = await requirePermission("finance.manage");

    const structure = await prisma.$transaction(async (tx) => {
      const newStructure = await tx.salaryStructure.create({
        data: {
          staffId,
          basePay: data.basePay,
          validFrom: data.validFrom,
          components: {
            create: data.components.map((c) => ({
              label: c.label,
              amount: c.amount,
              type: c.type,
            })),
          },
        },
        include: { components: true },
      });

      await writeAuditLog({
        action: "CREATE",
        tableName: "SalaryStructure",
        recordId: newStructure.id,
        newValue: newStructure,
        actorUserId: actor.id,
      });

      return newStructure;
    });

    revalidatePath(`/staff/${staffId}`);
    return { success: true, data: structure };
  } catch (error) {
    console.error("Create salary structure error:", error);
    return { success: false, message: "Failed to create salary structure" };
  }
}

export async function generateSalarySlip(
  staffId: string,
  periodYear: number,
  periodMonth: number,
) {
  try {
    const actor = await requirePermission("finance.manage");

    const structure = await prisma.salaryStructure.findFirst({
      where: {
        staffId,
        isDeleted: false,
        validFrom: { lte: new Date(periodYear, periodMonth, 0) },
      },
      orderBy: { validFrom: "desc" },
      include: { components: true },
    });

    if (!structure) {
      return {
        success: false,
        message: "No valid salary structure found for this period",
      };
    }

    const grossPay =
      Number(structure.basePay) +
      structure.components
        .filter((c) => c.type === "ALLOWANCE")
        .reduce((sum, c) => sum + Number(c.amount), 0);

    const totalDeductions = structure.components
      .filter((c) => c.type === "DEDUCTION")
      .reduce((sum, c) => sum + Number(c.amount), 0);

    const netPay = grossPay - totalDeductions;

    const slip = await prisma.salarySlip.create({
      data: {
        staffId,
        salaryStructureId: structure.id,
        periodYear,
        periodMonth,
        grossPay,
        totalDeductions,
        netPay,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      tableName: "SalarySlip",
      recordId: slip.id,
      newValue: slip,
      actorUserId: actor.id,
    });

    revalidatePath(`/staff/${staffId}`);
    return { success: true, data: slip };
  } catch (error) {
    if ((error as any).code === "P2002") {
      return {
        success: false,
        message: "Salary slip already generated for this period",
      };
    }
    console.error("Generate salary slip error:", error);
    return { success: false, message: "Failed to generate salary slip" };
  }
}

export async function recordSalaryDisbursement(
  slipId: string,
  data: {
    amountPaid: number;
    method: "CASH" | "BANK_TRANSFER" | "CHEQUE" | "ONLINE";
    referenceNumber?: string;
    paidAt: Date;
  },
) {
  try {
    const actor = await requirePermission("finance.manage");

    const disbursement = await prisma.salaryDisbursement.create({
      data: {
        salarySlipId: slipId,
        amountPaid: data.amountPaid,
        method: data.method,
        referenceNumber: data.referenceNumber,
        paidAt: data.paidAt,
        paidByUserId: actor.id,
      },
    });

    await writeAuditLog({
      action: "CREATE",
      tableName: "SalaryDisbursement",
      recordId: disbursement.id,
      newValue: disbursement,
      actorUserId: actor.id,
    });

    return { success: true, data: disbursement };
  } catch (error) {
    console.error("Record disbursement error:", error);
    return { success: false, message: "Failed to record disbursement" };
  }
}

export async function exportFinanceCSV(
  type: "collection" | "outstanding",
  month?: number,
  year?: number,
) {
  try {
    await requirePermission("finance.read");
    const { startOfMonth, endOfMonth, format } = await import("date-fns");
    const Papa = (await import("papaparse")).default;

    let data: any[] = [];

    if (type === "collection" && month && year) {
      const startDate = startOfMonth(new Date(year, month - 1));
      const endDate = endOfMonth(startDate);

      const payments = await prisma.feePayment.findMany({
        where: {
          paidAt: { gte: startDate, lte: endDate },
          isDeleted: false,
        },
        include: {
          feeRecord: {
            include: {
              student: true,
              feeStructure: { include: { class: true } },
            },
          },
        },
      });

      data = payments.map((p) => ({
        Date: format(new Date(p.paidAt), "yyyy-MM-dd"),
        Student: p.feeRecord.student.fullName,
        Class: p.feeRecord.feeStructure.class.name,
        Amount: Number(p.amountPaid),
        Method: p.method,
        Reference: p.referenceNumber || "N/A",
      }));
    } else if (type === "outstanding") {
      const records = await prisma.feeRecord.findMany({
        where: {
          outstandingAmount: { gt: 0 },
          isDeleted: false,
          student: { isDeleted: false },
        },
        include: {
          student: true,
          feeStructure: { include: { class: true } },
        },
      });

      data = records.map((r) => ({
        Student: r.student.fullName,
        Class: r.feeStructure.class.name,
        "Fee Structure": r.feeStructure.name,
        "Total Amount": Number(r.totalAmount),
        "Outstanding Amount": Number(r.outstandingAmount),
        "Due Date": format(new Date(r.dueDate), "yyyy-MM-dd"),
      }));
    }

    const csv = Papa.unparse(data);
    return { success: true, csv };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
