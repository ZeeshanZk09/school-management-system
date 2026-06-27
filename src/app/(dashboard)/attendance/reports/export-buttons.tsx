"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AttendanceReportPDF } from "@/components/pdf/attendance-report-pdf";
import { Button } from "@/components/ui/button";
import { exportAttendanceCSV } from "../actions";

export function AttendanceExportButtons({
  type,
  month,
  year,
  classId,
  reportData,
  settings,
  className: selectedClassName,
}: Readonly<{
  type: "student" | "staff";
  month: number;
  year: number;
  classId?: string;
  reportData?: {
    id: string;
    name: string;
    designation: string | undefined;
    present: number;
    absent: number;
    late: number | undefined;
    leave: number | undefined;
    total: number;
    rate: number | undefined;
    belowThreshold: boolean | undefined;
  }[];
  settings?: {
    schoolName: string;
    contactInfo: {
      email: string;
      phone: string;
    };
    addressLine1: string;
    contactEmail: string;

    reportTitle: string;
    schoolLogo?: string;
  };
  className?: string;
}>) {
  const [isPending, setIsPending] = useState(false);

  const handleExportCSV = async () => {
    if (type === "student" && !classId) {
      toast.error("Please select a class for student attendance export");
      return;
    }

    setIsPending(true);
    try {
      const result = await exportAttendanceCSV(type, month, year, classId);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${type}_attendance_${month}_${year}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Attendance report exported successfully");
      } else {
        toast.error(result.message || "Export failed");
      }
    } catch {
      toast.error("An error occurred during export");
    } finally {
      setIsPending(false);
    }
  };

  // Only show PDF button if we have data and settings
  const canExportPDF = reportData && reportData.length > 0 && settings;

  return (
    <div className="flex items-center gap-2">
      {canExportPDF ? (
        <PDFDownloadLink
          document={
            <AttendanceReportPDF
              reportData={reportData}
              type={type}
              month={month}
              year={year}
              settings={settings}
              className={selectedClassName}
            />
          }
          fileName={`${type}_attendance_report_${month}_${year}.pdf`}
        >
          {({ loading }) => (
            <Button
              variant="outline"
              className="h-10 bg-white dark:bg-slate-900 border-none shadow-sm"
              disabled={loading || isPending}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Export PDF
            </Button>
          )}
        </PDFDownloadLink>
      ) : (
        <Button
          variant="outline"
          className="h-10 bg-white dark:bg-slate-900 border-none shadow-sm opacity-50"
          onClick={() => toast.info("Generate a report first to enable PDF export")}
          disabled={isPending}
        >
          <FileText className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      )}

      <Button
        variant="outline"
        className="h-10 bg-white dark:bg-slate-900 border-none shadow-sm"
        onClick={handleExportCSV}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export CSV
      </Button>
    </div>
  );
}
