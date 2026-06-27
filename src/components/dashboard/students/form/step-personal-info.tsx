"use client";

import * as React from "react";
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

interface StudentPersonalInitialData {
  fullName?: string;
  admissionNumber?: string;
  rollNumber?: string;
  gender?: string;
  dateOfBirth?: string | Date | null;
  admissionDate?: string | Date | null;
}

interface StepPersonalInfoProps {
  initialData?: StudentPersonalInitialData;
  errors: Record<string, string[]>;
}

export function StepPersonalInfo({ initialData, errors }: Readonly<StepPersonalInfoProps>) {
  return (
    <Card className="border-none shadow-premium dark-card-border overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-2xl font-black font-outfit">Personal Information</CardTitle>
        <CardDescription className="font-medium">Basic details about the student.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <Label
              htmlFor="fullName"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Full Name
            </Label>
            <Input
              id="fullName"
              name="fullName"
              defaultValue={initialData?.fullName}
              required
              placeholder="e.g. John Doe"
              className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
            />
            {errors.fullName && <p className="text-xs text-rose-500">{errors.fullName[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="admissionNumber"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Admission #
            </Label>
            <Input
              id="admissionNumber"
              name="admissionNumber"
              defaultValue={initialData?.admissionNumber}
              required
              placeholder="ADM-001"
              className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
            />
            {errors.admissionNumber && (
              <p className="text-xs text-rose-500">{errors.admissionNumber[0]}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="grid gap-2">
            <Label
              htmlFor="dateOfBirth"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Date of Birth
            </Label>
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
              className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
            />
            {errors.dateOfBirth && <p className="text-xs text-rose-500">{errors.dateOfBirth[0]}</p>}
          </div>
          <div className="grid gap-2">
            <Label
              htmlFor="gender"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Gender
            </Label>
            <Select name="gender" defaultValue={initialData?.gender || "UNSPECIFIED"}>
              <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
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
            <Label
              htmlFor="admissionDate"
              className="font-bold text-xs uppercase tracking-widest text-slate-500"
            >
              Admission Date
            </Label>
            <Input
              id="admissionDate"
              name="admissionDate"
              type="date"
              defaultValue={
                initialData?.admissionDate
                  ? new Date(initialData.admissionDate).toISOString().split("T")[0]
                  : new Date().toISOString().split("T")[0]
              }
              required
              className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl"
            />
            {errors.admissionDate && (
              <p className="text-xs text-rose-500">{errors.admissionDate[0]}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
