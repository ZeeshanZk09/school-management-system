import { format } from "date-fns";
import { Filter, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    action?: string;
    table?: string;
    actorId?: string;
  }>;
}) {
  await requirePermission("system.manage");
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const action = params.action;
  const table = params.table;
  const actorId = params.actorId;
  const pageSize = 50;

  const where: any = {};
  if (action && action !== "ALL") where.action = action;
  if (table && table !== "ALL") where.tableName = table;
  if (actorId && actorId !== "ALL") where.actorUserId = actorId;

  const [logs, totalCount, users] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { actor: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
    prisma.user.findMany({
      where: { auditEntries: { some: {} } },
      select: { id: true, fullName: true },
    }),
  ]);

  // Unique tables for filter
  const tables = await prisma.auditLog.groupBy({
    by: ["tableName"],
    _count: { id: true },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Audit Trail
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Security log of all data modifications and system events.
          </p>
        </div>
      </div>

      <Card className="border-none shadow-sm glass">
        <CardContent className="p-4">
          <form className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Action
              </label>
              <Select name="action" defaultValue={action || "ALL"}>
                <SelectTrigger className="w-[140px] bg-white dark:bg-slate-900 border-none shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Table
              </label>
              <Select name="table" defaultValue={table || "ALL"}>
                <SelectTrigger className="w-[180px] bg-white dark:bg-slate-900 border-none shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Resources</SelectItem>
                  {tables.map((t) => (
                    <SelectItem key={t.tableName} value={t.tableName}>
                      {t.tableName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Actor
              </label>
              <Select name="actorId" defaultValue={actorId || "ALL"}>
                <SelectTrigger className="w-[200px] bg-white dark:bg-slate-900 border-none shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Users</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="h-10 px-6 rounded-xl"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
              <TableHead>Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-64 text-center text-slate-400 italic"
                >
                  No audit logs found for the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell className="text-xs font-medium text-slate-500">
                    {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <User className="h-3 w-3 text-slate-500" />
                      </div>
                      <span className="text-sm font-semibold">
                        {log.actor?.fullName || "System"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        log.action === "CREATE"
                          ? "text-emerald-600 bg-emerald-50 border-emerald-100 font-bold text-[10px]"
                          : log.action === "UPDATE"
                            ? "text-blue-600 bg-blue-50 border-blue-100 font-bold text-[10px]"
                            : "text-rose-600 bg-rose-50 border-rose-100 font-bold text-[10px]"
                      }
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] font-black uppercase text-slate-500 tracking-tighter bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                      {log.tableName}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[400px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-600">
                        ID: {log.recordId || "N/A"}
                      </span>
                      {log.note && (
                        <span className="text-[10px] text-slate-400 italic">
                          {log.note}
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      <Pagination
        totalItems={totalCount}
        pageSize={pageSize}
        currentPage={page}
      />
    </div>
  );
}
