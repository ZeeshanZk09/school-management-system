import { format } from "date-fns";
import { CheckCircle2, Clock, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getActiveAcademicYear } from "@/lib/academic-year";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { LeaveApprovalButton } from "./leave-approval-button";
import { LeaveRequestDialog } from "./leave-request-dialog";

export default async function LeaveManagementPage() {
  await requirePermission("attendance.manage");

  const [requests, leaveTypes, staffMembers, activeYear] = await Promise.all([
    prisma.leaveRequest.findMany({
      where: { isDeleted: false },
      include: {
        staff: true,
        leaveType: true,
        decidedBy: true,
      },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.leaveType.findMany({ where: { isActive: true, isDeleted: false } }),
    prisma.staff.findMany({
      where: { isDeleted: false },
      orderBy: { fullName: "asc" },
    }),
    getActiveAcademicYear(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Leave Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage staff leave applications, balances, and approvals.
          </p>
        </div>
        <LeaveRequestDialog
          leaveTypes={leaveTypes}
          staffMembers={staffMembers}
          activeYearId={activeYear?.id || ""}
        >
          <Button className="gradient-primary h-11 px-6 rounded-xl shadow-lg">
            <Plus className="mr-2 h-4 w-4" />
            New Leave Application
          </Button>
        </LeaveRequestDialog>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-none shadow-sm glass bg-amber-50/50 dark:bg-amber-950/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-amber-600 uppercase">
                Pending
              </p>
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <p className="text-3xl font-black mt-2">
              {requests.filter((r) => r.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm glass bg-emerald-50/50 dark:bg-emerald-950/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-emerald-600 uppercase">
                Approved
              </p>
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-3xl font-black mt-2">
              {requests.filter((r) => r.status === "APPROVED").length}
            </p>
          </CardContent>
        </Card>
        {/* More stats could go here */}
      </div>

      <Card className="border-none shadow-sm glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
              <TableHead>Staff Member</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500 italic"
                >
                  No leave requests found.
                </TableCell>
              </TableRow>
            ) : (
              requests.map((req) => (
                <TableRow
                  key={req.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{req.staff.fullName}</span>
                      <span className="text-[10px] text-slate-500 uppercase font-medium">
                        {req.staff.designation}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-100 font-bold text-[10px]"
                    >
                      {req.leaveType.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs">
                      <span className="font-medium">
                        {format(new Date(req.startDate), "MMM dd")} -{" "}
                        {format(new Date(req.endDate), "MMM dd")}
                      </span>
                      <span className="text-slate-400">
                        {Math.ceil(
                          (new Date(req.endDate).getTime() -
                            new Date(req.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) + 1}{" "}
                        days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        req.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700 border-none"
                          : req.status === "PENDING"
                            ? "bg-amber-100 text-amber-700 border-none"
                            : "bg-rose-100 text-rose-700 border-none"
                      }
                    >
                      {req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "PENDING" && (
                      <LeaveApprovalButton id={req.id} />
                    )}
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
