'use client';

import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function DocumentUploadButton() {
  return (
    <Button
      variant='ghost'
      size='sm'
      className='h-7 px-2 text-primary'
      onClick={() => toast.info('Document upload feature will be available in the next update.')}
    >
      Upload
    </Button>
  );
}
