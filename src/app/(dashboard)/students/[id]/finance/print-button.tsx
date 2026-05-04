'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PrintButton() {
  return (
    <Button variant='outline' className='h-10' onClick={() => window.print()}>
      <Download className='mr-2 h-4 w-4' />
      Print Report
    </Button>
  );
}
