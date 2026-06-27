"use client";

import { Ban, CheckCircle, Key, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetUserPassword, toggleUserStatus, upsertUser } from "./actions";

interface PermissionRelation {
  permission: {
    name: string;
  };
}

interface RoleWithPermissions {
  id: string;
  name: string;
  description: string | null;
  permissions?: PermissionRelation[];
}

interface UserRoleLink {
  roleId: string;
  role?: RoleWithPermissions;
}

interface UserData {
  id: string;
  fullName: string;
  email: string;
  status: string;
  roles?: UserRoleLink[];
}

export function UserForm({
  children,
  roles = [],
  initialData,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: Readonly<{
  children: React.ReactNode;
  roles: RoleWithPermissions[];
  initialData?: UserData;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}>) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [isPending, setIsPending] = useState(false);

  // Safely initialize selected roles
  const [selectedRoles, setSelectedRoles] = useState<string[]>(() => {
    if (!initialData?.roles || !Array.isArray(initialData.roles)) {
      return [];
    }
    return initialData.roles.map((r: UserRoleLink) => r.roleId).filter(Boolean);
  });

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    formData.append("roleIds", JSON.stringify(selectedRoles));

    const result = await upsertUser(formData, initialData?.id);

    setIsPending(false);

    if (result.success) {
      toast.success(initialData ? "User updated" : "User created");
      setOpen(false);
      router.refresh();
    } else {
      toast.error(result.message || "Something went wrong");
    }
  };

  const handleResetPassword = async () => {
    if (!confirm("Are you sure you want to reset this user's password to default?")) {
      return;
    }

    setIsPending(true);
    const result = await resetUserPassword(initialData?.id || "");
    setIsPending(false);

    if (result.success) {
      toast.success("Password reset to default (School@123)");
    } else {
      toast.error(result.message);
    }
  };

  const handleToggleStatus = async () => {
    setIsPending(true);
    const result = await toggleUserStatus(initialData?.id || "");
    setIsPending(false);

    if (result.success) {
      toast.success(`User ${result.status === "ACTIVE" ? "activated" : "deactivated"}`);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] glass border-none">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-outfit text-2xl">
              {initialData ? "Edit User" : "Create New User"}
            </DialogTitle>
            <DialogDescription>
              Assign roles and set account status for system access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  defaultValue={initialData?.fullName}
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={initialData?.email}
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none"
                />
              </div>
            </div>

            {!initialData && (
              <div className="grid gap-2">
                <Label htmlFor="password">Initial Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  defaultValue="School@123"
                  required
                  className="bg-slate-50 dark:bg-slate-900 border-none"
                />
              </div>
            )}

            <fieldset className="grid gap-3">
              <legend className="text-sm font-medium leading-none">
                System Roles & Permissions
              </legend>
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex flex-col gap-1 border border-slate-100 dark:border-slate-800 p-2.5 rounded-lg bg-white dark:bg-slate-950"
                  >
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={role.id}
                        checked={selectedRoles.includes(role.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedRoles([...selectedRoles, role.id]);
                          } else {
                            setSelectedRoles(selectedRoles.filter((id) => id !== role.id));
                          }
                        }}
                      />
                      <Label
                        htmlFor={role.id}
                        className="text-xs font-extrabold cursor-pointer text-slate-900 dark:text-white"
                      >
                        {role.name}
                      </Label>
                    </div>
                    <span className="text-[10px] text-slate-500 line-clamp-1 pl-6">
                      {role.description || "System assigned access"}
                    </span>
                  </div>
                ))}
              </div>

              {/* Dynamic effective permissions summary */}
              {selectedRoles.length > 0 && (
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Granted Permissions Set
                  </p>
                  <div className="flex flex-wrap gap-1 max-h-[120px] overflow-y-auto pr-1">
                    {(() => {
                      const allPerms = new Set<string>();
                      for (const roleId of selectedRoles) {
                        const roleObj = roles.find((r) => r.id === roleId);
                        if (roleObj?.permissions) {
                          for (const rp of roleObj.permissions) {
                            if (rp.permission?.name) {
                              allPerms.add(rp.permission.name);
                            }
                          }
                        }
                      }
                      return Array.from(allPerms)
                        .sort((a, b) => a.localeCompare(b))
                        .map((name) => (
                          <span
                            key={name}
                            className="px-2 py-0.5 rounded-md text-[9px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                          >
                            {name}
                          </span>
                        ));
                    })()}
                  </div>
                </div>
              )}
            </fieldset>

            {initialData && (
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Danger Zone
                </p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={handleResetPassword}
                    disabled={isPending}
                  >
                    <Key className="mr-2 h-3 w-3" />
                    Reset Pwd
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={`flex-1 ${initialData.status === "ACTIVE" ? "text-rose-500 hover:text-rose-600" : "text-emerald-500 hover:text-emerald-600"}`}
                    onClick={handleToggleStatus}
                    disabled={isPending}
                  >
                    {initialData.status === "ACTIVE" ? (
                      <Ban className="mr-2 h-3 w-3" />
                    ) : (
                      <CheckCircle className="mr-2 h-3 w-3" />
                    )}
                    {initialData.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? "Update User" : "Create User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
