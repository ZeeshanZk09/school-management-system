import { ChevronRight, GraduationCap, Search, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none',
  PASSED_OUT: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-none',
  WITHDRAWN: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-none',
};
import { StudentActions } from './student-actions';
import { StudentFilters } from './student-filters';
import { StudentStatus } from '@/lib/generated/prisma/enums';

export default async function StudentsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    query?: string;
    page?: string;
    pageSize?: string;
    status?: string;
    classId?: string;
    sectionId?: string;
  }>;
}>) {
  await requirePermission('students.read');
  const params = await searchParams;
  const query = params.query || '';
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const skip = (page - 1) * pageSize;
  const status = params.status as StudentStatus | undefined;
  const classId = params.classId;
  const sectionId = params.sectionId;

  // Base where clause
  const where = {
    isDeleted: false,
    ...(status && { status }),
    ...(query && {
      OR: [
        { fullName: { contains: query, mode: 'insensitive' as const } },
        { admissionNumber: { contains: query, mode: 'insensitive' as const } },
        { fatherName: { contains: query, mode: 'insensitive' as const } },
        { id: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
    ...((classId || sectionId) && {
      enrollments: {
        some: {
          academicYear: { isActive: true },
          ...(classId && { classId }),
          ...(sectionId && { sectionId }),
        },
      },
    }),
  };

  const [students, totalCount, classes, sections] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        enrollments: {
          where: { academicYear: { isActive: true } },
          include: {
            class: true,
            section: true,
          },
        },
        guardians: {
          include: {
            guardian: true,
          },
        },
      },
      orderBy: { fullName: 'asc' },
      skip,
      take: pageSize,
    }),
    prisma.student.count({ where }),
    prisma.class.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
    prisma.section.findMany({
      where: { isDeleted: false },
      select: { id: true, name: true, classId: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight font-outfit'>Student Directory</h1>
          <p className='text-slate-500 dark:text-slate-400'>
            View and manage all students enrolled in the system.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <StudentFilters
            classes={classes}
            sections={sections}
            statuses={Object.values(StudentStatus)}
          />
          <Button asChild className='gradient-primary h-10 shadow-md'>
            <Link href='/students/new'>
              <UserPlus className='mr-2 h-4 w-4' />
              Add Student
            </Link>
          </Button>
        </div>
      </div>

      <Card className='border-none shadow-sm glass overflow-hidden'>
        <CardHeader className='pb-0 pt-6 px-6'>
          <div className='relative w-full max-w-sm mb-4'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <form action='/students' method='GET'>
              <Input
                name='query'
                defaultValue={query}
                placeholder='Search by name, father name, adm #...'
                className='pl-10 h-10 bg-slate-50/50 dark:bg-slate-900/50 border-none'
              />
            </form>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50/50 dark:bg-slate-900/50 border-y'>
              <TableHead className='w-[300px]'>Student</TableHead>
              <TableHead>Admission #</TableHead>
              <TableHead>Class / Section</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-64 text-center'>
                  <div className='flex flex-col items-center justify-center space-y-2'>
                    <GraduationCap className='h-10 w-10 text-slate-300' />
                    <p className='text-slate-500 font-medium'>No students found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const activeEnrollment = student.enrollments[0];
                return (
                  <TableRow
                    key={student.id}
                    className='group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors'
                  >
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-9 w-9 ring-2 ring-primary/5'>
                          <AvatarFallback className='bg-primary/10 text-primary text-xs font-bold uppercase'>
                            {student.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-semibold text-slate-900 dark:text-white leading-tight'>
                            {student.fullName}
                          </span>
                          <span className='text-[10px] text-slate-500 uppercase tracking-wider font-medium'>
                            {student.guardians?.[0]?.guardian?.fullName
                              ? `F/N: ${student.guardians[0].guardian.fullName}`
                              : student.gender}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className='font-mono text-sm text-slate-600 dark:text-slate-400'>
                      {student.admissionNumber}
                    </TableCell>
                    <TableCell>
                      {activeEnrollment ? (
                        <div className='flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          >
                            {activeEnrollment.class.name}
                          </Badge>
                          <ChevronRight className='h-3 w-3 text-slate-300' />
                          <Badge
                            variant='outline'
                            className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          >
                            {activeEnrollment.section?.name}
                          </Badge>
                        </div>
                      ) : (
                        <span className='text-xs text-slate-400 italic'>Not Enrolled</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={STATUS_STYLES[student.status] || STATUS_STYLES.WITHDRAWN}>
                        <div className='h-1.5 w-1.5 rounded-full mr-2 bg-current' />
                        {student.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          asChild
                          variant='ghost'
                          size='sm'
                          className='h-8 px-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <Link href={`/students/${student.id}`}>View Profile</Link>
                        </Button>
                        <StudentActions studentId={student.id} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
        <div className='px-6 border-t bg-slate-50/30 dark:bg-slate-900/30'>
          <Pagination totalItems={totalCount} pageSize={pageSize} currentPage={page} />
        </div>
      </Card>
    </div>
  );
}
