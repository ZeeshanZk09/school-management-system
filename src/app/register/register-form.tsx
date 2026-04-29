"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "./actions";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerUser, {
    success: false,
    message: "",
  });

  if (state.success) {
    return (
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold font-outfit">Request Submitted</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {state.message}
          </p>
        </div>
        <Button
          asChild
          className="w-full h-11 rounded-xl gradient-primary"
          variant="outline"
        >
          <a href="/login">Return to Login</a>
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.message && !state.success && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold animate-in fade-in slide-in-from-top-1">
          {state.message}
        </div>
      )}

      <div className="grid gap-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          placeholder="e.g. John Doe"
          required
          disabled={isPending}
          className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="name@institution.com"
          required
          disabled={isPending}
          className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
          className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          disabled={isPending}
          className="h-11 bg-slate-50 dark:bg-slate-900 border-none rounded-xl"
        />
      </div>

      <Button
        type="submit"
        className="w-full h-11 rounded-xl gradient-primary shadow-lg shadow-blue-500/20 font-bold"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Register Account"
        )}
      </Button>
    </form>
  );
}
