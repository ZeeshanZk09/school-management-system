"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Loader2, Receipt } from "lucide-react";
import { FeeReceiptPDF } from "@/components/finance/fee-receipt-pdf";
import { Button } from "@/components/ui/button";

export function ReceiptButton({
  record,
  settings,
}: Readonly<{
  record: {
    payments: {
      id: string;
      amountPaid: string | number;
      paidAt: string | Date;
      method: string;
      referenceNumber?: string | null;
      note?: string | null;
      receipt?: {
        id: string | number;
      } | null;
    }[];
    student: {
      fullName: string;
      enrollments: {
        academicYearId: string;
        classId: string;
        isDeleted: boolean;
        rollNumber: string;
        class: { name: string; sections: { name: string }[] };
        section: { name: string } | null;
        academicYear: { name: string };
      }[];
      admissionNumber: string;
      rollNumber?: string | null;
    };
    academicYearId: string;
    classId: string;
    class: { name: string; sections: { name: string }[] };
    feeStructure: { name: string };
  };
  settings: {
    schoolName: string;
    schoolLogoUrl: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string | null;
    state: string | null;
    country: string | null;
    postalCode: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
  };
}>) {
  const latestPayment = record.payments[0];

  if (!latestPayment) return null;

  const enrollment = record.student.enrollments.find(
    (entry) =>
      entry.academicYearId === record.academicYearId &&
      entry.classId === record.classId &&
      !entry.isDeleted,
  ) ??
    record.student.enrollments.find((entry) => !entry.isDeleted) ?? {
      rollNumber: record.student.admissionNumber,
      class: record.class,
      section: null,
    };

  const pdfData = {
    payment: {
      ...latestPayment,
      feeRecord: {
        feeStructure: record.feeStructure,
      },
    },
    settings,
    student: record.student,
    enrollment,
  };

  return (
    <PDFDownloadLink
      document={<FeeReceiptPDF {...pdfData} />}
      fileName={`Receipt-${record.student.fullName.replaceAll(/\s+/g, "-")}-${latestPayment.id.substring(0, 6)}.pdf`}
    >
      {({ loading }) => (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-blue-500 hover:text-blue-600"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Receipt className="h-4 w-4" />}
        </Button>
      )}
    </PDFDownloadLink>
  );
}
