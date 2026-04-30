import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { StudentForm } from '../student-form';

export default async function NewStudentPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ edit?: string; studentId?: string }>;
}>) {
  await requirePermission('students.manage');
  const params = await searchParams;
  const isEdit = params.edit === 'true';
  const studentId = params.studentId;

  let initialData = null;

  if (isEdit && studentId) {
    initialData = await prisma.student.findUnique({
      where: { id: studentId, isDeleted: false },
      include: {
        enrollments: {
          where: { academicYear: { isActive: true } },
          include: { class: true, section: true },
        },
        guardians: {
          select: { guardianId: true },
        },
      },
    });

    if (!initialData) {
      return notFound();
    }
  }

  const [classes, academicYears] = await Promise.all([
    prisma.class.findMany({
      where: { isDeleted: false },
      include: { sections: { where: { isDeleted: false } } },
      orderBy: { name: 'asc' },
    }),
    prisma.academicYear.findMany({
      where: { isDeleted: false },
      orderBy: { startDate: 'desc' },
    }),
  ]);

  return (
    <div className='space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500'>
      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight font-outfit'>
          {isEdit ? 'Edit Student' : 'Add New Student'}
        </h1>
        <p className='text-slate-500 dark:text-slate-400'>
          {isEdit
            ? `Update details for ${initialData?.fullName}`
            : 'Register a new student and enroll them in a class.'}
        </p>
      </div>

      <StudentForm classes={classes} academicYears={academicYears} initialData={initialData} />
    </div>
  );
}
