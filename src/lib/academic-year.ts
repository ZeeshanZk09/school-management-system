import { cache } from "react";

import prisma from "@/lib/prisma";

export const getActiveAcademicYear = cache(async () => {
  return prisma.academicYear.findFirst({
    where: { isActive: true, isDeleted: false },
    orderBy: { startDate: "desc" },
  });
});

export function formatAcademicYearName(academicYear?: { name: string } | null) {
  return academicYear?.name ?? "No active academic year";
}
