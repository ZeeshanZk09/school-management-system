import Link from "next/link";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import {
  ProfileHeader,
  TabOverview,
  TabGuardians,
  TabAttendance,
} from "@/components/dashboard/students/profile";

export default async function StudentProfilePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  await requirePermission("students.read");
  const { id } = await params;

  // Fetch student with related data
  const student = await prisma.student.findUnique({
    where: { id, isDeleted: false },
    include: {
      enrollments: {
        include: {
          class: true,
          section: true,
          academicYear: true,
        },
        orderBy: { academicYear: { startDate: "desc" } },
      },
      guardians: {
        where: { student: { isDeleted: false } },
        include: { guardian: true },
        orderBy: { isPrimaryEmergency: "desc" },
      },
      attendance: {
        take: 10,
        orderBy: { attendanceDate: "desc" },
        include: { session: true },
      },
      documents: {
        where: { isDeleted: false },
        orderBy: { uploadedAt: "desc" },
      },
      siblings: {
        where: { isDeleted: false },
        include: {
          group: {
            include: {
              members: {
                where: { isDeleted: false, studentId: { not: id } },
                include: {
                  student: {
                    include: {
                      enrollments: {
                        where: { isDeleted: false },
                        include: { class: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const activeEnrollment = student.enrollments.find((e) => e.academicYear.isActive);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ProfileHeader student={student} activeEnrollment={activeEnrollment} />

      <Tabs defaultValue="overview" className="flex flex-col w-full">
        <TabsList className="bg-transparent border-b rounded-none h-auto p-2 gap-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="guardians">Guardians & Family</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="finance" asChild>
            <Link href={`/students/${student.id}/finance`}>Fees & Payments</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TabOverview student={student} activeEnrollment={activeEnrollment} />
        </TabsContent>

        <TabsContent value="guardians">
          <TabGuardians student={student} />
        </TabsContent>

        <TabsContent value="attendance">
          <TabAttendance student={student} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
