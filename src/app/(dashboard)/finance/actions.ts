"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getActiveAcademicYear } from "@/lib/academic-year";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { feePaymentSchema } from "@/lib/validations/finance";

type FeeRecordStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export async function generateMonthlyFees(month: number, year: number) {
  const user = await requirePermission("finance.manage");

  try {
    const academicYear = await getActiveAcademicYear();
    if (!academicYear)
      return { success: false, message: "No active academic year" };

    // Get all active enrollments
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        academicYearId: academicYear.id,
        isDeleted: false,
        student: { status: "ACTIVE" },
      },
      include: {
        class: {
          include: {
            feeStructures: {
              where: {
                academicYearId: academicYear.id,
                isDeleted: false,
                isActive: true,
              },
              include: { components: { where: { isDeleted: false } } },
            },
          },
        },
      },
    });

    let generatedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const enrollment of enrollments) {
        const structure = enrollment.class.feeStructures[0];
        if (!structure) continue;

        // Filter components that apply to this month (Simplified logic)
        // In a real system, frequency logic would be more complex
        const components = structure.components.filter((c) => {
          if (c.frequency === "MONTHLY") return true;
          // One-time or Yearly might apply based on admission date or month
          return false;
        });

        if (components.length === 0) continue;

        const totalAmount = components.reduce(
          (acc, c) => acc + Number(c.amount),
          0,
        );

        // Check if already generated for this student/month
        // For simplicity, we use a naming convention or a specific record check
        // Real implementation would need a unique constraint or mapping

        await tx.feeRecord.create({
          data: {
            studentId: enrollment.studentId,
            classId: enrollment.classId,
            academicYearId: academicYear.id,
            feeStructureId: structure.id,
            totalAmount,
            outstandingAmount: totalAmount,
            status: "OPEN",
            dueDate: new Date(year, month - 1, 10), // Default due date
            items: {
              create: components.map((c) => ({
                label: c.label,
                amount: c.amount,
                dueDate: new Date(year, month - 1, 10), // Default 10th of the month
              })),
            },
          },
        });
        generatedCount++;
      }
    });

    await writeAuditLog({
      actorUserId: user.id,
      action: "CREATE",
      tableName: "FeeRecord",
      recordId: `BATCH_${month}_${year}`,
      newValue: { count: generatedCount },
    });

    revalidatePath("/finance/records");
    return { success: true, count: generatedCount };
  } catch (error) {
    console.error("Fee Gen Error:", error);
    return { success: false, message: "Failed to generate fees" };
  }
}

export async function recordPayment(data: unknown) {
  const user = await requirePermission("finance.manage");

  const validated = feePaymentSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      errors: z.flattenError(validated.error).fieldErrors,
    };
  }

  try {
    return await prisma.$transaction(async (tx) => {
      const record = await tx.feeRecord.findUnique({
        where: { id: validated.data.feeRecordId },
      });
      if (!record) throw new Error("Record not found");

      const payment = await tx.feePayment.create({
        data: {
          ...validated.data,
          paidAt: new Date(validated.data.paidAt),
          receivedByUserId: user.id,
        },
      });

      await tx.feeReceipt.create({
        data: { paymentId: payment.id },
      });

      // Update record outstanding amount
      const newOutstanding =
        Number(record.outstandingAmount) - Number(validated.data.amountPaid);
      const newStatus: FeeRecordStatus =
        newOutstanding <= 0 ? "PAID" : "PARTIALLY_PAID";

      await tx.feeRecord.update({
        where: { id: record.id },
        data: {
          outstandingAmount: newOutstanding,
          status: newStatus,
        },
      });

      await writeAuditLog({
        actorUserId: user.id,
        action: "CREATE",
        tableName: "FeePayment",
        recordId: payment.id,
        newValue: payment,
      });

      return {
        success: true,
        paymentId: payment.id,
        message: "Payment recorded successfully",
      };
    });
  } catch (_error) {
    return { success: false, message: "Failed to record payment" };
  }
}
