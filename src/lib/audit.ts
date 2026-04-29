import { headers } from "next/headers";
import prisma from "@/lib/prisma";

type AuditLogInput = {
  actorUserId: string | null;
  action: "CREATE" | "UPDATE" | "DELETE";
  tableName: string;
  recordId?: string | null;
  oldValue?: unknown;
  note?: string | null;
  newValue?: unknown;
};

function toJsonValue(value: unknown): any {
  if (value === null || value === undefined) {
    return null;
  }

  const cloned = structuredClone(value);

  if (cloned instanceof Date) {
    return cloned.toISOString();
  }

  return cloned;
}

function resolveForwardedIp(headerValue: string | null): string | null {
  if (!headerValue) {
    return null;
  }
  return headerValue.split(",")[0]?.trim() ?? null;
}

/**
 * Write an entry to the AuditLog table.
 * Records who did what, when, on which table, with old vs new values as JSON.
 */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  try {
    const requestHeaders = await headers();
    ipAddress =
      resolveForwardedIp(requestHeaders.get("x-forwarded-for")) ??
      requestHeaders.get("x-real-ip") ??
      null;
    userAgent = requestHeaders.get("user-agent");
  } catch {
    // Headers unavailable in some execution contexts
  }

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      tableName: input.tableName,
      recordId: input.recordId ?? null,
      oldValue: toJsonValue(input.oldValue),
      newValue: toJsonValue(input.newValue),
      note: input.note ?? null,
      ipAddress,
      userAgent,
    },
  });
}

/**
 * Log an authentication event (login/logout).
 */
export async function writeAuthEvent(params: {
  userId?: string | null;
  eventType: "LOGIN" | "LOGOUT";
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  let ip = params.ipAddress ?? null;
  let ua = params.userAgent ?? null;

  if (!ip || !ua) {
    try {
      const requestHeaders = await headers();
      if (!ip) {
        ip =
          resolveForwardedIp(requestHeaders.get("x-forwarded-for")) ??
          requestHeaders.get("x-real-ip") ??
          null;
      }
      if (!ua) {
        ua = requestHeaders.get("user-agent");
      }
    } catch {
      // Headers unavailable
    }
  }

  await prisma.authEvent.create({
    data: {
      userId: params.userId ?? null,
      eventType: params.eventType,
      ipAddress: ip,
      userAgent: ua,
    },
  });
}
