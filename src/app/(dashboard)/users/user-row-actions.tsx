"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Key, Ban, CheckCircle, Edit } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resetUserPassword, toggleUserStatus } from "./actions";
import { UserForm } from "./user-form";

interface RoleOption {
  id: string;
  name: string;
  description: string | null;
  permissions?: {
    permission: {
      name: string;
    };
  }[];
}

interface UserRowActionsProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    status: string;
    roles?: {
      roleId: string;
    }[];
  };
  roles: RoleOption[];
}

export function UserRowActions({ user, roles }: Readonly<UserRowActionsProps>) {
  const [isPending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (
      !confirm(
        `Are you sure you want to reset ${user.fullName}'s password to default (School@123)?`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await resetUserPassword(user.id);
      if (result.success) {
        toast.success("Password reset to default (School@123)");
      } else {
        toast.error(result.message || "Failed to reset password");
      }
    });
  };

  const handleToggleStatus = async () => {
    startTransition(async () => {
      const result = await toggleUserStatus(user.id);
      if (result.success) {
        toast.success(`User account ${result.status === "ACTIVE" ? "activated" : "deactivated"}`);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to modify status");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      {/* Edit button in row is wrapped in the Dialog trigger */}
      <UserForm roles={roles} initialData={user} open={editOpen} onOpenChange={setEditOpen}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditOpen(true)}
          className="h-8 px-3 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="mr-1 h-3.5 w-3.5" />
          Edit
        </Button>
      </UserForm>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
            disabled={isPending}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[180px] glass border-none">
          <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Account Options
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-100" />

          <DropdownMenuItem
            onClick={() => setEditOpen(true)}
            className="text-xs font-semibold cursor-pointer"
          >
            <Edit className="mr-2 h-3.5 w-3.5" />
            Edit Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleResetPassword}
            className="text-xs font-semibold cursor-pointer text-slate-600"
          >
            <Key className="mr-2 h-3.5 w-3.5 text-slate-400" />
            Reset Password
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleToggleStatus}
            className={`text-xs font-semibold cursor-pointer ${user.status === "ACTIVE" ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}`}
          >
            {user.status === "ACTIVE" ? (
              <>
                <Ban className="mr-2 h-3.5 w-3.5 text-rose-500" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-3.5 w-3.5 text-emerald-500" />
                Activate
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
