"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ClassAssignment {
  id: string;
  class: {
    name: string;
  };
  section?: {
    name: string;
  } | null;
  academicYear: {
    name: string;
  };
}

interface TabAcademicProps {
  staff: {
    classTeacherAssignments: ClassAssignment[];
  };
}

export function TabAcademic({ staff }: Readonly<TabAcademicProps>) {
  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Class Teacher Assignments</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {staff.classTeacherAssignments.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 italic">
            No active class assignments for this staff member.
          </div>
        ) : (
          staff.classTeacherAssignments.map((a) => (
            <Card key={a.id} className="border-none shadow-sm glass overflow-hidden">
              <CardHeader className="bg-primary/5 pb-3">
                <CardTitle className="text-base font-bold">{a.class.name}</CardTitle>
                <CardDescription className="font-bold text-primary">
                  Section {a.section?.name || "All"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-xs text-slate-500">Academic Year: {a.academicYear.name}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
