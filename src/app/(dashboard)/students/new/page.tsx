import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { StudentForm } from "../student-form";

export default async function NewStudentPage() {
  await requirePermission("students.manage");

  const [classes, academicYears] = await Promise.all([
    prisma.class.findMany({
      where: { isDeleted: false },
      include: { sections: { where: { isDeleted: false } } },
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      where: { isDeleted: false },
      orderBy: { startDate: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-outfit">
          Add New Student
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Register a new student and enroll them in a class.
        </p>
      </div>

      <StudentForm classes={classes} academicYears={academicYears} />
    </div>
  );
}
