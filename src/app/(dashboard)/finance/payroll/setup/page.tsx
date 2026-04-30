import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { SalaryStructureForm } from "./salary-structure-form";

export default async function SalarySetupPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ staffId: string }> }>) {
  await requirePermission("finance.manage");
  const params = await searchParams;
  const staffId = params.staffId;

  if (!staffId) {
    notFound();
  }

  const staff = await prisma.staff.findUnique({
    where: { id: staffId, isDeleted: false },
    include: {
      salaryStructures: {
        where: { isDeleted: false },
        include: { components: true },
        orderBy: { validFrom: "desc" },
        take: 1,
      },
    },
  });

  if (!staff) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-outfit">
          Salary Structure Setup
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Configure base pay and components for {staff.fullName}.
        </p>
      </div>

      <SalaryStructureForm
        staff={staff}
        existingStructure={staff.salaryStructures[0]}
      />
    </div>
  );
}
