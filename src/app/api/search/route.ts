import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    if (!query || query.length < 2) {
      return NextResponse.json({ students: [], staff: [] });
    }

    const [students, staff] = await Promise.all([
      prisma.student.findMany({
        where: {
          isDeleted: false,
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { admissionNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, fullName: true, admissionNumber: true },
      }),
      prisma.staff.findMany({
        where: {
          isDeleted: false,
          OR: [
            { fullName: { contains: query, mode: "insensitive" } },
            { staffNumber: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: { id: true, fullName: true, designation: true },
      }),
    ]);

    return NextResponse.json({ students, staff });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
