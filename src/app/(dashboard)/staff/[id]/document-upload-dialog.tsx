'use client';

import { Loader2, Plus, Upload } from 'lucide-react';
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
import { uploadStaffDocument } from '../document-actions';

export function DocumentUploadDialog({ staffId }: Readonly<{ staffId: string }>) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const file = formData.get('file') as File;

      if (!file || file.size === 0) {
        toast.error('Please select a file to upload');
        setIsUploading(false);
        return;
      }

      // 1. Upload file to API
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('module', 'staff-docs');

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error(uploadData.message || 'File upload failed');
      }

      // 2. Create document record in DB
      const dbFormData = new FormData();
      dbFormData.append('title', formData.get('title') as string);
      dbFormData.append('fileName', uploadData.filename);
      dbFormData.append('filePath', uploadData.url);
      dbFormData.append('mimeType', uploadData.type);
      dbFormData.append('sizeBytes', uploadData.size.toString());

      const result = await uploadStaffDocument(staffId, dbFormData);

      if (result.success) {
        toast.success('Document uploaded successfully');
        setOpen(false);
      } else {
        toast.error(result.message || 'Failed to save document record');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size='sm' className='gradient-primary'>
          <Plus className='mr-2 h-4 w-4' />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px] glass border-none'>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className='font-outfit'>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new qualification, contract, or ID document to the staff profile.
            </DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Document Title</Label>
              <Input
                id='title'
                name='title'
                placeholder="e.g. Master's Degree Certificate"
                required
                className='bg-slate-50 dark:bg-slate-900 border-none'
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='file'>File (PDF or Image, max 5MB)</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='file'
                  name='file'
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png'
                  required
                  className='bg-slate-50 dark:bg-slate-900 border-none cursor-pointer'
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button type='submit' className='gradient-primary' disabled={isUploading}>
              {isUploading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='mr-2 h-4 w-4' />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
