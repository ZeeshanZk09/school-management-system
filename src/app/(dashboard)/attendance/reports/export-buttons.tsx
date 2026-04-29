'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportAttendanceCSV } from '../actions';

export function AttendanceExportButtons({
  type,
  month,
  year,
  classId,
}: Readonly<{
  type: 'student' | 'staff';
  month: number;
  year: number;
  classId?: string;
}>) {
  const [isPending, setIsPending] = useState(false);

  const handleExportCSV = async () => {
    if (type === 'student' && !classId) {
      toast.error('Please select a class for student attendance export');
      return;
    }

    setIsPending(true);
    try {
      const result = await exportAttendanceCSV(type, month, year, classId);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${type}_attendance_${month}_${year}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Attendance report exported successfully');
      } else {
        toast.error(result.message || 'Export failed');
      }
    } catch (_error) {
      toast.error('An error occurred during export');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        className='h-10 bg-white dark:bg-slate-900 border-none shadow-sm'
        onClick={() => toast.info('PDF Export coming soon...')}
        disabled={isPending}
      >
        <Download className='mr-2 h-4 w-4' />
        Export PDF
      </Button>
      <Button
        variant='outline'
        className='h-10 bg-white dark:bg-slate-900 border-none shadow-sm'
        onClick={handleExportCSV}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        ) : (
          <Download className='mr-2 h-4 w-4' />
        )}
        Export CSV
      </Button>
    </div>
  );
}
