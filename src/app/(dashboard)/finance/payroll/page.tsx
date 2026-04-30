import { requirePermission } from '@/lib/auth/permissions';
import prisma from '@/lib/prisma';
import { getSystemSettings } from '@/lib/settings';
import { PayrollList } from './payroll-list';

export default async function PayrollPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ month?: string; year?: string }>;
}>) {
  await requirePermission('finance.read');
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? Number.parseInt(params.month, 10) : now.getMonth() + 1;
  const year = params.year ? Number.parseInt(params.year, 10) : now.getFullYear();

  const [staff, existingSlips, settings] = await Promise.all([
    prisma.staff.findMany({
      where: { isDeleted: false },
      include: {
        salaryStructures: {
          where: {
            isDeleted: false,
            validFrom: { lte: new Date(year, month, 0) },
          },
          orderBy: { validFrom: 'desc' },
          take: 1,
          include: { components: true },
        },
      },
      orderBy: { fullName: 'asc' },
    }),
    prisma.salarySlip.findMany({
      where: { periodMonth: month, periodYear: year, isDeleted: false },
      include: { disbursements: true },
    }),
    getSystemSettings(),
  ]);

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='space-y-1'>
          <h1 className='text-3xl font-bold tracking-tight font-outfit'>Payroll Management</h1>
          <p className='text-slate-500 dark:text-slate-400'>
            Generate and manage monthly salary slips for all staff.
          </p>
        </div>
      </div>

      <PayrollList 
        staff={staff} 
        slips={existingSlips} 
        month={month} 
        year={year} 
        settings={settings}
      />
    </div>
  );
}
