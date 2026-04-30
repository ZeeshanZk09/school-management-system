import { endOfMonth, format, startOfMonth } from 'date-fns';
import { Filter, PieChart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatAcademicYearName, getActiveAcademicYear } from '@/lib/academic-year';
import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { FinanceExportButtons } from './export-button';

export default async function FinanceReportsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{
    type?: string;
    month?: string;
    year?: string;
  }>;
}>) {
  await requirePermission('finance.read');
  const params = await searchParams;
  const type = params.type || 'collection';
  const month = params.month ? Number.parseInt(params.month, 10) : new Date().getMonth() + 1;
  const year = params.year ? Number.parseInt(params.year, 10) : new Date().getFullYear();

  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(startDate);
  const activeAcademicYear = await getActiveAcademicYear();

  let reportData: any[] = [];
  const totals = { total: 0, pending: 0, collected: 0, payroll: 0 };

  if (type === 'collection') {
    const payments = await prisma.feePayment.findMany({
      where: {
        paidAt: { gte: startDate, lte: endDate },
        isDeleted: false,
      },
      include: {
        feeRecord: {
          include: {
            student: true,
            feeStructure: { include: { class: true } },
          },
        },
      },
    });

    reportData = payments.map((p) => ({
      id: p.id,
      date: p.paidAt,
      student: p.feeRecord.student.fullName,
      class: p.feeRecord.feeStructure.class.name,
      amount: Number(p.amountPaid),
      method: p.method,
      ref: p.referenceNumber,
    }));

    totals.collected = payments.reduce((sum, p) => sum + Number(p.amountPaid), 0);
  } else if (type === 'outstanding') {
    const records = await prisma.feeRecord.findMany({
      where: {
        outstandingAmount: { gt: 0 },
        isDeleted: false,
        student: { isDeleted: false },
      },
      include: {
        student: true,
        feeStructure: { include: { class: true } },
      },
      orderBy: { outstandingAmount: 'desc' },
    });

    reportData = records.map((r) => ({
      id: r.id,
      student: r.student.fullName,
      class: r.feeStructure.class.name,
      total: Number(r.totalAmount),
      outstanding: Number(r.outstandingAmount),
      dueDate: r.dueDate,
    }));

    totals.pending = records.reduce((sum, r) => sum + Number(r.outstandingAmount), 0);
  } else if (type === 'payroll') {
    const slips = await prisma.salarySlip.findMany({
      where: {
        periodMonth: month,
        periodYear: year,
        isDeleted: false,
      },
      include: {
        staff: true,
        disbursements: { where: { isDeleted: false } },
      },
    });

    reportData = slips.map((s) => {
      const disbursed = s.disbursements.reduce((sum, d) => sum + Number(d.amountPaid), 0);
      return {
        id: s.id,
        staff: s.staff.fullName,
        department: s.staff.department || 'Unassigned',
        gross: Number(s.grossPay),
        deductions: Number(s.totalDeductions),
        net: Number(s.netPay),
        disbursed,
        pending: Number(s.netPay) - disbursed,
      };
    });

    totals.payroll = slips.reduce((sum, s) => sum + Number(s.netPay), 0);
  }

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight font-outfit'>Financial Reports</h1>
          <p className='text-slate-500 dark:text-slate-400'>
            Institutional collection summaries and outstanding balance oversight.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <FinanceExportButtons
            type={type as 'collection' | 'outstanding'}
            month={month}
            year={year}
          />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card className='border-none shadow-sm glass bg-linear-to-br from-emerald-500/5 to-transparent'>
          <CardHeader className='pb-2'>
            <CardDescription className='text-[10px] uppercase font-bold tracking-widest text-emerald-600'>
              Total Collected
            </CardDescription>
            <CardTitle className='text-2xl font-black'>
              Rs {totals.collected.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='border-none shadow-sm glass bg-linear-to-br from-rose-500/5 to-transparent'>
          <CardHeader className='pb-2'>
            <CardDescription className='text-[10px] uppercase font-bold tracking-widest text-rose-600'>
              Total Outstanding
            </CardDescription>
            <CardTitle className='text-2xl font-black'>
              Rs {totals.pending.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='border-none shadow-sm glass'>
          <CardHeader className='pb-2'>
            <CardDescription className='text-[10px] uppercase font-bold tracking-widest text-primary'>
              {type === 'payroll' ? 'Payroll Total' : 'Active Year'}
            </CardDescription>
            <CardTitle className='text-2xl font-black'>
              {type === 'payroll' 
                ? `Rs ${totals.payroll.toLocaleString()}` 
                : formatAcademicYearName(activeAcademicYear)}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className='border-none shadow-sm glass'>
        <CardHeader className='pb-3'>
          <CardTitle className='text-lg font-bold flex items-center gap-2'>
            <Filter className='h-4 w-4 text-primary' />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className='flex flex-wrap items-end gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='type' className='text-xs font-bold text-slate-500 uppercase'>
                Report Type
              </Label>
              <Select name='type' defaultValue={type}>
                <SelectTrigger
                  id='type'
                  className='w-[200px] bg-white dark:bg-slate-900 border-none shadow-sm'
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='collection'>Fee Collection Log</SelectItem>
                  <SelectItem value='outstanding'>Outstanding Balances</SelectItem>
                  <SelectItem value='payroll'>Payroll Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(type === 'collection' || type === 'payroll') && (
              <div className='space-y-2'>
                <Label htmlFor='month' className='text-xs font-bold text-slate-500 uppercase'>
                  Month
                </Label>
                <Select name='month' defaultValue={month.toString()}>
                  <SelectTrigger
                    id='month'
                    className='w-[140px] bg-white dark:bg-slate-900 border-none shadow-sm'
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {format(new Date(2024, i), 'MMMM')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type='submit' className='gradient-primary h-10 px-6 rounded-xl'>
              Generate Report
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className='border-none shadow-sm glass overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow className='bg-slate-50/50 dark:bg-slate-900/50 border-y'>
              <TableHead>
                {type === 'collection' ? 'Date' : type === 'outstanding' ? 'Student' : 'Staff'}
              </TableHead>
              <TableHead>
                {type === 'collection' ? 'Student' : type === 'outstanding' ? 'Class' : 'Department'}
              </TableHead>
              <TableHead>
                {type === 'collection' ? 'Class' : type === 'outstanding' ? 'Total Due' : 'Gross Pay'}
              </TableHead>
              <TableHead>
                {type === 'collection' ? 'Method' : type === 'outstanding' ? 'Outstanding' : 'Disbursed'}
              </TableHead>
              <TableHead className='text-right'>
                {type === 'payroll' ? 'Net Payable' : 'Amount'}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-64 text-center text-slate-400 italic'>
                  No data found for the selected criteria.
                </TableCell>
              </TableRow>
            ) : (
              reportData.map((row) => (
                <TableRow key={row.id} className='hover:bg-slate-50/50 transition-colors'>
                  <TableCell className='font-medium'>
                    {type === 'collection' ? format(new Date(row.date), 'PP') : type === 'outstanding' ? row.student : row.staff}
                  </TableCell>
                  <TableCell>
                    {type === 'collection' ? row.student : type === 'outstanding' ? row.class : row.department}
                  </TableCell>
                  <TableCell>
                    {type === 'collection' ? row.class : type === 'outstanding' ? `Rs ${row.total.toLocaleString()}` : `Rs ${row.gross.toLocaleString()}`}
                  </TableCell>
                  <TableCell>
                    {type === 'collection' ? (
                      <Badge variant='outline' className='text-[10px] font-bold'>
                        {row.method}
                      </Badge>
                    ) : type === 'outstanding' ? (
                      <span className='font-bold text-rose-600'>
                        Rs {row.outstanding.toLocaleString()}
                      </span>
                    ) : (
                      <span className='text-emerald-600 font-bold'>
                        Rs {row.disbursed.toLocaleString()}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className='text-right font-black text-slate-900 dark:text-white'>
                    {type === 'collection' ? (
                      `Rs ${row.amount.toLocaleString()}`
                    ) : type === 'outstanding' ? (
                      <Badge className='bg-rose-50 text-rose-600 border-none'>DEBT</Badge>
                    ) : (
                      `Rs ${row.net.toLocaleString()}`
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
