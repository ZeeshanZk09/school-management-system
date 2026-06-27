"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FinanceReportPDF, type FinanceReportSettings } from "@/components/pdf/finance-report-pdf";
import { Button } from "@/components/ui/button";
import { exportFinanceCSV } from "../payroll/actions";

export function FinanceExportButtons({
  type,
  month,
  year,
  reportData,
  settings,
}: Readonly<{
  type: "collection" | "outstanding" | "payroll";
  month?: number;
  year?: number;
  reportData?: unknown[];
  settings?: FinanceReportSettings | null;
}>) {
  const [isPending, setIsPending] = useState(false);

  const handleExportCSV = async () => {
    setIsPending(true);
    try {
      const result = await exportFinanceCSV(type as "collection" | "outstanding", month, year);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute(
          "download",
          `${type}_finance_report_${new Date().toISOString().split("T")[0]}.csv`,
        );
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Financial report exported successfully");
      } else {
        toast.error(result.message || "Export failed");
      }
    } catch {
      toast.error("An error occurred during export");
    } finally {
      setIsPending(false);
    }
  };

  const canExportPDF = reportData && reportData.length > 0 && settings;

  const pdfFileName = `${type}_report_${month ?? "all"}_${year ?? "all"}.pdf`;

  return (
    <div className="flex items-center gap-2">
      {canExportPDF ? (
        <PDFDownloadLink
          document={
            <FinanceReportPDF
              type={type}
              reportData={reportData}
              month={month}
              year={year}
              settings={settings}
            />
          }
          fileName={pdfFileName}
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
        disabled={isPending || type === "payroll"}
        title={type === "payroll" ? "CSV not available for payroll" : undefined}
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
