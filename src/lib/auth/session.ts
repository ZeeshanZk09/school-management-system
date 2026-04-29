import { createHash, randomBytes } from "node:crypto";

import prisma from "@/lib/prisma";

const SESSION_TOKEN_BYTES = 32;
const DEFAULT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24; // 24 hours
const REMEMBER_ME_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateSessionToken(): string {
  return randomBytes(SESSION_TOKEN_BYTES).toString("base64url");
}

export async function createSession(params: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  rememberMe?: boolean;
}): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const maxAge = params.rememberMe
    ? REMEMBER_ME_MAX_AGE_SECONDS
    : DEFAULT_SESSION_MAX_AGE_SECONDS;
  const expiresAt = new Date(Date.now() + maxAge * 1000);

  await prisma.session.create({
    data: {
      userId: params.userId,
      tokenHash,
      expiresAt,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      lastSeenAt: new Date(),
    },
  });

  // Update user's lastLoginAt
  await prisma.user.update({
    where: { id: params.userId },
    data: { lastLoginAt: new Date() },
  });

  return { token, expiresAt };
}

export async function validateSession(token: string): Promise<{
  userId: string;
  roles: string[];
  sessionId: string;
} | null> {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          status: true,
          isDeleted: true,
          roles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  // Session expired
  if (session.expiresAt <= new Date()) {
    return null;
  }

  // Session revoked
  if (session.revokedAt) {
    return null;
  }

  // User deactivated or soft-deleted
  if (session.user.status !== "ACTIVE" || session.user.isDeleted) {
    return null;
  }

  // Touch lastSeenAt (fire-and-forget, don't block response)
  prisma.session
    .update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {
      // Silently ignore touch failures
    });

  return {
    userId: session.user.id,
    roles: session.user.roles.map((r) => r.role.name),
    sessionId: session.id,
  };
}

export async function destroySession(token: string): Promise<void> {
  if (!token) {
    return;
  }

  const tokenHash = hashToken(token);

  await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: {
      revokedAt: new Date(),
      revokedReason: "USER_LOGOUT",
    },
  });
}

export async function revokeAllUserSessions(
  userId: string,
  reason:
    | "ADMIN_REVOKED"
    | "PASSWORD_CHANGED"
    | "ROLE_CHANGED"
    | "ACCOUNT_DEACTIVATED"
    | "COMPROMISED" = "ADMIN_REVOKED",
): Promise<void> {
  await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: {
      revokedAt: new Date(),
      revokedReason: reason,
    },
  });
}

export async function getSessionUser(token: string) {
  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      expiresAt: true,
      revokedAt: true,
      user: {
        select: {
          id: true,
          email: true,
          fullName: true,
          status: true,
          isDeleted: true,
          roles: {
            select: {
              role: {
                select: { name: true },
              },
            },
          },
          staff: {
            select: {
              id: true,
              classTeacherAssignments: {
                where: { isActive: true, isDeleted: false },
                select: {
                  classId: true,
                  sectionId: true,
                  academicYearId: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!session || session.expiresAt <= new Date() || session.revokedAt) {
    return null;
  }

  if (session.user.status !== "ACTIVE" || session.user.isDeleted) {
    return null;
  }

  const roles = session.user.roles.map((r) => r.role.name);

  return {
    id: session.user.id,
    email: session.user.email,
    fullName: session.user.fullName,
    roles,
    staffId: session.user.staff?.id ?? null,
    assignedClasses: session.user.staff?.classTeacherAssignments ?? [],
  };
}
