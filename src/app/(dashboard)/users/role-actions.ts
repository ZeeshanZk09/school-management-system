"use server";

import { revalidatePath } from "next/cache";
import { writeAuditLog } from "@/lib/audit";
import { requirePermission } from "@/lib/auth/permissions";
import { revokeAllUserSessions } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function upsertRole(
  name: string,
  description: string,
  permissionIds: string[],
  roleId?: string,
) {
  try {
    const actor = await requirePermission("system.manage");

    // Standardize role name (must be uppercase, alphanumeric/underscore)
    const normalizedName = name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, "_");

    if (!normalizedName) {
      throw new Error("Invalid role name");
    }

    if (roleId) {
      // Update existing role
      const oldRole = await prisma.role.findUnique({
        where: { id: roleId },
        include: { permissions: true },
      });

      if (oldRole?.name === "ADMIN" && normalizedName !== "ADMIN") {
        throw new Error("Cannot rename the ADMIN role");
      }

      await prisma.$transaction(async (tx) => {
        await tx.role.update({
          where: { id: roleId },
          data: { name: normalizedName, description },
        });

        // Sync permissions
        // 1. Delete relations no longer included
        await tx.rolePermission.deleteMany({
          where: {
            roleId,
            permissionId: { notIn: permissionIds },
          },
        });

        // 2. Add new relations
        for (const permId of permissionIds) {
          await tx.rolePermission.upsert({
            where: {
              roleId_permissionId: { roleId, permissionId: permId },
            },
            create: { roleId, permissionId: permId },
            update: {},
          });
        }
      });

      await writeAuditLog({
        actorUserId: actor.id,
        action: "UPDATE",
        tableName: "Role",
        recordId: roleId,
        oldValue: oldRole,
        newValue: { name: normalizedName, description, permissionIds },
      });

      // Revoke active sessions for all users having this role to enforce permission updates immediately
      const userRoles = await prisma.userRole.findMany({
        where: { roleId },
        select: { userId: true },
      });
      for (const ur of userRoles) {
        await revokeAllUserSessions(ur.userId, "ROLE_CHANGED");
      }
    } else {
      // Create new role
      const existing = await prisma.role.findUnique({
        where: { name: normalizedName },
      });
      if (existing) {
        throw new Error(`Role with name "${normalizedName}" already exists`);
      }

      const newRole = await prisma.role.create({
        data: {
          name: normalizedName,
          description,
          permissions: {
            create: permissionIds.map((permId) => ({
              permissionId: permId,
            })),
          },
        },
      });

      await writeAuditLog({
        actorUserId: actor.id,
        action: "CREATE",
        tableName: "Role",
        recordId: newRole.id,
        newValue: { name: normalizedName, description, permissionIds },
      });
    }

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error upserting role:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upsert role",
    };
  }
}

export async function deleteRole(roleId: string) {
  try {
    const actor = await requirePermission("system.manage");

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { users: true },
    });

    if (!role) throw new Error("Role not found");
    if (role.name === "ADMIN" || role.name === "TEACHER" || role.name === "ACCOUNTANT") {
      throw new Error("System roles cannot be deleted");
    }

    if (role.users.length > 0) {
      throw new Error("Cannot delete role while it is assigned to users");
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    await writeAuditLog({
      actorUserId: actor.id,
      action: "DELETE",
      tableName: "Role",
      recordId: roleId,
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Error deleting role:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to delete role",
    };
  }
}
