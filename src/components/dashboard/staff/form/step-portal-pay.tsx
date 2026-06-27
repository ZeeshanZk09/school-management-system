"use client";

import * as React from "react";
import { ShieldCheck, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StaffPortalPayInitialData {
  email?: string;
  phoneNumber?: string;
  employmentType?: string;
  baseSalary?: number | string;
  qualification?: string;
  experience?: string;
}

interface StepPortalPayProps {
  initialData?: StaffPortalPayInitialData;
  errors: Record<string, string[]>;
}

export function StepPortalPay({ initialData, errors }: Readonly<StepPortalPayProps>) {
  return (
    <div className="grid gap-6">
      <Card className="border-none shadow-premium glass">
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-500" />
            Portal & Financial
          </CardTitle>
          <CardDescription>Credentials and payroll details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {!initialData && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 flex gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                  Account Auto-Creation
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  A user account will be created automatically. The default password will be the
                  Staff ID.
                </p>
              </div>
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={initialData?.email}
                required
                placeholder="employee@school.com"
                className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
              />
              {errors.email && <p className="text-xs text-rose-500">{errors.email[0]}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={initialData?.phoneNumber}
                placeholder="+1 (555) 000-0000"
                className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
              />
              {errors.phoneNumber && (
                <p className="text-xs text-rose-500">{errors.phoneNumber[0]}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-premium glass">
        <CardContent className="pt-6 grid gap-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="employmentType">Employment Type</Label>
              <Select
                name="employmentType"
                defaultValue={initialData?.employmentType || "PERMANENT"}
              >
                <SelectTrigger
                  id="employmentType"
                  className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
                >
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERMANENT">Permanent</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="PART_TIME">Part Time</SelectItem>
                </SelectContent>
              </Select>
              {errors.employmentType && (
                <p className="text-xs text-rose-500">{errors.employmentType[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="baseSalary">Monthly Base Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  Rs
                </span>
                <Input
                  id="baseSalary"
                  name="baseSalary"
                  type="number"
                  defaultValue={initialData?.baseSalary || 0}
                  className="pl-8 bg-slate-50/50 dark:bg-slate-900/50 border-none"
                />
              </div>
              {errors.baseSalary && <p className="text-xs text-rose-500">{errors.baseSalary[0]}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="qualification">Qualifications</Label>
              <Input
                id="qualification"
                name="qualification"
                defaultValue={initialData?.qualification}
                placeholder="e.g. M.Ed, B.Sc"
                className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
              />
              {errors.qualification && (
                <p className="text-xs text-rose-500">{errors.qualification[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="experience">Previous Experience</Label>
              <Input
                id="experience"
                name="experience"
                defaultValue={initialData?.experience}
                placeholder="e.g. 5 years in high school"
                className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
              />
              {errors.experience && <p className="text-xs text-rose-500">{errors.experience[0]}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
