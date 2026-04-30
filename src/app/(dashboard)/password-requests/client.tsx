'use client';

import { CheckCircle, Clock, KeyRound, ShieldCheck, XCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { approvePasswordReset, rejectPasswordReset } from './actions';

type PasswordRequest = {
  id: string;
  userFullName: string;
  userEmail: string;
  userRoles: string[];
  status: string;
  createdAt: string;
  expiresAt: string;
  decidedAt: string | null;
  decidedByName: string | null;
  decisionNote: string | null;
  isExpired: boolean;
};

export function PasswordRequestsClient({
  requests,
}: Readonly<{
  requests: PasswordRequest[];
}>) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const pending = requests.filter((r) => r.status === 'PENDING_APPROVAL' && !r.isExpired);
  const processed = requests.filter((r) => r.status !== 'PENDING_APPROVAL' || r.isExpired);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    const result = await approvePasswordReset(id);
    setLoadingId(null);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    const result = await rejectPasswordReset(id);
    setLoadingId(null);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const statusBadge = (status: string, isExpired: boolean) => {
    if (isExpired || status === 'EXPIRED') {
      return (
        <Badge variant='secondary' className='bg-slate-100 text-slate-500'>
          <Clock className='mr-1 h-3 w-3' />
          Expired
        </Badge>
      );
    }
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <Badge
            variant='secondary'
            className='bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          >
            <Clock className='mr-1 h-3 w-3' />
            Pending
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge
            variant='secondary'
            className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          >
            <CheckCircle className='mr-1 h-3 w-3' />
            Approved
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge
            variant='secondary'
            className='bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          >
            <XCircle className='mr-1 h-3 w-3' />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant='secondary'>{status}</Badge>;
    }
  };

  return (
    <div className='space-y-6 animate-in fade-in duration-500'>
      <div className='space-y-1'>
        <h1 className='text-3xl font-bold tracking-tight font-outfit'>Password Reset Requests</h1>
        <p className='text-slate-500 dark:text-slate-400'>
          Review and approve password reset requests from users.
        </p>
      </div>

      {/* Pending Requests */}
      <Card className='border-none shadow-sm glass'>
        <CardHeader className='border-b border-slate-100 dark:border-slate-800'>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='h-5 w-5 text-amber-500' />
            <CardTitle className='text-xl font-bold font-outfit'>Pending Approval</CardTitle>
            {pending.length > 0 && (
              <Badge className='bg-amber-500 text-white ml-2'>{pending.length}</Badge>
            )}
          </div>
          <CardDescription>
            These users have verified their identity and are waiting for your approval to change
            their password.
          </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
          {pending.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-center'>
              <KeyRound className='h-10 w-10 text-slate-300 dark:text-slate-700 mb-3' />
              <p className='text-sm text-slate-400'>No pending password reset requests.</p>
            </div>
          ) : (
            <div className='divide-y divide-slate-100 dark:divide-slate-800'>
              {pending.map((req) => (
                <div
                  key={req.id}
                  className='flex items-center justify-between p-4 lg:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors'
                >
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-slate-900 dark:text-white'>
                        {req.userFullName}
                      </span>
                      {statusBadge(req.status, req.isExpired)}
                    </div>
                    <span className='text-xs text-slate-500'>{req.userEmail}</span>
                    <div className='flex items-center gap-3 mt-1'>
                      <span className='text-xs text-slate-400'>Requested: {req.createdAt}</span>
                      <span className='text-xs text-slate-400'>Expires: {req.expiresAt}</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30'
                      disabled={loadingId === req.id}
                      onClick={() => handleReject(req.id)}
                    >
                      <XCircle className='mr-1 h-4 w-4' />
                      Reject
                    </Button>
                    <Button
                      size='sm'
                      className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      disabled={loadingId === req.id}
                      onClick={() => handleApprove(req.id)}
                    >
                      <CheckCircle className='mr-1 h-4 w-4' />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      {processed.length > 0 && (
        <Card className='border-none shadow-sm glass'>
          <CardHeader className='border-b border-slate-100 dark:border-slate-800'>
            <CardTitle className='text-lg font-bold font-outfit'>History</CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <div className='divide-y divide-slate-100 dark:divide-slate-800'>
              {processed.map((req) => (
                <div
                  key={req.id}
                  className='flex items-center justify-between p-4 lg:p-6 opacity-70'
                >
                  <div className='flex flex-col gap-1'>
                    <div className='flex items-center gap-2'>
                      <span className='font-medium text-slate-700 dark:text-slate-300'>
                        {req.userFullName}
                      </span>
                      {statusBadge(req.status, req.isExpired)}
                    </div>
                    <span className='text-xs text-slate-500'>{req.userEmail}</span>
                    <div className='flex items-center gap-3 mt-1'>
                      <span className='text-xs text-slate-400'>Requested: {req.createdAt}</span>
                      {req.decidedAt && (
                        <span className='text-xs text-slate-400'>
                          Decided: {req.decidedAt}
                          {req.decidedByName && ` by ${req.decidedByName}`}
                        </span>
                      )}
                    </div>
                    {req.decisionNote && (
                      <span className='text-xs text-slate-400 italic mt-1'>
                        Note: {req.decisionNote}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
