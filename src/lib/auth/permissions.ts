import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getSessionUser } from "@/lib/auth/session";

import { SESSION_COOKIE_NAME } from "@/lib/constants";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

/**
 * Get the currently authenticated user from the session cookie.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return getSessionUser(token);
}

/**
 * Require authentication. Redirects to /login if not logged in.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

/**
 * Require a specific role. Throws ForbiddenError if the user doesn't have it.
 * Admin always has access to everything.
 */
export async function requireRole(
  ...allowedRoles: string[]
): Promise<SessionUser> {
  const user = await requireAuth();

  // Admin has unrestricted access
  if (user.roles.includes("ADMIN")) {
    return user;
  }

  const hasRole = user.roles.some((role) => allowedRoles.includes(role));

  if (!hasRole) {
    throw new ForbiddenError();
  }

  return user;
}

/**
 * Check if the user has permission based on the permission name.
 * Uses the RolePermission table to verify.
 */
export async function requirePermission(
  permissionName: string,
): Promise<SessionUser> {
  const user = await requireAuth();

  // Admin has all permissions
  if (user.roles.includes("ADMIN")) {
    return user;
  }

  const { default: prisma } = await import("@/lib/prisma");

  const permissionCount = await prisma.userRole.count({
    where: {
      userId: user.id,
      role: {
        permissions: {
          some: {
            permission: {
              name: permissionName,
            },
          },
        },
      },
    },
  });

  if (permissionCount === 0) {
    throw new ForbiddenError();
  }

  return user;
}

/**
 * Check if the current user is a teacher assigned to a specific class.
 */
export function isTeacherForClass(
  user: SessionUser,
  classId: string,
  sectionId?: string | null,
): boolean {
  if (user.roles.includes("ADMIN")) {
    return true;
  }

  if (!user.assignedClasses || user.assignedClasses.length === 0) {
    return false;
  }

  return user.assignedClasses.some((assignment) => {
    if (assignment.classId !== classId) {
      return false;
    }
    if (
      sectionId &&
      assignment.sectionId &&
      assignment.sectionId !== sectionId
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Check if a user has a specific permission (non-throwing)
 */
export async function hasPermission(
  userId: string,
  permissionName: string,
): Promise<boolean> {
  const { default: prisma } = await import("@/lib/prisma");

  // Get user with roles
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } } },
  });

  if (!user) return false;

  // Admin always has permission
  if (user.roles.some((ur) => ur.role.name === "ADMIN")) return true;

  const count = await prisma.rolePermission.count({
    where: {
      permission: { name: permissionName },
      role: {
        users: { some: { userId } },
      },
    },
  });

  return count > 0;
}
