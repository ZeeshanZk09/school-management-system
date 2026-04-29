'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSection, updateSection } from './actions';

type FormErrors = Record<string, string[] | undefined>;

interface SectionData {
  id: string;
  name: string;
  capacity: number | null;
  classTeacherId?: string | null;
}

interface StaffMember {
  id: string;
  fullName: string;
}

export function SectionForm({
  children,
  classId,
  initialData,
  staff,
}: Readonly<{
  children: React.ReactNode;
  classId: string;
  initialData?: SectionData;
  staff: StaffMember[];
}>) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.append('classId', classId);

    const result = initialData
      ? await updateSection(initialData.id, formData)
      : await createSection(formData);

    setIsPending(false);

    if (result.success) {
      toast.success(initialData ? 'Section updated' : 'Section created');
      setOpen(false);
      router.refresh();
    } else if (result.errors) {
      setErrors(result.errors);
    } else {
      toast.error(result.message || 'Something went wrong');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='sm:max-w-[425px] glass border-none'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className='font-outfit text-2xl'>
              {initialData ? 'Edit Section' : 'New Section'}
            </DialogTitle>
            <DialogDescription>
              Add a section to the class. You can specify a student capacity for each section.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='name'>Section Name</Label>
              <Input
                id='name'
                name='name'
                defaultValue={initialData?.name}
                placeholder='e.g. A'
                required
                className='bg-slate-50 dark:bg-slate-900 border-none'
              />
              {errors.name && <p className='text-xs text-rose-500'>{errors.name[0]}</p>}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='capacity'>Capacity (Optional)</Label>
              <Input
                id='capacity'
                name='capacity'
                type='number'
                defaultValue={initialData?.capacity ?? undefined}
                placeholder='e.g. 40'
                className='bg-slate-50 dark:bg-slate-900 border-none'
              />
              {errors.capacity && <p className='text-xs text-rose-500'>{errors.capacity[0]}</p>}
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='classTeacherId'>Class Teacher</Label>
              <select
                id='classTeacherId'
                name='classTeacherId'
                defaultValue={initialData?.classTeacherId || ''}
                className='flex h-10 w-full rounded-md border-none bg-slate-50 dark:bg-slate-900 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
              >
                <option value=''>No teacher assigned</option>
                {staff.map((s: StaffMember) => (
                  <option key={s.id} value={s.id}>
                    {s.fullName}
                  </option>
                ))}
              </select>
              {errors.classTeacherId && (
                <p className='text-xs text-rose-500'>{errors.classTeacherId[0]}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type='submit' className='gradient-primary' disabled={isPending}>
              {isPending && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              {initialData ? 'Update Section' : 'Create Section'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
