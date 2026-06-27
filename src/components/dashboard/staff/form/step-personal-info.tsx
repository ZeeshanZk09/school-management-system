"use client";

import * as React from "react";
import { User } from "lucide-react";
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

interface StaffInitialData {
  fullName?: string;
  staffNumber?: string;
  designation?: string;
  department?: string;
  email?: string;
  phone?: string;
  gender?: string;
  dateOfBirth?: string | Date;
  joiningDate?: string | Date;
  qualification?: string;
}

interface StepPersonalInfoProps {
  initialData?: StaffInitialData;
  errors: Record<string, string[]>;
}

export function StepPersonalInfo({ initialData, errors }: Readonly<StepPersonalInfoProps>) {
  return (
    <Card className="border-none shadow-premium glass">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          Personal Information
        </CardTitle>
        <CardDescription>Basic personal details and identity.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={initialData?.fullName}
              required
              className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
            />
            {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="staffNumber">Staff ID / Employee #</Label>
            <Input
              id="staffNumber"
              name="staffNumber"
              defaultValue={initialData?.staffNumber}
              required
              placeholder="e.g. EMP001"
              className="bg-slate-50/50 dark:bg-slate-900/50 border-none uppercase"
            />
            {errors.staffNumber && <p className="text-xs text-rose-500">{errors.staffNumber[0]}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              name="designation"
              defaultValue={initialData?.designation}
              required
              placeholder="e.g. Senior Teacher"
              className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
            />
            {errors.designation && <p className="text-xs text-rose-500">{errors.designation[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              name="department"
              defaultValue={initialData?.department}
              required
              placeholder="e.g. Science"
              className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
            />
            {errors.department && <p className="text-xs text-rose-500">{errors.department[0]}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="gender">Gender</Label>
            <Select name="gender" defaultValue={initialData?.gender || "UNSPECIFIED"}>
              <SelectTrigger
                id="gender"
                className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
              >
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
                <SelectItem value="UNSPECIFIED">Unspecified</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && <p className="text-xs text-rose-500">{errors.gender[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              name="dateOfBirth"
              type="date"
              defaultValue={
                initialData?.dateOfBirth
                  ? new Date(initialData.dateOfBirth).toISOString().split("T")[0]
                  : ""
              }
              required
              className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
            />
            {errors.dateOfBirth && <p className="text-xs text-rose-500">{errors.dateOfBirth[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="joiningDate">Joining Date</Label>
            <Input
              id="joiningDate"
              name="joiningDate"
              type="date"
              defaultValue={
                initialData?.joiningDate
                  ? new Date(initialData.joiningDate).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              required
              className="bg-slate-50/50 dark:bg-slate-900/50 border-none"
            />
            {errors.joiningDate && <p className="text-xs text-rose-500">{errors.joiningDate[0]}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
