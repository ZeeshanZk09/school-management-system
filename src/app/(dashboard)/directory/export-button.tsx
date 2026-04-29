'use client';

import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { exportDirectoryCSV } from './actions';

export function ExportDirectoryButton({
  type,
}: Readonly<{
  type: 'students' | 'staff';
}>) {
  const [isPending, setIsPending] = useState(false);

  const handleExport = async () => {
    setIsPending(true);
    try {
      const result = await exportDirectoryCSV(type);
      if (result.success && result.csv) {
        const blob = new Blob([result.csv], {
          type: 'text/csv;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute(
          'download',
          `${type}_directory_${new Date().toISOString().split('T')[0]}.csv`
        );
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success('Directory exported successfully');
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
    <Button
      variant='outline'
      className='h-10 bg-white dark:bg-slate-900 border-none shadow-sm'
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      ) : (
        <Download className='mr-2 h-4 w-4' />
      )}
      Export CSV
    </Button>
  );
}
