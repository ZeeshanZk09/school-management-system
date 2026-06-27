"use client";

import { useState, useTransition } from "react";
import { Shield, Plus, Edit, Trash, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { upsertRole, deleteRole } from "./role-actions";

interface Permission {
  id: string;
  name: string;
  description: string | null;
}

interface RolePermission {
  permissionId: string;
  permission?: Permission;
}

interface Role {
  id: string;
  name: string;
  description: string | null;
  permissions: RolePermission[];
}

interface RoleListManagerProps {
  roles: Role[];
  permissions: Permission[];
}

export function RoleListManager({ roles = [], permissions = [] }: Readonly<RoleListManagerProps>) {
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Helper to group permissions by their category/prefix (e.g. students.read -> students)
  const getPermissionCategory = (name: string) => {
    const parts = name.split(".");
    return parts[0] || "other";
  };

  const categories = Array.from(new Set(permissions.map((p) => getPermissionCategory(p.name))));

  const handleOpenAdd = () => {
    setEditingRole(null);
    setRoleName("");
    setDescription("");
    setSelectedPermissions([]);
    setOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setDescription(role.description || "");
    setSelectedPermissions(role.permissions.map((rp: RolePermission) => rp.permissionId));
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) {
      toast.error("Role name is required");
      return;
    }

    startTransition(async () => {
      const result = await upsertRole(roleName, description, selectedPermissions, editingRole?.id);

      if (result.success) {
        toast.success(editingRole ? "Role updated successfully" : "Role created successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to save role");
      }
    });
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this custom role? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteRole(roleId);
      if (result.success) {
        toast.success("Role deleted successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to delete role");
      }
    });
  };

  const isSystemRole = (name: string) => {
    return ["ADMIN", "TEACHER", "ACCOUNTANT"].includes(name);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Role Directory</h2>
          <p className="text-xs text-slate-500">
            Create custom roles and manage system permissions mappings.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="gradient-primary h-10 px-5 rounded-xl shadow-md">
          <Plus className="mr-1.5 h-4 w-4" />
          Create Custom Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => {
          const permCount = role.permissions?.length || 0;
          return (
            <Card
              key={role.id}
              className="border-none shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
            >
              <div className="p-5 flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Shield
                        className={`h-4.5 w-4.5 ${isSystemRole(role.name) ? "text-blue-500" : "text-violet-500"}`}
                      />
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">
                        {role.name}
                      </span>
                      {isSystemRole(role.name) && (
                        <Badge className="bg-slate-100 text-slate-600 border-none text-[9px] scale-90">
                          System Role
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 min-h-[32px] line-clamp-2">
                      {role.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs border-b pb-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Active Permissions ({permCount})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-[140px] overflow-y-auto pr-1">
                    {role.permissions?.map((rp) => (
                      <Badge
                        key={rp.permissionId}
                        variant="secondary"
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-none text-[9px]"
                      >
                        {rp.permission?.name}
                      </Badge>
                    ))}
                    {permCount === 0 && (
                      <span className="text-xs italic text-slate-400">No permissions mapped.</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border-t flex justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(role)}
                  className="h-8 px-3 text-xs text-slate-600 hover:text-slate-900"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Edit Permissions
                </Button>
                {!isSystemRole(role.name) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(role.id)}
                    className="h-8 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                  >
                    <Trash className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="min-w-[900px] max-h-[85vh] overflow-y-auto glass border-none py-10">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="font-outfit text-2xl">
                {editingRole
                  ? `Modify Permissions: ${editingRole.name}`
                  : "Create Custom System Role"}
              </DialogTitle>
              <DialogDescription>
                Role permissions define exactly what options are visible and what actions are
                authorized.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="roleName">Role Name</Label>
                  <Input
                    id="roleName"
                    disabled={!!(editingRole && isSystemRole(editingRole.name))}
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g. VICE_PRINCIPAL"
                    required
                    className="bg-slate-50 dark:bg-slate-900 border-none uppercase"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="roleDesc">Description</Label>
                  <Input
                    id="roleDesc"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief definition of the role access rules"
                    className="bg-slate-50 dark:bg-slate-900 border-none"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white block">
                  Map Role Permissions (Check to activate)
                </span>

                {roleName.toUpperCase() === "ADMIN" && (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex gap-2 items-center">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>
                      <strong>Note:</strong> ADMIN role always receives unrestricted system access,
                      regardless of selected permission flags.
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => {
                    const catPermissions = permissions.filter(
                      (p) => getPermissionCategory(p.name) === category,
                    );

                    return (
                      <div
                        key={category}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 space-y-2.5"
                      >
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
                          {category} Management
                        </h4>
                        <div className="space-y-2">
                          {catPermissions.map((perm) => (
                            <div key={perm.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={`perm-${perm.id}`}
                                checked={selectedPermissions.includes(perm.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedPermissions([...selectedPermissions, perm.id]);
                                  } else {
                                    const ids = selectedPermissions.filter((id) => id !== perm.id);
                                    setSelectedPermissions(ids);
                                  }
                                }}
                                className="mt-0.5"
                              />
                              <div className="grid gap-0.5 leading-none">
                                <Label
                                  htmlFor={`perm-${perm.id}`}
                                  className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
                                >
                                  {perm.name}
                                </Label>
                                <span className="text-[10px] text-slate-500">
                                  {perm.description || "No description"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-4 border-t pt-4">
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
                {editingRole ? "Save Changes" : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
