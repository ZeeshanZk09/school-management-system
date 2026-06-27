import { cache } from "react";
import prisma from "@/lib/prisma";

/**
 * Fetches the currently active academic year from the database.
 * Results are cached for the duration of the request.
 */
export const getActiveAcademicYear = cache(async () => {
  return prisma.academicYear.findFirst({
    where: { isActive: true, isDeleted: false },
    orderBy: { startDate: "desc" },
  });
});

/**
 * Formats an academic year object into a displayable string.
 *
 * @param academicYear - The academic year object to format.
 * @returns A formatted string or a fallback message.
 */
export function formatAcademicYearName(academicYear?: { name: string } | null): string {
  return academicYear?.name ?? "No active academic year";
}
