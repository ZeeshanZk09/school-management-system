"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Decimal } from "@prisma/client/runtime/client";

interface SalaryComponent {
  id: string;
  type: "ALLOWANCE" | "DEDUCTION";
  label: string;
  amount: Decimal | number;
}

interface SalaryStructure {
  id: string;
  basePay: Decimal | number;
  components: SalaryComponent[];
}

interface SalarySlipDisbursement {
  id: string;
}

interface SalarySlip {
  id: string;
  periodMonth: number;
  periodYear: number;
  netPay: Decimal | number;
  disbursements: SalarySlipDisbursement[];
}

interface TabPayrollProps {
  staff: {
    id: string;
    salarySlips: SalarySlip[];
  };
  currentSalary?: SalaryStructure | null;
}

export function TabPayroll({ staff, currentSalary }: Readonly<TabPayrollProps>) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Salary & Payroll History</h2>
        <Button size="sm" className="gradient-primary" asChild>
          <Link href={`/finance/payroll/setup?staffId=${staff.id}`}>
            <Plus className="mr-2 h-4 w-4" />
            Setup New Structure
          </Link>
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-base font-bold">Active Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentSalary ? (
              <>
                <div className="flex justify-between items-end border-b pb-2">
                  <span className="text-sm text-slate-500">Base Pay</span>
                  <span className="text-lg font-bold">
                    Rs {Number(currentSalary.basePay).toLocaleString()}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Allowances
                  </p>
                  {currentSalary.components
                    .filter((c) => c.type === "ALLOWANCE")
                    .map((c) => (
                      <div key={c.id} className="flex justify-between text-sm">
                        <span>{c.label}</span>
                        <span className="font-medium text-emerald-600">
                          +Rs {Number(c.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Deductions
                  </p>
                  {currentSalary.components
                    .filter((c) => c.type === "DEDUCTION")
                    .map((c) => (
                      <div key={c.id} className="flex justify-between text-sm">
                        <span>{c.label}</span>
                        <span className="font-medium text-rose-600">
                          -Rs {Number(c.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400 italic">No salary structure defined.</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-sm glass overflow-hidden">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Recent Salary Slips</CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-none bg-white dark:bg-slate-800 shadow-sm"
              disabled
            >
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {staff.salarySlips.length === 0 ? (
                <p className="p-8 text-center text-slate-400 italic">
                  No salary slips generated yet.
                </p>
              ) : (
                staff.salarySlips.map((slip) => (
                  <div
                    key={slip.id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors"
                  >
                    <div className="space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">
                        {format(new Date(slip.periodYear, slip.periodMonth - 1), "MMMM yyyy")}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] uppercase font-bold text-slate-50500">
                        <span>Net: Rs {Number(slip.netPay).toLocaleString()}</span>
                        {slip.disbursements.length > 0 ? (
                          <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-1 h-4">
                            PAID
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-amber-500 border-amber-200 px-1 h-4"
                          >
                            PENDING
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-primary"
                      disabled
                      title="PDF download coming soon"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
