import { GraduationCap, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSystemSettings } from "@/lib/settings";
import { RegisterForm } from "./register-form";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const settings = await getSystemSettings();

  if (!settings.allowSelfRegistration) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <Card className="max-w-md w-full border-none shadow-2xl glass overflow-hidden">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/20 text-rose-600">
                <ShieldAlert className="h-12 w-12" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black font-outfit">
                Registration Closed
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Self-registration is currently disabled by the school
                administrator.
              </p>
            </div>
            <Button asChild className="w-full gradient-primary h-11 rounded-xl">
              <Link href="/login">Back to Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="p-3 gradient-primary rounded-2xl shadow-lg">
              <GraduationCap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-black tracking-tight font-outfit text-slate-900 dark:text-white">
            Join {settings.schoolName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Create your institutional account to get started.
          </p>
        </div>

        <Card className="border-none shadow-2xl glass overflow-hidden">
          <CardContent className="p-8">
            <RegisterForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-slate-500 font-medium">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
