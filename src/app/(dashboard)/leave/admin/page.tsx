import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { LeaveApprovalActions } from "./approval-actions";

export default async function AdminLeavePage() {
  await requirePermission("system.manage");

  const pendingRequests = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: {
      staff: true,
      leaveType: true,
    },
    orderBy: { appliedAt: "desc" },
  });

  const recentDecisions = await prisma.leaveRequest.findMany({
    where: { NOT: { status: "PENDING" } },
    include: {
      staff: true,
      leaveType: true,
    },
    take: 10,
    orderBy: { decidedAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-outfit">
          Leave Approvals
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Review and decide on staff leave applications.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-sm glass overflow-hidden">
          <CardHeader className="bg-amber-50/50 dark:bg-amber-950/20 border-b">
            <CardTitle className="text-lg font-bold">
              Pending Requests
            </CardTitle>
            <CardDescription>Awaiting your decision.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-slate-400 italic"
                    >
                      No pending requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  pendingRequests.map((req) => (
                    <TableRow
                      key={req.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {req.staff.fullName}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                            {req.staff.designation}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-bold">
                          {req.leaveType.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs">
                          {format(new Date(req.startDate), "PP")} -{" "}
                          {format(new Date(req.endDate), "PP")}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs italic">
                        {req.reason || "No reason provided"}
                      </TableCell>
                      <TableCell className="text-right">
                        <LeaveApprovalActions requestId={req.id} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass overflow-hidden opacity-80">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-bold">
              Recent Decisions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableBody>
                {recentDecisions.map((req) => (
                  <TableRow
                    key={req.id}
                    className="hover:bg-slate-50/30 transition-colors border-none"
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={
                            req.status === "APPROVED"
                              ? "text-emerald-500"
                              : "text-rose-500"
                          }
                        >
                          {req.status === "APPROVED" ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                        </div>
                        <span className="text-sm font-medium">
                          {req.staff.fullName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {req.leaveType.name}
                    </TableCell>
                    <TableCell className="text-xs text-right text-slate-400">
                      Decided {format(new Date(req.decidedAt!), "PP")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
