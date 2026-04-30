'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { deleteAnnouncement } from './actions';

export function DeleteAnnouncementButton({ id }: Readonly<{ id: string }>) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    setIsPending(true);
    const result = await deleteAnnouncement(id);
    setIsPending(false);

    if (result.success) {
      toast.success('Announcement deleted');
      router.refresh();
    } else {
      toast.error(result.message || 'Failed to delete announcement');
    }
  };

  return (
    <Button
      variant='ghost'
      size='icon'
      className='text-slate-400 hover:text-rose-600 transition-colors'
      disabled={isPending}
      onClick={handleDelete}
    >
      {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : <Trash2 className='h-4 w-4' />}
    </Button>
  );
}
