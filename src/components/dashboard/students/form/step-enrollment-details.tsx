"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClassSection {
  id: string;
  name: string;
}

interface ClassItem {
  id: string;
  name: string;
  sections: ClassSection[];
}

interface AcademicYearItem {
  id: string;
  name: string;
  startDate: Date | string;
  endDate: Date | string;
  isActive: boolean;
  isCurrent?: boolean;
}

interface StepEnrollmentDetailsProps {
  classes: ClassItem[];
  academicYears: AcademicYearItem[];
  selectedClass: string;
  setSelectedClass: (val: string) => void;
  errors: Record<string, string[]>;
}

export function StepEnrollmentDetails({
  classes,
  academicYears,
  selectedClass,
  setSelectedClass,
  errors,
}: Readonly<StepEnrollmentDetailsProps>) {
  const sections = classes.find((c) => c.id === selectedClass)?.sections || [];

  return (
    <Card className="border-none shadow-premium dark-card-border overflow-hidden">
      <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 p-8 border-b border-slate-100 dark:border-slate-800">
        <CardTitle className="text-2xl font-black font-outfit">Enrollment Details</CardTitle>
        <CardDescription className="font-medium">Assign the student to a class.</CardDescription>
      </CardHeader>
      <CardContent className="p-8 grid md:grid-cols-3 gap-6">
        <div className="grid gap-2">
          <Label
            htmlFor="academicYearId"
            className="font-bold text-xs uppercase tracking-widest text-slate-500"
          >
            Academic Year
          </Label>
          <Select name="academicYearId" defaultValue={academicYears.find((y) => y.isActive)?.id}>
            <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} {year.isActive && "(Active)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.academicYearId && (
            <p className="text-xs text-rose-500">{errors.academicYearId[0]}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="classId"
            className="font-bold text-xs uppercase tracking-widest text-slate-500"
          >
            Class
          </Label>
          <Select
            name="classId"
            defaultValue={selectedClass || undefined}
            onValueChange={(val: string | null) => setSelectedClass(val ?? "")}
          >
            <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.classId && <p className="text-xs text-rose-500">{errors.classId[0]}</p>}
        </div>
        <div className="grid gap-2">
          <Label
            htmlFor="sectionId"
            className="font-bold text-xs uppercase tracking-widest text-slate-500"
          >
            Section
          </Label>
          <Select name="sectionId" disabled={!selectedClass}>
            <SelectTrigger className="h-12 bg-slate-50/50 dark:bg-slate-900/50 border-none rounded-xl">
              <SelectValue placeholder="Select Section" />
            </SelectTrigger>
            <SelectContent>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sectionId && <p className="text-xs text-rose-500">{errors.sectionId[0]}</p>}
        </div>
      </CardContent>
    </Card>
  );
}
