"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StudentContactInitialData {
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
}

interface StepContactInfoProps {
  initialData?: StudentContactInitialData;
  errors: Record<string, string[]>;
}

export function StepContactInfo({ initialData, errors }: Readonly<StepContactInfoProps>) {
  return (
    <Card className="border-none shadow-premium dark-card-border overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-2xl font-black font-outfit">Contact Information</CardTitle>
        <CardDescription className="font-medium">Optional contact details.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label
              htmlFor="email"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialData?.email || ""}
              placeholder="student@example.com"
              className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
            />
            {errors.email && <p className="text-xs text-rose-500">{errors.email[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="phoneNumber"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Phone Number
            </Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              defaultValue={initialData?.phoneNumber || ""}
              placeholder="+1 (555) 000-0000"
              className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
            />
            {errors.phoneNumber && <p className="text-xs text-rose-500">{errors.phoneNumber[0]}</p>}
          </div>
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="address"
            className="font-bold text-xs uppercase tracking-widest text-slate-500"
          >
            Residential Address
          </Label>
          <Input
            id="address"
            name="address"
            defaultValue={initialData?.address || ""}
            placeholder="e.g. 123 Main St, City"
            className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
          />
          {errors.address && <p className="text-xs text-rose-500">{errors.address[0]}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
