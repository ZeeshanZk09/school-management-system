import prisma from "@/lib/prisma";
import { getClientIp, getClientUserAgent } from "./security/request";
import { Prisma } from "./generated/prisma/client";

type AuditAction = "CREATE" | "DELETE" | "ERROR" | "UPDATE";

interface AuditLogInput {
  actorUserId: string | null;
  action: AuditAction;
  tableName: string;
  recordId?: string | null;
  oldValue?: unknown;
  note?: string | null;
  newValue?: unknown;
}

/**
 * Normalizes values for JSON storage, converting Dates to ISO strings.
 */
function normalizeJsonValue(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return Prisma.JsonNull as unknown as Prisma.InputJsonValue;
  }

  const cloned = structuredClone(value);

  if (cloned instanceof Date) {
    return cloned.toISOString();
  }

  return cloned;
}

/**
 * Write an entry to the AuditLog table.
 * Records who did what, when, on which table, with old vs new values as JSON.
 */
export async function writeAuditLog(input: AuditLogInput): Promise<void> {
  const [ipAddress, userAgent] = await Promise.all([getClientIp(), getClientUserAgent()]);

  await prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      tableName: input.tableName,
      recordId: input.recordId ?? null,
      oldValue: normalizeJsonValue(input.oldValue),
      newValue: normalizeJsonValue(input.newValue),
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
  const ipAddress = params.ipAddress ?? (await getClientIp());
  const userAgent = params.userAgent ?? (await getClientUserAgent());

  await prisma.authEvent.create({
    data: {
      userId: params.userId ?? null,
      eventType: params.eventType,
      ipAddress,
      userAgent,
    },
  });
}
