import { type NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    await requirePermission("students.read");
    
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query || query.length < 3) {
      return NextResponse.json([], { status: 200 });
    }

    const students = await prisma.student.findMany({
      where: {
        isDeleted: false,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { admissionNumber: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        enrollments: {
          where: { isDeleted: false },
          include: { class: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      take: 10,
    });

    const formatted = students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      admissionNumber: s.admissionNumber,
      currentClass: s.enrollments[0]?.class.name || null,
    }));

    return NextResponse.json(formatted);
  } catch (_error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
