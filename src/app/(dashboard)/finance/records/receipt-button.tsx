"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Loader2, Receipt } from "lucide-react";
import { FeeReceiptPDF } from "@/components/finance/fee-receipt-pdf";
import { Button } from "@/components/ui/button";

export function ReceiptButton({
  record,
  settings,
}: {
  record: any;
  settings: any;
}) {
  const latestPayment = record.payments[0];

  if (!latestPayment) return null;

  const enrollment = record.student.enrollments.find(
    (entry: any) =>
      entry.academicYearId === record.academicYearId &&
      entry.classId === record.classId &&
      !entry.isDeleted,
  ) ??
    record.student.enrollments.find((entry: any) => !entry.isDeleted) ?? {
      rollNumber: record.student.admissionNumber,
      class: record.class,
      section: null,
    };

  const pdfData = {
    payment: latestPayment,
    settings,
    student: record.student,
    enrollment,
  };

  return (
    <PDFDownloadLink
      document={<FeeReceiptPDF {...pdfData} />}
      fileName={`Receipt-${record.student.fullName.replace(/\s+/g, "-")}-${latestPayment.id.substring(0, 6)}.pdf`}
    >
      {({ loading }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-500 hover:text-blue-600"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Receipt className="h-4 w-4" />
          )}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
