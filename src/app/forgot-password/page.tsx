"use client";

import { GraduationCap, Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
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
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, {
    success: false,
    message: "",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black p-4">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

      <Card className="w-full max-w-md shadow-2xl border-none glass hover-lift">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 gradient-primary rounded-2xl shadow-lg shadow-blue-500/20">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            Enter your email address and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>

        {state?.success && state.message ? (
          <CardContent className="text-center space-y-4 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                {state.message}
              </p>
              <p className="text-xs text-slate-400">
                Check your inbox and spam folder.
              </p>
            </div>
            <Link href="/login">
              <Button
                variant="ghost"
                className="mt-4 text-primary hover:text-primary/80"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        ) : (
          <form action={formAction}>
            <CardContent className="grid gap-4">
              {state?.message && !state.success && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in zoom-in duration-300">
                  {state.message}
                </div>
              )}

              <div className="grid gap-2">
                <Label
                  htmlFor="email"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:ring-primary/50 transition-all"
                    disabled={isPending}
                  />
                </div>
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
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
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
        )}
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
