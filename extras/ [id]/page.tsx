import { format } from 'date-fns';
import {
  Briefcase,
  DollarSign,
  Edit,
  FileText,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

export default async function StaffProfilePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('staff.read');
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
        orderBy: { validFrom: 'desc' },
      },
      salarySlips: {
        where: { isDeleted: false },
        include: { disbursements: true },
        orderBy: { periodYear: 'desc' },
        take: 12,
      },
    },
  });

  if (!staff) {
    notFound();
  }

  const currentSalary = staff.salaryStructures[0];

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div className='flex items-center gap-6'>
          <Avatar className='h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-xl'>
            <AvatarImage src='' />
            <AvatarFallback className='bg-emerald-50 text-emerald-600 text-2xl font-bold'>
              {staff.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-3'>
              <h1 className='text-3xl font-bold tracking-tight font-outfit'>{staff.fullName}</h1>
              <Badge
                variant='outline'
                className='bg-emerald-50 text-emerald-700 border-emerald-100'
              >
                {staff.employmentType}
              </Badge>
            </div>
            <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500'>
              <div className='flex items-center gap-1.5'>
                <Briefcase className='h-4 w-4' />
                <span>
                  {staff.designation} • {staff.department}
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <ShieldCheck className='h-4 w-4' />
                <span>ID: {staff.staffNumber}</span>
              </div>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' asChild className='h-10'>
            <Link href={`/staff/${staff.id}/edit`}>
              <Edit className='mr-2 h-4 w-4' />
              Edit Profile
            </Link>
          </Button>
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
            value='academic'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Academic Assignment
          </TabsTrigger>
          <TabsTrigger
            value='documents'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Documents
          </TabsTrigger>
          <TabsTrigger
            value='payroll'
            className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-semibold transition-all'
          >
            Payroll
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='pt-6 grid gap-6 md:grid-cols-3'>
          <div className='md:col-span-2 space-y-6'>
            <Card className='border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-lg font-bold'>Personal & Professional Details</CardTitle>
              </CardHeader>
              <CardContent className='grid sm:grid-cols-2 gap-6'>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Date of Birth
                  </p>
                  <p className='text-sm font-medium'>
                    {format(new Date(staff.dateOfBirth), 'PPP')}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Gender
                  </p>
                  <p className='text-sm font-medium'>{staff.gender}</p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Joining Date
                  </p>
                  <p className='text-sm font-medium'>
                    {format(new Date(staff.joiningDate), 'PPP')}
                  </p>
                </div>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Qualifications
                  </p>
                  <p className='text-sm font-medium'>{staff.qualification || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>

            <Card className='border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-lg font-bold'>Contact & Portal Access</CardTitle>
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
                    <p className='text-sm font-medium'>{staff.email}</p>
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
                    <p className='text-sm font-medium'>{staff.phoneNumber || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='space-y-6'>
            <Card className='border-none shadow-sm glass bg-gradient-to-br from-emerald-500/5 to-transparent'>
              <CardHeader>
                <CardTitle className='text-sm font-bold uppercase tracking-wider flex items-center gap-2'>
                  <ShieldCheck className='h-4 w-4 text-emerald-600' />
                  System Permissions
                </CardTitle>
              </CardHeader>
              <CardContent className='flex flex-wrap gap-2'>
                {staff.user?.roles.map((r) => (
                  <Badge
                    key={r.role.id}
                    variant='secondary'
                    className='bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-[10px]'
                  >
                    {r.role.name}
                  </Badge>
                ))}
              </CardContent>
            </Card>

            <Card className='border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-sm font-bold uppercase tracking-wider flex items-center gap-2'>
                  <DollarSign className='h-4 w-4 text-amber-500' />
                  Payroll Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-1'>
                  <p className='text-xs font-semibold text-slate-400 uppercase tracking-wider'>
                    Active Base Pay
                  </p>
                  <p className='text-xl font-bold text-slate-900 dark:text-white'>
                    {currentSalary
                      ? `Rs${currentSalary.basePay.toLocaleString()}`
                      : 'Not Configured'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='academic' className='pt-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold'>Class Teacher Assignments</h2>
          </div>
          <div className='grid md:grid-cols-3 gap-6'>
            {staff.classTeacherAssignments.length === 0 ? (
              <div className='col-span-full h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 italic'>
                No active class assignments for this staff member.
              </div>
            ) : (
              staff.classTeacherAssignments.map((a) => (
                <Card key={a.id} className='border-none shadow-sm glass overflow-hidden'>
                  <CardHeader className='bg-primary/5 pb-3'>
                    <CardTitle className='text-base font-bold'>{a.class.name}</CardTitle>
                    <CardDescription className='font-bold text-primary'>
                      Section {a.section?.name || 'All'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='pt-4'>
                    <p className='text-xs text-slate-500'>Academic Year: {a.academicYear.name}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='documents' className='pt-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold'>Document Store</h2>
            <Button size='sm' className='gradient-primary'>
              <Plus className='mr-2 h-4 w-4' />
              Upload Document
            </Button>
          </div>
          <div className='grid md:grid-cols-2 gap-6'>
            {staff.documents.length === 0 ? (
              <div className='col-span-full h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400'>
                No documents uploaded for this staff member.
              </div>
            ) : (
              staff.documents.map((doc) => (
                <Card key={doc.id} className='border-none shadow-sm glass group/doc'>
                  <CardHeader className='flex flex-row items-center justify-between pb-2'>
                    <div className='flex items-center gap-3'>
                      <div className='p-2 rounded-lg bg-blue-50 text-blue-600'>
                        <FileText className='h-5 w-5' />
                      </div>
                      <div>
                        <CardTitle className='text-base font-bold'>{doc.title}</CardTitle>
                        <Badge variant='secondary' className='text-[10px] uppercase font-bold'>
                          {doc.documentType}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-4 flex justify-between items-center'>
                    <p className='text-xs text-slate-500'>
                      Uploaded {format(new Date(doc.createdAt), 'PP')}
                    </p>
                    <Button variant='link' className='text-primary h-auto p-0' asChild>
                      <a href={doc.fileUrl} target='_blank' rel='noreferrer'>
                        View Document
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value='payroll' className='pt-6'>
          <div className='flex items-center justify-between mb-6'>
            <h2 className='text-xl font-bold'>Salary & Payroll History</h2>
            <Button size='sm' className='gradient-primary' asChild>
              <Link href={`/finance/payroll/setup?staffId=${staff.id}`}>
                <Plus className='mr-2 h-4 w-4' />
                Setup New Structure
              </Link>
            </Button>
          </div>

          <div className='grid md:grid-cols-3 gap-6'>
            <Card className='md:col-span-1 border-none shadow-sm glass'>
              <CardHeader>
                <CardTitle className='text-base font-bold'>Active Structure</CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {currentSalary ? (
                  <>
                    <div className='flex justify-between items-end border-b pb-2'>
                      <span className='text-sm text-slate-500'>Base Pay</span>
                      <span className='text-lg font-bold'>
                        ${currentSalary.basePay.toLocaleString()}
                      </span>
                    </div>
                    <div className='space-y-2'>
                      <p className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                        Allowances
                      </p>
                      {currentSalary.components
                        .filter((c) => c.type === 'ALLOWANCE')
                        .map((c) => (
                          <div key={c.id} className='flex justify-between text-sm'>
                            <span>{c.label}</span>
                            <span className='font-medium text-emerald-600'>
                              +${c.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className='space-y-2'>
                      <p className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                        Deductions
                      </p>
                      {currentSalary.components
                        .filter((c) => c.type === 'DEDUCTION')
                        .map((c) => (
                          <div key={c.id} className='flex justify-between text-sm'>
                            <span>{c.label}</span>
                            <span className='font-medium text-rose-600'>
                              -${c.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <p className='text-sm text-slate-400 italic'>No salary structure defined.</p>
                )}
              </CardContent>
            </Card>

            <Card className='md:col-span-2 border-none shadow-sm glass overflow-hidden'>
              <CardHeader className='bg-slate-50/50 dark:bg-slate-900/50 border-b flex flex-row items-center justify-between'>
                <CardTitle className='text-base font-bold'>Recent Salary Slips</CardTitle>
                <Button
                  variant='outline'
                  size='sm'
                  className='h-8 border-none bg-white dark:bg-slate-800 shadow-sm'
                >
                  View All
                </Button>
              </CardHeader>
              <CardContent className='p-0'>
                <div className='divide-y divide-slate-100 dark:divide-slate-800'>
                  {staff.salarySlips.length === 0 ? (
                    <p className='p-8 text-center text-slate-400 italic'>
                      No salary slips generated yet.
                    </p>
                  ) : (
                    staff.salarySlips.map((slip) => (
                      <div
                        key={slip.id}
                        className='p-4 flex items-center justify-between hover:bg-slate-50/30 transition-colors'
                      >
                        <div className='space-y-1'>
                          <p className='font-bold text-slate-900 dark:text-white'>
                            {format(new Date(slip.periodYear, slip.periodMonth - 1), 'MMMM yyyy')}
                          </p>
                          <div className='flex items-center gap-3 text-[10px] uppercase font-bold text-slate-500'>
                            <span>Net: ${slip.netPay.toLocaleString()}</span>
                            {slip.disbursements.length > 0 ? (
                              <Badge className='bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-none px-1 h-4'>
                                PAID
                              </Badge>
                            ) : (
                              <Badge
                                variant='outline'
                                className='text-amber-500 border-amber-200 px-1 h-4'
                              >
                                PENDING
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant='ghost' size='sm' className='h-8 text-primary'>
                          <FileText className='mr-2 h-4 w-4' />
                          Download PDF
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
