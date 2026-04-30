import { Clock, Mail, MoreVertical, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { ApprovalButton } from "./approval-button";
import { UserForm } from "./user-form";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 border-none',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-700 border-none',
  DEACTIVATED: 'bg-rose-100 text-rose-700 border-none',
};

export default async function UsersPage() {
  await requirePermission("system.manage");

  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    include: {
      roles: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const roles = await prisma.role.findMany();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Control system access, assign roles, and manage user accounts.
          </p>
        </div>
        <UserForm roles={roles}>
          <Button className="gradient-primary h-11 px-6 rounded-xl shadow-lg">
            <UserPlus className="mr-2 h-4 w-4" />
            Create System User
          </Button>
        </UserForm>
      </div>

      <Card className="border-none shadow-sm glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
              <TableHead className="w-[300px]">User</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {user.fullName}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((ur) => (
                      <Badge
                        key={ur.roleId}
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-100 text-[10px] font-bold"
                      >
                        {ur.role.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={STATUS_STYLES[user.status] || STATUS_STYLES.DEACTIVATED}
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString()
                      : "Never"}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.status === "PENDING_APPROVAL" && (
                      <ApprovalButton userId={user.id} roles={roles} />
                    )}
                    <UserForm roles={roles} initialData={user}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Edit
                      </Button>
                    </UserForm>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
