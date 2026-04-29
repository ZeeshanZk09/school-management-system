import { format } from "date-fns";
import { requireRole } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { PasswordRequestsClient } from "./client";

export default async function PasswordRequestsPage() {
  await requireRole("ADMIN");

  const requests = await prisma.passwordResetRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
          roles: {
            select: {
              role: { select: { name: true } },
            },
          },
        },
      },
      decidedBy: {
        select: { fullName: true },
      },
    },
  });

  const serialized = requests.map((r) => ({
    id: r.id,
    userFullName: r.user.fullName,
    userEmail: r.user.email,
    userRoles: r.user.roles.map((ur) => ur.role.name),
    status: r.status,
    createdAt: format(r.createdAt, "MMM dd, yyyy HH:mm"),
    expiresAt: format(r.expiresAt, "MMM dd, yyyy HH:mm"),
    decidedAt: r.decidedAt ? format(r.decidedAt, "MMM dd, yyyy HH:mm") : null,
    decidedByName: r.decidedBy?.fullName || null,
    decisionNote: r.decisionNote,
    isExpired: r.expiresAt <= new Date() && r.status === "PENDING_APPROVAL",
  }));

  return <PasswordRequestsClient requests={serialized} />;
}
