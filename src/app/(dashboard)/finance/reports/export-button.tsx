"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { exportFinanceCSV } from "../payroll/actions"; // Adjust if moved

export function FinanceExportButtons({
  type,
  month,
  year,
}: {
  type: "collection" | "outstanding";
  month?: number;
  year?: number;
}) {
  const [isPending, setIsPending] = useState(false);

  const handleExportCSV = async () => {
    setIsPending(true);
    try {
      const result = await exportFinanceCSV(type, month, year);
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
        document.body.removeChild(link);
        toast.success("Financial report exported successfully");
      } else {
        toast.error(result.message || "Export failed");
      }
    } catch (_error) {
      toast.error("An error occurred during export");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        className="h-10 bg-white dark:bg-slate-900 border-none shadow-sm"
        onClick={() => toast.info("PDF Export coming soon...")}
        disabled={isPending}
      >
        <Download className="mr-2 h-4 w-4" />
        Export PDF
      </Button>
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
