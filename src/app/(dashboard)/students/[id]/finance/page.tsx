import { format } from 'date-fns';
import {
  ArrowLeft,
  CreditCard,
  Download,
  FileText,
  History,
  Receipt,
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';

export default async function StudentFinancePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission('finance.read');
  const { id } = await params;

  const student = await prisma.student.findUnique({
    where: { id, isDeleted: false },
    include: {
      enrollments: {
        where: { academicYear: { isActive: true } },
        include: { class: true },
      },
      feeRecords: {
        where: { isDeleted: false },
        include: {
          academicYear: true,
          payments: {
            where: { isDeleted: false },
            orderBy: { paidAt: 'desc' },
          },
          items: {
            where: { isDeleted: false },
          },
        },
        orderBy: { dueDate: 'desc' },
      },
    },
  });

  if (!student) {
    return notFound();
  }

  const activeEnrollment = student.enrollments[0];

  // Calculations
  const totalInvoiced = student.feeRecords.reduce((acc, rec) => acc + Number(rec.totalAmount), 0);
  const totalPaid = student.feeRecords.reduce((acc, rec) => {
    return acc + rec.payments.reduce((pAcc, p) => pAcc + Number(p.amountPaid), 0);
  }, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <Button variant='ghost' size='icon' asChild className='h-10 w-10'>
            <Link href='/students'>
              <ArrowLeft className='h-5 w-5' />
            </Link>
          </Button>
          <div className='space-y-1'>
            <h1 className='text-3xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white'>
              Finance Report
            </h1>
            <p className='text-slate-500 dark:text-slate-400'>
              Financial overview and fee history for{' '}
              <span className='font-semibold text-primary'>{student.fullName}</span>
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' className='h-10'>
            <Download className='mr-2 h-4 w-4' />
            Export PDF
          </Button>
          <Button className='gradient-primary h-10 shadow-md'>
            <Receipt className='mr-2 h-4 w-4' />
            Generate Receipt
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className='grid gap-4 md:grid-cols-3'>
        <Card className='border-none shadow-sm glass overflow-hidden relative group'>
          <div className='absolute top-0 left-0 w-1 h-full bg-blue-500' />
          <CardHeader className='pb-2'>
            <CardDescription className='text-xs uppercase font-bold tracking-wider'>
              Total Invoiced
            </CardDescription>
            <CardTitle className='text-3xl font-bold flex items-center justify-between'>
              ${totalInvoiced.toLocaleString()}
              <div className='h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center'>
                <FileText className='h-5 w-5 text-blue-500' />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-1 text-xs text-slate-500'>
              <TrendingUp className='h-3 w-3 text-blue-500' />
              <span>Total fee assigned across all sessions</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-none shadow-sm glass overflow-hidden relative group'>
          <div className='absolute top-0 left-0 w-1 h-full bg-emerald-500' />
          <CardHeader className='pb-2'>
            <CardDescription className='text-xs uppercase font-bold tracking-wider'>
              Total Paid
            </CardDescription>
            <CardTitle className='text-3xl font-bold flex items-center justify-between'>
              ${totalPaid.toLocaleString()}
              <div className='h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center'>
                <Wallet className='h-5 w-5 text-emerald-500' />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-1 text-xs text-slate-500'>
              <TrendingUp className='h-3 w-3 text-emerald-500' />
              <span>Successfully processed payments</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-none shadow-sm glass overflow-hidden relative group'>
          <div className='absolute top-0 left-0 w-1 h-full bg-rose-500' />
          <CardHeader className='pb-2'>
            <CardDescription className='text-xs uppercase font-bold tracking-wider'>
              Outstanding Balance
            </CardDescription>
            <CardTitle className='text-3xl font-bold flex items-center justify-between'>
              ${totalOutstanding.toLocaleString()}
              <div className='h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-900/20 flex items-center justify-center'>
                <AlertCircle className='h-5 w-5 text-rose-500' />
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-1 text-xs text-slate-500'>
              <TrendingDown className='h-3 w-3 text-rose-500' />
              <span>Remaining balance to be cleared</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-3'>
        <div className='md:col-span-2 space-y-6'>
          {/* Fee Records */}
          <Card className='border-none shadow-sm glass overflow-hidden'>
            <CardHeader className='border-b bg-slate-50/50 dark:bg-slate-900/50 pb-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-xl font-bold'>Fee Records</CardTitle>
                  <CardDescription>
                    History of all fee invoices and their current status.
                  </CardDescription>
                </div>
                <CreditCard className='h-5 w-5 text-slate-400' />
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50/30 dark:bg-slate-900/30'>
                  <TableHead>Invoice / Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.feeRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-32 text-center text-slate-500 italic'>
                      No fee records found for this student.
                    </TableCell>
                  </TableRow>
                ) : (
                  student.feeRecords.map((record) => (
                    <TableRow
                      key={record.id}
                      className='hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors'
                    >
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-semibold text-slate-900 dark:text-white'>
                            {record.academicYear.name} Invoice
                          </span>
                          <span className='text-[10px] text-slate-500 uppercase font-medium'>
                            {record.id.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-col'>
                          <span className='font-bold'>
                            ${Number(record.totalAmount).toLocaleString()}
                          </span>
                          {Number(record.outstandingAmount) > 0 && (
                            <span className='text-[10px] text-rose-500 font-medium italic'>
                              ${Number(record.outstandingAmount).toLocaleString()} pending
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            record.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none'
                              : record.status === 'PARTIALLY_PAID'
                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-none'
                                : 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-none'
                          }
                        >
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-slate-600 dark:text-slate-400 text-sm'>
                        {format(new Date(record.dueDate), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className='text-right'>
                        <Button variant='ghost' size='sm' className='h-8 text-primary'>
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>

          {/* Recent Payments */}
          <Card className='border-none shadow-sm glass overflow-hidden'>
            <CardHeader className='border-b bg-slate-50/50 dark:bg-slate-900/50 pb-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-xl font-bold'>Recent Payments</CardTitle>
                  <CardDescription>Detailed log of all financial transactions.</CardDescription>
                </div>
                <History className='h-5 w-5 text-slate-400' />
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className='bg-slate-50/30 dark:bg-slate-900/30'>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className='text-right'>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {student.feeRecords.flatMap((r) => r.payments).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='h-32 text-center text-slate-500 italic'>
                      No payments recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  student.feeRecords
                    .flatMap((r) => r.payments)
                    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
                    .slice(0, 10)
                    .map((payment) => (
                      <TableRow
                        key={payment.id}
                        className='hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors'
                      >
                        <TableCell className='text-sm font-medium'>
                          {format(new Date(payment.paidAt), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                            +${Number(payment.amountPaid).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant='outline' className='text-[10px] font-bold'>
                            {payment.method}
                          </Badge>
                        </TableCell>
                        <TableCell className='text-xs text-slate-500 font-mono'>
                          {payment.referenceNumber || 'N/A'}
                        </TableCell>
                        <TableCell className='text-right'>
                          <Button variant='ghost' size='icon' className='h-8 w-8 text-primary'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Sidebar info */}
        <div className='space-y-6'>
          <Card className='border-none shadow-sm glass'>
            <CardHeader>
              <CardTitle className='text-sm font-bold uppercase tracking-wider'>
                Quick Summary
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800'>
                <span className='text-sm text-slate-500'>Student Status</span>
                <Badge
                  className={student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : ''}
                >
                  {student.status}
                </Badge>
              </div>
              <div className='flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800'>
                <span className='text-sm text-slate-500'>Current Class</span>
                <span className='text-sm font-semibold'>
                  {activeEnrollment?.class.name || 'N/A'}
                </span>
              </div>
              <div className='flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800'>
                <span className='text-sm text-slate-500'>Admission No</span>
                <span className='text-sm font-mono'>{student.admissionNumber}</span>
              </div>
              <div className='pt-2'>
                <div className='bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl space-y-3'>
                  <div className='flex justify-between text-xs text-slate-500'>
                    <span>Payment Progress</span>
                    <span>{Math.round((totalPaid / (totalInvoiced || 1)) * 100)}%</span>
                  </div>
                  <div className='h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary'
                      style={{ width: `${(totalPaid / (totalInvoiced || 1)) * 100}%` }}
                    />
                  </div>
                  <p className='text-[10px] text-slate-400 italic text-center'>
                    Payment compliance is critical for enrollment stability.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border-none shadow-sm glass bg-primary/5'>
            <CardHeader>
              <CardTitle className='text-sm font-bold uppercase tracking-wider'>
                Financial Policy
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-xs text-slate-500 leading-relaxed'>
                Fees must be cleared by the due date mentioned on each invoice. A late fee of 5% may
                apply to outstanding balances after 10 days of the due date.
              </p>
              <Button variant='link' className='p-0 h-auto text-xs text-primary font-bold'>
                Read full policy →
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
