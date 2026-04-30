'use client';

import { AlertCircle, Clock, Loader2, Save, UserCheck, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { recordAttendance } from './actions';

type Status = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type AttendanceStudent = {
  id: string;
  fullName: string;
  admissionNumber: string;
  attendance: Array<{
    status: Status;
  }>;
};

export function AttendanceEntry({
  students,
  classId,
  sectionId,
  sessionId,
  academicYearId,
  date,
}: Readonly<{
  students: AttendanceStudent[];
  classId: string;
  sectionId: string;
  sessionId: string;
  academicYearId: string;
  date: string;
}>) {
  const [attendance, setAttendance] = useState<Record<string, Status>>(
    students.reduce<Record<string, Status>>((acc, student) => {
      acc[student.id] = student.attendance[0]?.status || 'PRESENT';
      return acc;
    }, {})
  );
  const [isPending, setIsPending] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const router = useRouter();

  const hasExistingRecords = students.some((s) => s.attendance.length > 0);
  const isRetroactive = new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  const updateStatus = (studentId: string, status: Status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    if (hasExistingRecords && !correctionReason) {
      toast.error('Please provide a reason for updating existing records');
      return;
    }

    setIsPending(true);
    const records = Object.entries(attendance).map(([studentId, status]) => ({
      studentId,
      status,
      note: hasExistingRecords ? correctionReason : undefined,
    }));

    const result = await recordAttendance({
      classId,
      sectionId,
      academicYearId,
      sessionId,
      attendanceDate: date,
      records,
    });

    setIsPending(false);

    if (result.success) {
      toast.success('Attendance recorded successfully');
      router.refresh();
    } else {
      toast.error(result.message || 'Failed to save attendance');
    }
  };

  return (
    <div className='space-y-6'>
      {hasExistingRecords && (
        <Card className='border-none bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400'>
          <CardContent className='p-4 flex items-center gap-3'>
            <AlertCircle className='h-5 w-5 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-bold'>Records Already Exist</p>
              <p className='text-xs opacity-80 font-medium'>
                You are about to overwrite existing attendance data for this session. A correction
                reason is required.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {isRetroactive && !hasExistingRecords && (
        <Card className='border-none bg-blue-50 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400'>
          <CardContent className='p-4 flex items-center gap-3'>
            <Clock className='h-5 w-5 shrink-0' />
            <div className='flex-1'>
              <p className='text-sm font-bold'>Retroactive Entry</p>
              <p className='text-xs opacity-80 font-medium'>
                You are recording attendance for a past date ({date}).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shadow-sm'>
            <UserCheck className='h-3.5 w-3.5' />
            {Object.values(attendance).filter((v) => v === 'PRESENT').length} Present
          </div>
          <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 shadow-sm'>
            <XCircle className='h-3.5 w-3.5' />
            {Object.values(attendance).filter((v) => v === 'ABSENT').length} Absent
          </div>
        </div>

        <div className='flex-1 max-w-md'>
          {hasExistingRecords && (
            <input
              className='w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 text-sm focus:ring-1 focus:ring-amber-500 outline-none'
              placeholder='Reason for correction (required)...'
              value={correctionReason}
              onChange={(e) => setCorrectionReason(e.target.value)}
            />
          )}
        </div>

        <Button
          onClick={handleSave}
          className='gradient-primary px-8 h-11 rounded-xl shadow-lg shadow-blue-500/20'
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          ) : (
            <Save className='mr-2 h-4 w-4' />
          )}
          Save Attendance
        </Button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {students.map((student) => {
          const status = attendance[student.id];

          let statusStyles = 'bg-amber-50/30 dark:bg-amber-900/5 ring-1 ring-amber-500/10';
          if (status === 'PRESENT') {
            statusStyles = 'bg-white dark:bg-slate-900 ring-1 ring-emerald-500/10';
          } else if (status === 'ABSENT') {
            statusStyles = 'bg-rose-50/30 dark:bg-rose-900/5 ring-1 ring-rose-500/10';
          }

          return (
            <Card
              key={student.id}
              className={`border-none shadow-sm transition-all duration-300 ${statusStyles}`}
            >
              <CardContent className='p-4'>
                <div className='flex items-center gap-3 mb-4'>
                  <Avatar className='h-10 w-10 ring-2 ring-white dark:ring-slate-800'>
                    <AvatarFallback className='bg-slate-100 text-slate-500 text-xs font-bold'>
                      {student.fullName
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col min-w-0'>
                    <span className='font-bold text-sm truncate'>{student.fullName}</span>
                    <span className='text-[10px] text-slate-400 font-mono tracking-tighter'>
                      {student.admissionNumber}
                    </span>
                  </div>
                </div>

                <div className='flex items-center gap-1.5'>
                  <Button
                    size='sm'
                    variant={status === 'PRESENT' ? 'default' : 'outline'}
                    className={`flex-1 h-9 gap-1.5 transition-all ${status === 'PRESENT' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-none shadow-sm'}`}
                    onClick={() => updateStatus(student.id, 'PRESENT')}
                  >
                    <span className='text-[10px] font-black tracking-widest'>PRES</span>
                  </Button>
                  <Button
                    size='sm'
                    variant={status === 'ABSENT' ? 'destructive' : 'outline'}
                    className={`flex-1 h-9 gap-1.5 transition-all ${status === 'ABSENT' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-none shadow-sm'}`}
                    onClick={() => updateStatus(student.id, 'ABSENT')}
                  >
                    <span className='text-[10px] font-black tracking-widest'>ABS</span>
                  </Button>
                  <Button
                    size='sm'
                    variant={status === 'LATE' ? 'secondary' : 'outline'}
                    className={`flex-1 h-9 gap-1.5 transition-all ${status === 'LATE' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-amber-600 hover:bg-amber-50 border-none shadow-sm'}`}
                    onClick={() => updateStatus(student.id, 'LATE')}
                  >
                    <span className='text-[10px] font-black tracking-widest'>LATE</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
