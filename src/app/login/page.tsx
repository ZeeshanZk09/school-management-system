'use client';

import { GraduationCap, Loader2 } from 'lucide-react';
import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { loginAction } from './actions';

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
    message: '',
  });

  return (
    <div className='min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-4'>
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

      <Card className='w-full max-w-md shadow-2xl border-none glass '>
        <CardHeader className='space-y-1 text-center'>
          <div className='flex justify-center mb-4'>
            <div className='p-3 gradient-primary rounded-2xl shadow-lg shadow-blue-500/20'>
              <GraduationCap className='h-8 w-8 text-white' />
            </div>
          </div>
          <CardTitle className='text-3xl font-bold tracking-tight text-slate-900 dark:text-white'>
            Welcome Back
          </CardTitle>
          <CardDescription className='text-slate-500 dark:text-slate-400'>
            Enter your credentials to access the portal
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className='grid gap-4'>
            {state?.message && !state.success && (
              <div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in zoom-in duration-300'>
                {state.message}
              </div>
            )}

            <div className='grid gap-2'>
              <Label htmlFor='email' className='text-slate-700 dark:text-slate-300'>
                Email
              </Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='admin@school.com'
                required
                className='bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 transition-all'
                disabled={isPending}
              />
              {state?.errors?.email && (
                <p className='text-xs text-destructive mt-1'>{state.errors.email[0]}</p>
              )}
            </div>

            <div className='grid gap-2'>
              <div className='flex items-center justify-between'>
                <Label
                  htmlFor='password'
                  title='Password'
                  className='text-slate-700 dark:text-slate-300'
                >
                  Password
                </Label>
                <a
                  href='/forgot-password'
                  className='text-xs font-medium text-primary hover:text-primary/80 transition-colors'
                >
                  Forgot Password?
                </a>
              </div>
              <Input
                id='password'
                name='password'
                type='password'
                placeholder=''
                required
                className='bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 transition-all'
                disabled={isPending}
              />
              {state?.errors?.password && (
                <p className='text-xs text-destructive mt-1'>{state.errors.password[0]}</p>
              )}
            </div>

            <div className='flex items-center space-x-2'>
              <Checkbox
                id='rememberMe'
                name='rememberMe'
                disabled={isPending}
                className='border-slate-300 dark:border-slate-700 data-[state=checked]:bg-primary'
              />
              <Label
                htmlFor='rememberMe'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 dark:text-slate-400'
              >
                Remember me for 30 days
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type='submit'
              className='w-full h-11 text-base font-semibold gradient-primary shadow-lg shadow-blue-500/25 border-none'
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className='fixed bottom-4 text-center w-full'>
        <p className='text-xs text-slate-400 dark:text-slate-600'>
          &copy; {new Date().getFullYear()} School Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
