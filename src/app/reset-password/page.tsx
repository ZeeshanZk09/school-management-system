"use client";

import {
  ArrowLeft,
  CheckCircle,
  Clock,
  GraduationCap,
  Loader2,
  Lock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ResetPasswordResponse,
  submitPasswordReset,
  verifyResetToken,
} from "./actions";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token") || "";

  const [tokenStatus, setTokenStatus] = useState<{
    loading: boolean;
    valid: boolean;
    userFullName?: string;
    isAdmin?: boolean;
  }>({ loading: true, valid: false });

  useEffect(() => {
    if (!rawToken) {
      setTokenStatus({ loading: false, valid: false });
      return;
    }

    verifyResetToken(rawToken).then((result) => {
      setTokenStatus({
        loading: false,
        valid: result.valid,
        userFullName: result.userFullName,
        isAdmin: result.isAdmin,
      });
    });
  }, [rawToken]);

  const boundAction = useCallback(
    (prev: ResetPasswordResponse, formData: FormData) =>
      submitPasswordReset(rawToken, prev, formData),
    [rawToken],
  );

  const [state, formAction, isPending] = useActionState(boundAction, {
    success: false,
    message: "",
  });

  // Loading state
  if (tokenStatus.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-4">
        <Card className="w-full max-w-md shadow-2xl border-none glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-slate-500">Verifying reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (!tokenStatus.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <Card className="w-full max-w-md shadow-2xl border-none glass">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
              <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Invalid or Expired Link
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              This password reset link is invalid or has expired. Please request
              a new one.
            </p>
            <Link href="/forgot-password">
              <Button className="mt-4 gradient-primary shadow-lg">
                Request New Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (state.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <Card className="w-full max-w-md shadow-2xl border-none glass">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            {state.requiresApproval ? (
              <>
                <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
                  <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Approval Required
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  {state.message}
                </p>
              </>
            ) : (
              <>
                <div className="p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                  <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Password Reset Successful
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                  {state.message}
                </p>
              </>
            )}
            <Link href="/login">
              <Button className="mt-4 gradient-primary shadow-lg">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

      <Card className="w-full max-w-md shadow-2xl border-none glass hover-lift">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 gradient-primary rounded-2xl shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Hello <strong>{tokenStatus.userFullName}</strong>, enter your new
            password below
            {!tokenStatus.isAdmin && (
              <span className="block mt-1 text-xs text-amber-600 dark:text-amber-400">
                Note: Your reset will require admin approval
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="grid gap-4">
            {state?.message && !state.success && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in zoom-in duration-300">
                {state.message}
              </div>
            )}

            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-slate-700 dark:text-slate-300"
              >
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 transition-all"
                  disabled={isPending}
                />
              </div>
              {state?.errors?.password && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.password[0]}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label
                htmlFor="confirmPassword"
                className="text-slate-700 dark:text-slate-300"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 transition-all"
                  disabled={isPending}
                />
              </div>
              {state?.errors?.confirmPassword && (
                <p className="text-xs text-destructive mt-1">
                  {state.errors.confirmPassword[0]}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold gradient-primary shadow-lg shadow-blue-500/25 border-none"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
            <Link href="/login" className="w-full">
              <Button
                type="button"
                variant="ghost"
                className="w-full text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>

      <div className="fixed bottom-4 text-center w-full">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          &copy; {new Date().getFullYear()} School Management System. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
