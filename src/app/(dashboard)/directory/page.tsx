import { ArrowRight, Mail, Phone, Search } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { ExportDirectoryButton } from './export-button';

export default async function DirectoryPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ query?: string; type?: string }>;
}>) {
  await requirePermission('contacts.read');
  const params = await searchParams;
  const query = params.query || '';
  const type = params.type || 'students';

  const students =
    type === 'students'
      ? await prisma.student.findMany({
          where: {
            isDeleted: false,
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { admissionNumber: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            enrollments: {
              where: { academicYear: { isActive: true } },
              include: { class: true, section: true },
            },
            guardians: { where: { isPrimaryEmergency: true }, include: { guardian: true } },
          },
          orderBy: { fullName: 'asc' },
        })
      : [];

  const staff =
    type === 'staff'
      ? await prisma.staff.findMany({
          where: {
            isDeleted: false,
            OR: [
              { fullName: { contains: query, mode: 'insensitive' } },
              { staffNumber: { contains: query, mode: 'insensitive' } },
            ],
          },
          orderBy: { fullName: 'asc' },
        })
      : [];

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight font-outfit'>School Directory</h1>
          <p className='text-slate-500 dark:text-slate-400'>
            Searchable contact directory for students, guardians, and staff.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <ExportDirectoryButton type={type as 'students' | 'staff'} />
        </div>
      </div>

      <Tabs value={type} className='w-full flex flex-col'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4'>
          <TabsList className='bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-11'>
            <TabsTrigger
              value='students'
              asChild
              className='rounded-lg h-9 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm'
            >
              <Link href='/directory?type=students'>Students</Link>
            </TabsTrigger>
            <TabsTrigger
              value='staff'
              asChild
              className='rounded-lg h-9 px-6 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm'
            >
              <Link href='/directory?type=staff'>Staff</Link>
            </TabsTrigger>
          </TabsList>

          <div className='relative w-full max-w-sm'>
            <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400' />
            <form action='/directory' method='GET'>
              <input type='hidden' name='type' value={type} />
              <Input
                name='query'
                defaultValue={query}
                placeholder={`Search ${type}...`}
                className='pl-10 h-11 bg-white dark:bg-slate-900 border-none shadow-sm focus-visible:ring-1 focus-visible:ring-primary/20'
              />
            </form>
          </div>
        </div>

        <TabsContent value='students' className='mt-0 border-none'>
          <Card className='border-none shadow-sm glass overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50/50 dark:bg-slate-900/50 border-y'>
                  <TableHead className='w-[300px]'>Student</TableHead>
                  <TableHead>Class / Section</TableHead>
                  <TableHead>Primary Guardian</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead className='text-right'>Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-64 text-center text-slate-400'>
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  students.map((student) => {
                    const enrollment = student.enrollments[0];
                    const guardian = student.guardians[0];
                    return (
                      <TableRow
                        key={student.id}
                        className='group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors'
                      >
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <Avatar className='h-9 w-9'>
                              <AvatarFallback className='bg-blue-50 text-blue-600 text-xs font-bold'>
                                {student.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                              <span className='font-semibold text-slate-900 dark:text-white leading-tight'>
                                {student.fullName}
                              </span>
                              <span className='text-[10px] text-slate-500 uppercase tracking-wider font-medium'>
                                {student.admissionNumber}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {enrollment ? (
                            <Badge
                              variant='secondary'
                              className='bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none'
                            >
                              {enrollment.class.name} - {enrollment.section?.name}
                            </Badge>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {guardian ? (
                            <div className='flex flex-col'>
                              <span className='text-sm font-medium'>
                                {guardian.guardian.fullName}
                              </span>
                              <span className='text-[10px] text-slate-400 font-medium uppercase'>
                                {guardian.relationship}
                              </span>
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-2 text-xs text-slate-500'>
                              <Phone className='h-3 w-3' />
                              {student.phoneNumber ||
                                guardian?.guardian.primaryPhone ||
                                guardian?.guardian.secondaryPhone ||
                                'N/A'}
                            </div>
                            <div className='flex items-center gap-2 text-xs text-slate-500'>
                              <Mail className='h-3 w-3' />
                              {student.email || guardian?.guardian.email || 'N/A'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button
                            asChild
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-slate-400 hover:text-primary'
                          >
                            <Link href={`/students/${student.id}`}>
                              <ArrowRight className='h-4 w-4' />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value='staff' className='mt-0 border-none'>
          <Card className='border-none shadow-sm glass overflow-hidden'>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50/50 dark:bg-slate-900/50 border-y'>
                  <TableHead className='w-[300px]'>Staff Member</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead className='text-right'>Profile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-64 text-center text-slate-400'>
                      No staff members found.
                    </TableCell>
                  </TableRow>
                ) : (
                  staff.map((s) => (
                    <TableRow
                      key={s.id}
                      className='group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors'
                    >
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-9 w-9'>
                            <AvatarFallback className='bg-emerald-50 text-emerald-600 text-xs font-bold'>
                              {s.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className='flex flex-col'>
                            <span className='font-semibold text-slate-900 dark:text-white leading-tight'>
                              {s.fullName}
                            </span>
                            <span className='text-[10px] text-slate-500 uppercase tracking-wider font-medium'>
                              {s.staffNumber}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-sm font-medium'>{s.designation}</TableCell>
                      <TableCell className='text-sm text-slate-500'>{s.department}</TableCell>
                      <TableCell>
                        <div className='flex flex-col gap-1'>
                          <div className='flex items-center gap-2 text-xs text-slate-500'>
                            <Phone className='h-3 w-3' />
                            {s.phoneNumber || 'N/A'}
                          </div>
                          <div className='flex items-center gap-2 text-xs text-slate-500'>
                            <Mail className='h-3 w-3' />
                            {s.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button
                          asChild
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-slate-400 hover:text-primary'
                        >
                          <Link href={`/staff/${s.id}`}>
                            <ArrowRight className='h-4 w-4' />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
