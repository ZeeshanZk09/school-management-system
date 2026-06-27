import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import {
  ProfileHeader,
  TabOverview,
  TabAcademic,
  TabDocuments,
  TabPayroll,
} from "@/components/dashboard/staff/profile";

export default async function StaffProfilePage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  await requirePermission("staff.read");
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id, isDeleted: false },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
      classTeacherAssignments: {
        where: { isActive: true, isDeleted: false },
        include: { class: true, section: true, academicYear: true },
      },
      documents: { where: { isDeleted: false } },
      salaryStructures: {
        where: { isDeleted: false },
        include: { components: true },
        orderBy: { validFrom: "desc" },
      },
      salarySlips: {
        where: { isDeleted: false },
        include: { disbursements: true },
        orderBy: { periodYear: "desc" },
        take: 12,
      },
    },
  });

  if (!staff) {
    notFound();
  }

  const currentSalary = staff.salaryStructures[0];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <ProfileHeader staff={staff} />

      <Tabs defaultValue="overview" className="w-full flex flex-col">
        <TabsList className="bg-transparent border-b rounded-none h-auto p-0 gap-8">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="academic"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all"
          >
            Academic Assignment
          </TabsTrigger>
          <TabsTrigger
            value="documents"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all"
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value="payroll"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all"
          >
            Payroll
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <TabOverview staff={staff} currentSalary={currentSalary} />
        </TabsContent>

        <TabsContent value="academic">
          <TabAcademic staff={staff} />
        </TabsContent>

        <TabsContent value="documents">
          <TabDocuments staff={staff} />
        </TabsContent>

        <TabsContent value="payroll">
          <TabPayroll staff={staff} currentSalary={currentSalary} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
