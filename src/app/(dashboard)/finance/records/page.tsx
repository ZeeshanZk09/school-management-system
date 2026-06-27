import { format } from "date-fns";
import { CreditCard, DollarSign, Download, History, Receipt, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { getSystemSettings } from "@/lib/settings";
import { PaymentForm } from "./payment-form";
import { ReceiptButton } from "./receipt-button";
import { PageHeader } from "@/components/dashboard/page-header";

type FeeRecordStatus = "OPEN" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";

export default async function FeeRecordsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ query?: string; status?: string }>;
}>) {
  await requirePermission("finance.read");
  const params = await searchParams;
  const query = params.query || "";
  const status = params.status || "";
  const settings = await getSystemSettings();
  const getStatusBadgeClass = (recordStatus: FeeRecordStatus) => {
    if (recordStatus === "PAID") {
      return "glow-emerald";
    }

    if (recordStatus === "PARTIALLY_PAID") {
      return "glow-amber";
    }

    return "glow-rose";
  };

  const records = await prisma.feeRecord.findMany({
    where: {
      isDeleted: false,
      student: {
        fullName: { contains: query, mode: "insensitive" },
      },
      ...(status ? { status: status as FeeRecordStatus } : {}),
    },
    include: {
      student: {
        include: {
          enrollments: {
            where: { isDeleted: false },
            include: {
              academicYear: true,
              class: {
                include: {
                  sections: true,
                },
              },
              section: true,
            },
          },
        },
      },
      academicYear: true,
      class: {
        include: {
          sections: true,
        },
      },
      feeStructure: true,
      payments: {
        where: { isDeleted: false },
        orderBy: { paidAt: "desc" },
        include: { receipt: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Student Billing"
        description="Track fee records, outstanding balances, and collection history."
      >
        <Button
          variant="outline"
          className="h-12 px-5 border-none bg-slate-100 dark:bg-slate-800 rounded-xl"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
        <Button className="gradient-primary h-12 px-6 shadow-lg shadow-blue-500/20 rounded-xl">
          <DollarSign className="mr-2 h-4 w-4" />
          Generate Monthly Fees
        </Button>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Total Outstanding
              </p>
              <DollarSign className="h-5 w-5 text-rose-500" />
            </div>
            <p className="text-3xl font-black mt-2">
              Rs {records.reduce((acc, r) => acc + Number(r.outstandingAmount), 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Collected (This Period)
              </p>
              <CreditCard className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-3xl font-black mt-2">
              $
              {records
                .reduce((acc, r) => acc + (Number(r.totalAmount) - Number(r.outstandingAmount)), 0)
                .toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm glass">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                Open Records
              </p>
              <Receipt className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-3xl font-black mt-2">
              {records.filter((r) => r.status !== "PAID").length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm glass overflow-hidden">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <form action="/finance/records" method="GET">
                <Input
                  name="query"
                  defaultValue={query}
                  placeholder="Search by student name..."
                  className="pl-10 h-10 bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </form>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs">
                All
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-rose-500">
                Overdue
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-500">
                Partial
              </Button>
            </div>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
              <TableHead className="w-62.5">Student</TableHead>
              <TableHead>Bill Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <EmptyState
                    icon={Search}
                    title="No billing records found"
                    description="Try adjusting your search query or filters to find what you're looking for."
                    className="border-none"
                  />
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow
                  key={record.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{record.student.fullName}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-medium">
                        {record.class.name} • {record.academicYear.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {format(new Date(record.createdAt), "PP")}
                  </TableCell>
                  <TableCell className="font-bold">
                    {Number(record.totalAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`font-black ${Number(record.outstandingAmount) > 0 ? "text-rose-600" : "text-emerald-600"}`}
                    >
                      Rs {Number(record.outstandingAmount).toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeClass(record.status)}>
                      {record.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {record.status !== "PAID" && (
                        <PaymentForm record={record}>
                          <Button
                            size="sm"
                            className="h-8 px-3 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Record Payment
                          </Button>
                        </PaymentForm>
                      )}
                      <ReceiptButton
                        record={{
                          payments: record.payments.map((p) => ({
                            ...p,
                            amountPaid: Number(p.amountPaid),
                          })),
                          student: {
                            ...record.student,
                            enrollments: record.student.enrollments.map((enrollment) => ({
                              ...enrollment,
                              class: {
                                name: enrollment.class.name,
                                sections: enrollment.class.sections.map((section) => ({
                                  name: section.name,
                                })),
                              },
                              section: enrollment.section,
                              academicYear: enrollment.academicYear,
                            })),
                          },
                          academicYearId: record.academicYearId,
                          classId: record.classId,
                          class: {
                            name: record.class.name,
                            sections: record.class.sections.map((section) => ({
                              name: section.name,
                            })),
                          },
                          feeStructure: record.feeStructure,
                        }}
                        settings={{
                          schoolName: settings.schoolName,
                          schoolLogoUrl: settings.schoolLogoUrl,
                          addressLine1: settings.addressLine1,
                          addressLine2: settings.addressLine2,
                          city: settings.city,
                          state: settings.state,
                          country: settings.country,
                          postalCode: settings.postalCode,
                          contactEmail: settings.contactEmail,
                          contactPhone: settings.contactPhone,
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400 hover:text-primary"
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
