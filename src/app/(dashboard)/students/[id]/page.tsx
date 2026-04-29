import { format } from 'date-fns';
import {
  Edit,
  GraduationCap,
  History,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldAlert,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { GuardianForm } from './guardian-form';

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('students.read');
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id, isDeleted: false },
    include: {
      enrollments: {
        include: {
          class: true,
          section: true,
          academicYear: true,
        },
        orderBy: { academicYear: { startDate: 'desc' } },
      },
      guardians: {
        where: { student: { isDeleted: false } },
        include: { guardian: true },
        orderBy: { isPrimaryEmergency: 'desc' },
      },
    },
  });

  if (!student) {
    notFound();
  }

  const activeEnrollment = student.enrollments.find((e) => e.academicYear.isActive);

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div className='flex items-center gap-6'>
          <Avatar className='h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-xl'>
            <AvatarImage src='' />
            <AvatarFallback className='bg-primary/10 text-primary text-2xl font-bold'>
              {student.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tight font-outfit'>{student.fullName}</h1>
              <Badge
                className={
                  student.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-100 text-slate-700'
                }
              >
                {student.status}
              </Badge>
            </div>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500'>
              <div className='flex items-center gap-1.5'>
                <GraduationCap className='h-4 w-4' />
                <span>
                  {activeEnrollment
                    ? `${activeEnrollment.class.name} - ${activeEnrollment.section?.name}`
                    : 'Not Enrolled'}
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <ShieldAlert className='h-4 w-4' />
                <span>ID: {student.admissionNumber}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild className='h-10'>
            <Link href={`/students/${student.id}/edit`}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Profile
            </Link>
          </Button>
          <Button className='gradient-primary h-10 shadow-md'>Generate Report</Button>
        </div>
      </div>

      <Tabs defaultValue='overview' className='w-full'>
        <TabsList className='bg-transparent border-b rounded-none h-auto p-0 gap-8'>
          <TabsTrigger
            value='overview'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            value='guardians'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Guardians & Family
          </TabsTrigger>
          <TabsTrigger
            value='attendance'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Attendance
          </TabsTrigger>
          <TabsTrigger
            value='finance'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Fees & Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='pt-6 grid gap-6 md:grid-cols-3'>
          <div className='md:col-span-2 space-y-6'>
            <Card className='border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-lg font-bold'>Personal Details</CardTitle>
              </CardHeader>
              <CardContent className='grid sm:grid-cols-2 gap-6'>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Date of Birth
                  </p>
                  <p className='text-sm font-medium'>
                    {format(new Date(student.dateOfBirth!), 'PPP')}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Gender
                  </p>
                  <p className='text-sm font-medium'>{student.gender}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Admission Date
                  </p>
                  <p className='text-sm font-medium'>
                    {format(new Date(student.admissionDate), 'PPP')}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Roll Number
                  </p>
                  <p className='text-sm font-medium'>
                    {activeEnrollment?.rollNumber || 'Not Assigned'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-lg font-bold'>Contact & Address</CardTitle>
              </CardHeader>
              <CardContent className='grid sm:grid-cols-2 gap-6'>
                <div className='flex items-start gap-3'>
                  <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-800'>
                    <Mail className='h-4 w-4 text-slate-500' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                      Email Address
                    </p>
                    <p className='text-sm font-medium'>{student.email || 'N/A'}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3'>
                  <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-800'>
                    <Phone className='h-4 w-4 text-slate-500' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                      Phone Number
                    </p>
                    <p className='text-sm font-medium'>{student.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className='flex items-start gap-3 sm:col-span-2'>
                  <div className='p-2 rounded-lg bg-slate-100 dark:bg-slate-800'>
                    <MapPin className='h-4 w-4 text-slate-500' />
                  </div>
                  <div className='space-y-1'>
                    <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                      Residential Address
                    </p>
                    <p className='text-sm font-medium'>{student.address || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-6'>
            <Card className='border-none shadow-sm glass bg-gradient-to-br from-primary/5 to-transparent'>
              <CardHeader>
                <CardTitle className='text-sm font-bold flex items-center gap-2 uppercase tracking-wider'>
                  <History className='h-4 w-4 text-primary' />
                  Academic History
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {student.enrollments.map((e, _i) => (
                  <div
                    key={e.id}
                    className='relative pl-6 pb-4 border-l last:pb-0 border-slate-200 dark:border-slate-800'
                  >
                    <div className='absolute left-[-5px] top-0 h-2 w-2 rounded-full bg-primary' />
                    <p className='text-xs font-bold text-primary mb-1'>{e.academicYear.name}</p>
                    <p className='text-sm font-semibold'>
                      {e.class.name} - {e.section?.name}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className='border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-sm font-bold uppercase tracking-wider'>
                  Documents
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                <div className='flex items-center justify-between p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400'>
                  <span>No documents uploaded.</span>
                  <Button variant='ghost' size='sm' className='h-7 px-2 text-primary'>
                    Upload
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='guardians' className='pt-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold'>Guardian Information</h2>
            <GuardianForm studentId={student.id}>
              <Button size='sm' className='gradient-primary'>
                <Plus className='mr-2 h-4 w-4' />
                Add Guardian
              </Button>
            </GuardianForm>
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            {student.guardians.length === 0 ? (
              <div className='col-span-full h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400'>
                No guardians linked to this student.
              </div>
            ) : (
              student.guardians.map((link) => (
                <Card key={link.guardianId} className='border-none shadow-sm glass group/card'>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600'>
                        <Users className='h-5 w-5' />
                      </div>
                      <div>
                        <CardTitle className='text-base font-bold'>
                          {link.guardian.fullName}
                        </CardTitle>
                        <Badge variant='secondary' className='text-[10px] uppercase font-bold'>
                          {link.relationship}
                        </Badge>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {link.isPrimaryEmergency && (
                        <Badge className='bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold'>
                          PRIMARY
                        </Badge>
                      )}
                      <GuardianForm
                        studentId={student.id}
                        initialData={{
                          id: link.guardianId,
                          fullName: link.guardian.fullName,
                          relation: link.relationship,
                          phoneNumber: link.guardian.primaryPhone,
                          email: link.guardian.email,
                          occupation: link.guardian.occupation,
                          isPrimary: link.isPrimaryEmergency,
                        }}
                      >
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 opacity-0 group-card-hover:opacity-100 transition-opacity'
                        >
                          <Edit className='h-3.5 w-3.5' />
                        </Button>
                      </GuardianForm>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-4 space-y-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='space-y-1'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                          Phone
                        </p>
                        <p className='text-sm font-medium'>{link.guardian.primaryPhone}</p>
                      </div>
                      <div className='space-y-1'>
                        <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                          Email
                        </p>
                        <p className='text-sm font-medium'>{link.guardian.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className='space-y-1'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        Occupation
                      </p>
                      <p className='text-sm font-medium'>{link.guardian.occupation || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='attendance' className='pt-6'>
          <Card className='border-none shadow-sm glass h-64 flex items-center justify-center text-slate-400 italic'>
            Detailed attendance history will be implemented in Phase 4.
          </Card>
        </TabsContent>

        <TabsContent value='finance' className='pt-6'>
          <Card className='border-none shadow-sm glass h-64 flex items-center justify-center text-slate-400 italic'>
            Financial records will be implemented in Phase 5.
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
