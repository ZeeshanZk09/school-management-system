'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createStudent, enrollStudent, updateStudent } from './actions';

export function StudentForm({
  classes,
  academicYears,
  initialData,
}: Readonly<{
  classes: {
    id: string;
    name: string;
    sections: {
      id: string;
      name: string;
    }[];
  }[];
  academicYears: {
    id: string;
    name: string;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
    isCurrent?: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
  }[];
  initialData?: {
    id: string;
    fullName: string;
    email?: string | null;
    phoneNumber?: string | null;
    gender: string;
    bloodGroup?: string | null;
    photoUrl?: string | null;
    address?: string | null;
    dateOfBirth?: Date | string | null;
    admissionNumber: string;
    admissionDate?: Date | string | null;
    status: string;
    enrollments: {
      id: string;
      classId: string;
      sectionId: string | null;
      academicYearId: string;
    }[];
    guardians: {
      guardianId: string;
    }[];
  } | null;
}>) {
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<{
    fullName?: string[];
    email?: string[];
    phoneNumber?: string[];
    gender?: string[];
    bloodGroup?: string[];
    photoUrl?: string[];
    address?: string[];
    dateOfBirth?: string[];
    admissionNumber?: string[];
    admissionDate?: string[];
    classId?: string[];
    sectionId?: string[];
    academicYearId?: string[];
    status?: string[];
    enrollments?: {
      classId?: string[];
      sectionId?: string[];
      academicYearId?: string[];
    }[];
    guardians?: {
      guardianId?: string[];
    }[];
  }>({});
  const [selectedClass, setSelectedClass] = useState<string>(
    initialData?.enrollments?.[0]?.classId || ''
  );
  const router = useRouter();

  const sections = classes.find((c) => c.id === selectedClass)?.sections || [];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      let result;
      if (initialData) {
        result = await updateStudent(initialData.id, data);
      } else {
        result = await createStudent(data);

        if (result.success && result.studentId) {
          // If creation succeeded, proceed to enrollment
          const enrollmentResult = await enrollStudent({
            studentId: result.studentId,
            academicYearId: data.academicYearId,
            classId: data.classId,
            sectionId: data.sectionId,
          });

          if (!enrollmentResult.success) {
            toast.warning('Student created but enrollment failed. Please enroll manually.');
            router.push(`/students/${result.studentId}`);
            return;
          }
        }
      }

      if (result.success) {
        toast.success(initialData ? 'Student updated' : 'Student registered and enrolled');
        router.push('/students');
        router.refresh();
      } else if (result.errors) {
        setErrors(result.errors);
      } else {
        toast.error(result.message || 'Something went wrong');
      }
    } catch (_error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsPending(false);
    }
  };

  const submitButtonText = initialData ? 'Update Student' : 'Register Student';

  return (
    <form onSubmit={handleSubmit} className='space-y-8'>
      <div className='grid gap-6'>
        <Card className='border-none shadow-sm glass'>
          <CardHeader>
            <CardTitle className='text-xl font-bold'>Personal Information</CardTitle>
            <CardDescription>Basic details about the student.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-6'>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='fullName'>Full Name</Label>
                <Input
                  id='fullName'
                  name='fullName'
                  defaultValue={initialData?.fullName}
                  required
                  className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                />
                {errors.fullName && <p className='text-xs text-rose-500'>{errors.fullName[0]}</p>}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='admissionNumber'>Admission Number</Label>
                <Input
                  id='admissionNumber'
                  name='admissionNumber'
                  defaultValue={initialData?.admissionNumber}
                  required
                  className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                />
                {errors.admissionNumber && (
                  <p className='text-xs text-rose-500'>{errors.admissionNumber[0]}</p>
                )}
              </div>
            </div>

            <div className='grid md:grid-cols-3 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='dateOfBirth'>Date of Birth</Label>
                <Input
                  id='dateOfBirth'
                  name='dateOfBirth'
                  type='date'
                  defaultValue={
                    initialData?.dateOfBirth
                      ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
                      : ''
                  }
                  required
                  className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                />
                {errors.dateOfBirth && (
                  <p className='text-xs text-rose-500'>{errors.dateOfBirth[0]}</p>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='gender'>Gender</Label>
                <Select name='gender' defaultValue={initialData?.gender || 'UNSPECIFIED'}>
                  <SelectTrigger id='gender' className='bg-slate-50/50 dark:bg-slate-900/50 border-none'>
                    <SelectValue placeholder='Select Gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='MALE'>Male</SelectItem>
                    <SelectItem value='FEMALE'>Female</SelectItem>
                    <SelectItem value='OTHER'>Other</SelectItem>
                    <SelectItem value='UNSPECIFIED'>Unspecified</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className='text-xs text-rose-500'>{errors.gender[0]}</p>}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='admissionDate'>Admission Date</Label>
                <Input
                  id='admissionDate'
                  name='admissionDate'
                  type='date'
                  defaultValue={
                    initialData?.admissionDate
                      ? new Date(initialData.admissionDate).toISOString().split('T')[0]
                      : new Date().toISOString().split('T')[0]
                  }
                  required
                  className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                />
                {errors.admissionDate && (
                  <p className='text-xs text-rose-500'>{errors.admissionDate[0]}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!initialData && (
          <Card className='border-none shadow-sm glass'>
            <CardHeader>
              <CardTitle className='text-xl font-bold'>Enrollment Details</CardTitle>
              <CardDescription>
                Assign the student to a class for the current session.
              </CardDescription>
            </CardHeader>
            <CardContent className='grid md:grid-cols-3 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='academicYearId'>Academic Year</Label>
                <Select
                  name='academicYearId'
                  defaultValue={academicYears.find((y) => y.isActive)?.id}
                >
                  <SelectTrigger
                    id='academicYearId'
                    className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                  >
                    <SelectValue placeholder='Select Year' />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name} {year.isActive && '(Active)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academicYearId && (
                  <p className='text-xs text-rose-500'>{errors.academicYearId[0]}</p>
                )}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='classId'>Class</Label>
                <Select
                  name='classId'
                  onValueChange={(val) => {
                    if (typeof val === 'string') setSelectedClass(val);
                    else setSelectedClass('');
                  }}
                >
                  <SelectTrigger id='classId' className='bg-slate-50/50 dark:bg-slate-900/50 border-none'>
                    <SelectValue placeholder='Select Class' />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId && <p className='text-xs text-rose-500'>{errors.classId[0]}</p>}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='sectionId'>Section</Label>
                <Select name='sectionId' disabled={!selectedClass}>
                  <SelectTrigger
                    id='sectionId'
                    className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                  >
                    <SelectValue placeholder='Select Section' />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.sectionId && <p className='text-xs text-rose-500'>{errors.sectionId[0]}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className='border-none shadow-sm glass'>
          <CardHeader>
            <CardTitle className='text-xl font-bold'>Contact Information</CardTitle>
            <CardDescription>Optional contact details for the student.</CardDescription>
          </CardHeader>
          <CardContent className='grid gap-6'>
            <div className='grid md:grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email (Optional)</Label>
                <Input
                  id='email'
                  name='email'
                  type='email'
                  defaultValue={initialData?.email || ''}
                  placeholder='student@example.com'
                  className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                />
                {errors.email && <p className='text-xs text-rose-500'>{errors.email[0]}</p>}
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='phoneNumber'>Phone Number (Optional)</Label>
                <Input
                  id='phoneNumber'
                  name='phoneNumber'
                  defaultValue={initialData?.phoneNumber || ''}
                  placeholder='+1 (555) 000-0000'
                  className='bg-slate-50/50 dark:bg-slate-900/50 border-none'
                />
                {errors.phoneNumber && (
                  <p className='text-xs text-rose-500'>{errors.phoneNumber[0]}</p>
                )}
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='address'>Residential Address</Label>
              <Input
                id='address'
                name='address'
                defaultValue={initialData?.address || ''}
                placeholder='e.g. 123 Main St, City'
                className='bg-slate-50 dark:bg-slate-900 border-none'
              />
              {errors.address && <p className='text-xs text-rose-500'>{errors.address[0]}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='flex items-center justify-end gap-4'>
        <Button type='button' variant='ghost' onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button
          type='submit'
          className='gradient-primary px-8 h-12 text-base font-semibold shadow-lg shadow-blue-500/20'
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
              Processing...
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}
