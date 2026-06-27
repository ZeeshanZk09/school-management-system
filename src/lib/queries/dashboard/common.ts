import type { Announcement } from "@/lib/generated/prisma/browser";
import prisma from "@/lib/prisma";

export interface DashboardAnnouncements {
  announcements: Announcement[];
}

/**
 * Fetches recent announcements for the common dashboard view.
 */
export async function getCommonDashboardData(): Promise<DashboardAnnouncements> {
  const announcements = await prisma.announcement.findMany({
    where: {
      isDeleted: false,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  return { announcements };
}
