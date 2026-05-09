"use client";

import {
  AlertCircle,
  AlertTriangle,
  Clock,
  LayoutGrid,
  List,
  Loader2,
  Save,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { recordAttendance } from './actions';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { feedback } from '@/lib/feedback';
import { SuccessAnimation } from '@/components/ui/success-animation';

type Status = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

export type AttendanceStudent = {
  id: string;
  fullName: string;
  admissionNumber: string;
  attendanceRate?: number; // percentage 0-100, undefined = no data yet
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isPending, setIsPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('');
  const [bulkNote, setBulkNote] = useState('');
  const router = useRouter();

  const hasExistingRecords = students.some((s) => s.attendance.length > 0);
  const isRetroactive = new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  const updateStatus = (studentId: string, status: Status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAllPresent = () => {
    const newAttendance = { ...attendance };
    students.forEach((student) => {
      newAttendance[student.id] = 'PRESENT';
    });
    setAttendance(newAttendance);
    toast.success('All students marked as Present');
  };

  const markAllAbsent = () => {
    const newAttendance = { ...attendance };
    students.forEach((student) => {
      newAttendance[student.id] = 'ABSENT';
    });
    setAttendance(newAttendance);
    toast.error('All students marked as Absent');
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
      note: hasExistingRecords ? correctionReason : (bulkNote || undefined),
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
      feedback.success();
      setShowSuccess(true);
      toast.success('Attendance recorded successfully');
      setTimeout(() => {
        setShowSuccess(false);
        router.refresh();
      }, 2000);
    } else {
      feedback.error();
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

      <div className='flex flex-col gap-6'>
        {/* Stats & View Controls */}
        <div className='flex flex-col xl:flex-row xl:items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 shadow-sm'>
              <UserCheck className='h-3.5 w-3.5' />
              {Object.values(attendance).filter((v) => v === 'PRESENT').length} Present
            </div>
            <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-100 shadow-sm'>
              <XCircle className='h-3.5 w-3.5' />
              {Object.values(attendance).filter((v) => v === 'ABSENT').length} Absent
            </div>

            <Separator orientation='vertical' className='h-6 mx-1 hidden sm:block' />

            <div className='flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-lg'>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size='sm'
                className='h-8 px-3 rounded-md'
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className='h-4 w-4 mr-2' />
                Grid
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size='sm'
                className='h-8 px-3 rounded-md'
                onClick={() => setViewMode('list')}
              >
                <List className='h-4 w-4 mr-2' />
                List
              </Button>
            </div>
          </div>

          <div className='flex items-center gap-3'>
             <Button
                onClick={handleSave}
                className='gradient-primary px-8 h-11 rounded-xl shadow-lg glow-primary'
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
        </div>

        {/* Bulk Management Bar */}
        <div className='p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-500'>
          <div className='flex items-center gap-2 mr-2'>
            <div className='h-8 w-1 gradient-primary rounded-full' />
            <span className='text-[10px] font-black uppercase tracking-[0.2em] text-slate-400'>
              Bulk Actions
            </span>
          </div>
          
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={markAllPresent}
              className='h-9 rounded-lg border-emerald-200 dark:border-emerald-900/30 text-emerald-600 hover:bg-emerald-50 text-xs font-bold'
            >
              <UserCheck className='mr-2 h-3.5 w-3.5' />
              All Present
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={markAllAbsent}
              className='h-9 rounded-lg border-rose-200 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 text-xs font-bold'
            >
              <XCircle className='mr-2 h-3.5 w-3.5' />
              All Absent
            </Button>
          </div>

          <Separator orientation='vertical' className='h-6 mx-2 hidden md:block' />

          <div className='flex-1 min-w-[280px] relative group'>
            <input
              className='w-full h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all group-hover:border-primary/30'
              placeholder='Add a session-wide note (e.g. "School Event", "Sports Day")...'
              value={hasExistingRecords ? correctionReason : bulkNote}
              onChange={(e) => hasExistingRecords ? setCorrectionReason(e.target.value) : setBulkNote(e.target.value)}
            />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity'>
              <Save className='h-4 w-4 text-primary' />
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {students.map((student) => {
            const status = attendance[student.id];
            const isLowAttendance = student.attendanceRate !== undefined && student.attendanceRate < 75;

            let statusStyles = 'bg-amber-50/30 dark:bg-amber-900/5 ring-1 ring-amber-500/10';
            if (status === 'PRESENT') {
              statusStyles = 'bg-white dark:bg-slate-900 ring-1 ring-emerald-500/10';
            } else if (status === 'ABSENT') {
              statusStyles = 'bg-rose-50/30 dark:bg-rose-900/5 ring-1 ring-rose-500/10';
            }

            if (isLowAttendance) {
              statusStyles = 'bg-rose-50/50 dark:bg-rose-900/10 ring-1 ring-rose-500/20';
            }

            return (
              <Card
                key={student.id}
                className={`border-none shadow-premium dark-card-border transition-all duration-300 ${statusStyles}`}
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
                    <div className='flex flex-col min-w-0 flex-1'>
                      <span className='font-bold text-sm truncate'>{student.fullName}</span>
                      <span className='text-[10px] text-slate-400 font-mono tracking-tighter'>
                        {student.admissionNumber}
                      </span>
                    </div>
                    {student.attendanceRate !== undefined && student.attendanceRate < 75 && (
                      <div
                        title={`Attendance: ${student.attendanceRate}% — Below 75% threshold`}
                        className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 text-[9px] font-black shrink-0'
                      >
                        <AlertTriangle className='h-2.5 w-2.5' />
                        {student.attendanceRate}%
                      </div>
                    )}
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <Button
                      size='sm'
                      variant={status === 'PRESENT' ? 'default' : 'outline'}
                      className={`flex-1 h-11 min-w-[44px] gap-1.5 transition-all ${status === 'PRESENT' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 border-none shadow-sm'}`}
                      onClick={() => updateStatus(student.id, 'PRESENT')}
                    >
                      <span className='text-[10px] font-black tracking-widest'>PRES</span>
                    </Button>
                    <Button
                      size='sm'
                      variant={status === 'ABSENT' ? 'destructive' : 'outline'}
                      className={`flex-1 h-11 min-w-[44px] gap-1.5 transition-all ${status === 'ABSENT' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border-none shadow-sm'}`}
                      onClick={() => updateStatus(student.id, 'ABSENT')}
                    >
                      <span className='text-[10px] font-black tracking-widest'>ABS</span>
                    </Button>
                    <Button
                      size='sm'
                      variant={status === 'LATE' ? 'secondary' : 'outline'}
                      className={`flex-1 h-11 min-w-[44px] gap-1.5 transition-all ${status === 'LATE' ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white dark:bg-slate-900 text-slate-400 hover:text-amber-600 hover:bg-amber-50 border-none shadow-sm'}`}
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
      ) : (
        <Card className='border-none shadow-premium dark-card-border overflow-hidden'>
          <Table>
            <TableHeader className='bg-slate-50 dark:bg-slate-900/50'>
              <TableRow className='border-none hover:bg-transparent'>
                <TableHead className='w-[100px] font-bold text-xs'>Student</TableHead>
                <TableHead className='font-bold text-xs'>Full Name</TableHead>
                <TableHead className='font-bold text-xs'>Rate</TableHead>
                <TableHead className='text-right font-bold text-xs'>Status Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const status = attendance[student.id];
                const isLowAttendance = student.attendanceRate !== undefined && student.attendanceRate < 75;
                return (
                  <TableRow
                    key={student.id}
                    className={cn(
                      'border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors',
                      isLowAttendance && 'bg-rose-50/30 dark:bg-rose-900/10'
                    )}
                  >
                    <TableCell>
                      <Avatar className='h-8 w-8'>
                        <AvatarFallback className='bg-slate-100 text-slate-500 text-[10px] font-bold'>
                          {student.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='font-bold text-sm'>{student.fullName}</span>
                        <span className='text-[10px] text-slate-400 font-mono'>
                          {student.admissionNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {student.attendanceRate !== undefined && (
                        <span
                          className={cn(
                            'text-xs font-bold',
                            student.attendanceRate < 75 ? 'text-rose-500' : 'text-emerald-500'
                          )}
                        >
                          {student.attendanceRate}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          size='sm'
                          variant={status === 'PRESENT' ? 'default' : 'outline'}
                          className={cn(
                            'h-9 px-4 rounded-lg text-[10px] font-black tracking-widest transition-all min-w-[80px]',
                            status === 'PRESENT'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-transparent text-slate-400 hover:text-emerald-600 border-none'
                          )}
                          onClick={() => updateStatus(student.id, 'PRESENT')}
                        >
                          PRESENT
                        </Button>
                        <Button
                          size='sm'
                          variant={status === 'ABSENT' ? 'destructive' : 'outline'}
                          className={cn(
                            'h-9 px-4 rounded-lg text-[10px] font-black tracking-widest transition-all min-w-[80px]',
                            status === 'ABSENT'
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-transparent text-slate-400 hover:text-rose-600 border-none'
                          )}
                          onClick={() => updateStatus(student.id, 'ABSENT')}
                        >
                          ABSENT
                        </Button>
                        <Button
                          size='sm'
                          variant={status === 'LATE' ? 'secondary' : 'outline'}
                          className={cn(
                            'h-9 px-4 rounded-lg text-[10px] font-black tracking-widest transition-all min-w-[80px]',
                            status === 'LATE'
                              ? 'bg-amber-500 text-white'
                              : 'bg-transparent text-slate-400 hover:text-amber-600 border-none'
                          )}
                          onClick={() => updateStatus(student.id, 'LATE')}
                        >
                          LATE
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-md"
          >
            <div className="flex flex-col items-center gap-4">
              <SuccessAnimation />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl font-black font-outfit text-slate-900 dark:text-white"
              >
                Attendance Saved!
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
