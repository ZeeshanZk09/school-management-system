import { Clock, Mail, UserPlus, Users, ShieldAlert } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { ApprovalButton } from "./approval-button";
import { UserForm } from "./user-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { RoleListManager } from "./role-list-manager";
import { UserRowActions } from "./user-row-actions";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 border-none text-[10px] font-bold",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700 border-none text-[10px] font-bold",
  DEACTIVATED: "bg-rose-100 text-rose-700 border-none text-[10px] font-bold",
};

export default async function UsersPage() {
  await requirePermission("system.manage");

  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    include: {
      roles: {
        include: {
          role: {
            include: {
              permissions: {
                include: { permission: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const roles = await prisma.role.findMany({
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  const permissions = await prisma.permission.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title="Access Control Center"
        description="Control system access, customize role permission sets, and approve new user accounts."
      />

      <Tabs defaultValue="users" className="flex flex-col w-full">
        <TabsList className="bg-slate-100/80 dark:bg-slate-900/80 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="users"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all data-active:bg-white dark:data-active:bg-slate-800 data-active:shadow-sm"
          >
            <Users className="h-4 w-4" />
            User Accounts
          </TabsTrigger>
          <TabsTrigger
            value="roles"
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all data-active:bg-white dark:data-active:bg-slate-800 data-active:shadow-sm"
          >
            <ShieldAlert className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6 outline-none">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Active Accounts
                </h3>
                <p className="text-xs text-slate-500">
                  Assign system access rights to teachers, accountants, or administrators.
                </p>
              </div>
              <UserForm roles={roles}>
                <Button className="gradient-primary h-10 px-5 rounded-xl shadow-md">
                  <UserPlus className="mr-1.5 h-4 w-4" />
                  Create System User
                </Button>
              </UserForm>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
                  <TableHead className="w-[300px] text-xs font-bold text-slate-400">
                    User Details
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-400">
                    Assigned Roles & Effective Permissions
                  </TableHead>
                  <TableHead className="text-xs font-bold text-slate-400">Account Status</TableHead>
                  <TableHead className="text-xs font-bold text-slate-400">
                    Last Seen Active
                  </TableHead>
                  <TableHead className="text-right text-xs font-bold text-slate-400">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow
                    key={user.id}
                    className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
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
                      <div className="flex flex-col gap-1.5">
                        <div className="flex flex-wrap gap-1">
                          {user.roles?.map((ur) => (
                            <Badge
                              key={ur.roleId}
                              variant="secondary"
                              className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-100 text-[10px] font-bold"
                            >
                              {ur.role?.name || "Unknown"}
                            </Badge>
                          ))}
                        </div>

                        {/* Summary of effective permissions on hover/view */}
                        <div className="flex flex-wrap gap-0.5 max-w-[400px]">
                          {(() => {
                            const effectivePerms = new Set<string>();
                            user.roles?.forEach((ur) => {
                              ur.role?.permissions?.forEach((rp) => {
                                if (rp.permission?.name) {
                                  effectivePerms.add(rp.permission.name);
                                }
                              });
                            });

                            return Array.from(effectivePerms)
                              .slice(0, 5)
                              .map((perm) => (
                                <span
                                  key={perm}
                                  className="text-[9px] text-slate-400 bg-slate-50 dark:bg-slate-900 px-1 py-0.5 rounded border"
                                >
                                  {perm}
                                </span>
                              ));
                          })()}
                          {(() => {
                            const total = new Set<string>();
                            user.roles?.forEach((ur) => {
                              ur.role?.permissions?.forEach((rp) => {
                                if (rp.permission?.name) total.add(rp.permission.name);
                              });
                            });
                            return total.size > 5 ? (
                              <span className="text-[9px] text-slate-400 font-bold px-1">
                                +{total.size - 5} more
                              </span>
                            ) : null;
                          })()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[user.status] || STATUS_STYLES.DEACTIVATED}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "PENDING_APPROVAL" && (
                          <ApprovalButton userId={user.id} roles={roles} />
                        )}
                        <UserRowActions user={user} roles={roles} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="outline-none">
          <RoleListManager roles={roles} permissions={permissions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
