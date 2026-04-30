"use client";

import { Loader2, Mail, Save, School } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSettings } from "./actions";

export default function SettingsPage({
  initialData,
}: Readonly<{ initialData: any }>) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateSettings(formData);

    setIsPending(false);

    if (result.success) {
      toast.success("Settings updated successfully");
      router.refresh();
    } else {
      toast.error(result.message || "Failed to update settings");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            System Settings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Configure global school information and administrative parameters.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-none shadow-sm glass md:col-span-2">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold font-outfit">
                  Institutional Information
                </CardTitle>
              </div>
              <CardDescription>
                This information will appear on PDF headers, receipts, and
                salary slips.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  name="schoolName"
                  defaultValue={initialData?.schoolName}
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schoolLogoUrl">School Logo URL</Label>
                <Input
                  id="schoolLogoUrl"
                  name="schoolLogoUrl"
                  defaultValue={initialData?.schoolLogoUrl}
                  placeholder="https://..."
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  defaultValue={initialData?.contactEmail}
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={initialData?.contactPhone}
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={initialData?.city}
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  name="addressLine1"
                  defaultValue={initialData?.addressLine1}
                  required
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label htmlFor="addressLine2">Address Line 2 (Optional)</Label>
                <Input
                  id="addressLine2"
                  name="addressLine2"
                  defaultValue={initialData?.addressLine2}
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm glass md:col-span-2">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold font-outfit">
                  Email Configuration (SMTP)
                </CardTitle>
              </div>
              <CardDescription>
                Configure Gmail SMTP for sending password reset emails and
                notifications. Use a Gmail App Password (not your regular
                password).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 grid gap-6 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="smtpEmail">SMTP Email</Label>
                <Input
                  id="smtpEmail"
                  name="smtpEmail"
                  type="email"
                  defaultValue={initialData?.smtpEmail || ""}
                  placeholder="school@gmail.com"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtpAppPassword">App Password</Label>
                <Input
                  id="smtpAppPassword"
                  name="smtpAppPassword"
                  type="password"
                  placeholder={
                    initialData?.smtpAppPassword
                      ? "••••••••••••••••"
                      : "Enter Gmail App Password"
                  }
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
                <p className="text-xs text-slate-400">
                  Generate an App Password from your Google Account → Security →
                  2-Step Verification → App Passwords.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            type="submit"
            className="gradient-primary px-8 h-12 rounded-xl shadow-lg"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
