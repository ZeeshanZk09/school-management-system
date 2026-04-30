'use client';

import { PDFDownloadLink } from '@react-pdf/renderer';
import { AlertCircle, CheckCircle2, DollarSign, FileText, Loader2, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { SalarySlipPDF } from '@/components/finance/salary-slip-pdf';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { generateSalarySlip } from './actions';
import { DisbursementDialog } from './disbursement-dialog';

export function PayrollList({
  staff,
  slips,
  month,
  year,
  settings,
}: Readonly<{
  staff: any[];
  slips: any[];
  month: number;
  year: number;
  settings: any;
}>) {
  const router = useRouter();
  const [isPending, setIsPending] = useState<string | null>(null);

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const handleGenerate = async (staffId: string) => {
    setIsPending(staffId);
    const result = await generateSalarySlip(staffId, year, month);
    setIsPending(null);

    if (result.success) {
      toast.success('Salary slip generated');
      router.refresh();
    } else {
      toast.error(result.message || 'Generation failed');
    }
  };

  return (
    <div className='space-y-6'>
      <Card className='border-none shadow-sm glass'>
        <CardHeader className='flex flex-row items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Select
              value={month.toString()}
              onValueChange={(val) => router.push(`/finance/payroll?month=${val}&year=${year}`)}
            >
              <SelectTrigger className='w-[180px] bg-white dark:bg-slate-900 border-none shadow-sm h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={year.toString()}
              onValueChange={(val) => router.push(`/finance/payroll?month=${month}&year=${val}`)}
            >
              <SelectTrigger className='w-[120px] bg-white dark:bg-slate-900 border-none shadow-sm h-10'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026, 2027].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='text-right'>
            <p className='text-sm font-medium text-slate-500'>Period Total</p>
            <p className='text-2xl font-black text-slate-900 dark:text-white'>
              Rs {slips.reduce((sum, s) => sum + Number.parseFloat(s.netPay), 0).toLocaleString()}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className='bg-slate-50/50 dark:bg-slate-900/50 border-y'>
                <TableHead>Staff Member</TableHead>
                <TableHead>Base Pay</TableHead>
                <TableHead>Gross / Net</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((s) => {
                const slip = slips.find((p) => p.staffId === s.id);
                const structure = s.salaryStructures[0];

                return (
                  <TableRow key={s.id} className='hover:bg-slate-50/50 transition-colors'>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-bold text-slate-900 dark:text-white'>
                          {s.fullName}
                        </span>
                        <span className='text-[10px] text-slate-500 uppercase tracking-widest'>
                          {s.designation}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {structure ? (
                        `Rs ${Number.parseFloat(structure.basePay).toLocaleString()}`
                      ) : (
                        <span className='text-rose-500 text-xs font-bold flex items-center gap-1'>
                          <AlertCircle className='h-3 w-3' /> No Structure
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {slip ? (
                        <div className='flex flex-col'>
                          <span className='text-xs text-slate-500 line-through'>
                            Rs {Number.parseFloat(slip.grossPay).toLocaleString()}
                          </span>
                          <span className='font-bold text-primary'>
                            Rs {Number.parseFloat(slip.netPay).toLocaleString()}
                          </span>
                        </div>
                      ) : (
                        '--'
                      )}
                    </TableCell>
                    <TableCell>
                      {slip ? (
                        <div className='flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-emerald-500' />
                          <Badge
                            variant={slip.disbursements.length > 0 ? 'secondary' : 'outline'}
                            className={
                              slip.disbursements.length > 0
                                ? 'bg-emerald-50 text-emerald-600 border-none'
                                : 'text-amber-500 border-amber-200'
                            }
                          >
                            {slip.disbursements.length > 0 ? 'PAID' : 'GENERATED'}
                          </Badge>
                        </div>
                      ) : (
                        <Badge variant='ghost' className='text-slate-400 font-normal italic'>
                          Not Started
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      {slip ? (
                        <div className='flex items-center justify-end gap-2'>
                          {slip.disbursements.length === 0 && (
                            <DisbursementDialog slip={slip} staffName={s.fullName}>
                              <Button
                                size='sm'
                                variant='outline'
                                className='h-8 border-primary/20 text-primary hover:bg-primary/5'
                              >
                                <Wallet className='mr-2 h-3 w-3' />
                                Pay
                              </Button>
                            </DisbursementDialog>
                          )}
                          <PDFDownloadLink
                            document={<SalarySlipPDF slip={slip} staff={s} settings={settings} />}
                            fileName={`SalarySlip-${s.fullName.replaceAll(/\s+/g, '-')}-${months[month - 1]}-${year}.pdf`}
                          >
                            {({ loading }) => (
                              <Button
                                size='sm'
                                variant='ghost'
                                className='h-8 text-blue-500 hover:text-blue-600'
                                disabled={loading}
                              >
                                {loading ? (
                                  <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                  <FileText className='h-4 w-4' />
                                )}
                              </Button>
                            )}
                          </PDFDownloadLink>
                        </div>
                      ) : (
                        <Button
                          size='sm'
                          variant='secondary'
                          className='h-8 bg-slate-100 hover:bg-slate-200 text-slate-600'
                          disabled={!structure || isPending === s.id}
                          onClick={() => handleGenerate(s.id)}
                        >
                          {isPending === s.id ? (
                            <Loader2 className='h-3 w-3 animate-spin' />
                          ) : (
                            <DollarSign className='mr-2 h-3 w-3' />
                          )}
                          Generate Slip
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
