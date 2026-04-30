import { BookOpen, Layers, Plus, Settings2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { ClassForm } from './class-form';
import { SectionForm } from './section-form';
import { ClassActions } from './class-actions';

export default async function ClassesPage() {
  await requirePermission('classes.read');

  const [classes, staff] = await Promise.all([
    prisma.class.findMany({
      where: { isDeleted: false },
      include: {
        sections: {
          where: { isDeleted: false },
          include: {
            classTeacher: true,
            _count: {
              select: {
                enrollments: { where: { academicYear: { isActive: true } } },
              },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.staff.findMany({
      where: { isDeleted: false },
      orderBy: { fullName: 'asc' },
    }),
  ]);

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight font-outfit'>Classes & Sections</h1>
          <p className='text-slate-500 dark:text-slate-400'>
            Manage the academic structure and student capacities.
          </p>
        </div>
        <ClassForm>
          <Button className='gradient-primary shadow-md'>
            <Plus className='mr-2 h-4 w-4' />
            Add New Class
          </Button>
        </ClassForm>
      </div>

      <div className='grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {classes.length === 0 ? (
          <div className='col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800'>
            <BookOpen className='h-12 w-12 text-slate-300 mb-2' />
            <p className='text-slate-500 font-medium'>No classes configured yet.</p>
          </div>
        ) : (
          classes.map((cls) => (
            <Card
              key={cls.id}
              className='border-none shadow-sm glass hover-lift overflow-hidden group'
            >
              <CardHeader className='pb-3 bg-slate-50/50 dark:bg-slate-900/50 border-b'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-primary/10 text-primary'>
                      <Layers className='h-4 w-4' />
                    </div>
                    <div>
                      <CardTitle className='text-lg font-bold'>{cls.name}</CardTitle>
                      <CardDescription className='text-xs font-medium uppercase tracking-wider'>
                        {cls.code}
                      </CardDescription>
                    </div>
                  </div>
                  <ClassActions cls={cls} />
                </div>
              </CardHeader>
              <CardContent className='pt-4'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-semibold text-slate-500 uppercase tracking-tight'>
                      Sections
                    </h4>
                    <SectionForm classId={cls.id} staff={staff}>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/5'
                      >
                        <Plus className='h-3 w-3' />
                        Add Section
                      </Button>
                    </SectionForm>
                  </div>

                  <div className='grid gap-2'>
                    {cls.sections.length === 0 ? (
                      <p className='text-xs text-slate-400 italic'>No sections added yet.</p>
                    ) : (
                      cls.sections.map((section) => (
                        <div
                          key={section.id}
                          className='flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-900/50 group/section'
                        >
                          <div className='flex items-center gap-3'>
                            <span className='text-sm font-bold w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-800 rounded shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'>
                              {section.name}
                            </span>
                            <div className='flex flex-col'>
                              <div className='flex items-center gap-2'>
                                <Users className='h-3 w-3 text-slate-400' />
                                <span className='text-xs font-medium'>
                                  {section._count.enrollments} / {section.capacity || '∞'}
                                </span>
                                {section.classTeacher && (
                                  <>
                                    <span className='text-slate-300 mx-1'>|</span>
                                    <span className='text-[10px] text-primary font-bold'>
                                      {section.classTeacher.fullName}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-1 opacity-0 group-section-hover:opacity-100 transition-opacity'>
                            <SectionForm classId={cls.id} initialData={section} staff={staff}>
                              <Button variant='ghost' size='icon' className='h-6 w-6'>
                                <Settings2 className='h-3 w-3 text-slate-400' />
                              </Button>
                            </SectionForm>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
