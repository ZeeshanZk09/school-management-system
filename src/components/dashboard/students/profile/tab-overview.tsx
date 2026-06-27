"use client";

import * as React from "react";
import { format } from "date-fns";
import { Download, History, Mail, MapPin, Phone } from "lucide-react";
import { StudentDocumentUpload } from "@/components/dashboard/students/document-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EnrollmentItem {
  id: string;
  class: { name: string };
  section?: { name: string } | null;
  academicYear: { name: string };
}

interface DocumentItem {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  uploadedAt: Date | string;
  sizeBytes: number;
}

interface TabOverviewProps {
  student: {
    id: string;
    dateOfBirth?: Date | string | null;
    gender: string;
    admissionDate: Date | string;
    email?: string | null;
    phoneNumber?: string | null;
    address?: string | null;
    enrollments: EnrollmentItem[];
    documents: DocumentItem[];
  };
  activeEnrollment?: {
    rollNumber?: string | null;
  };
}

export function TabOverview({ student, activeEnrollment }: Readonly<TabOverviewProps>) {
  return (
    <div className="pt-6 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date of Birth
              </p>
              <p className="text-sm font-medium">
                {student.dateOfBirth ? format(new Date(student.dateOfBirth), "PPP") : "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Gender
              </p>
              <p className="text-sm font-medium">{student.gender}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Admission Date
              </p>
              <p className="text-sm font-medium">
                {format(new Date(student.admissionDate), "PPP")}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Roll Number
              </p>
              <p className="text-sm font-medium">
                {activeEnrollment?.rollNumber || "Not Assigned"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Mail className="h-4 w-4 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </p>
                {student.email ? (
                  <a
                    href={`mailto:${student.email}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {student.email}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-500">N/A</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Phone className="h-4 w-4 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </p>
                {student.phoneNumber ? (
                  <a
                    href={`tel:${student.phoneNumber}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {student.phoneNumber}
                  </a>
                ) : (
                  <p className="text-sm font-medium text-slate-500">N/A</p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 sm:col-span-2">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <MapPin className="h-4 w-4 text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Residential Address
                </p>
                <p className="text-sm font-medium">{student.address || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm glass bg-linear-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
              <History className="h-4 w-4 text-primary" />
              Academic History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.enrollments.map((e) => (
              <div
                key={e.id}
                className="relative pl-6 pb-4 border-l last:pb-0 border-slate-200 dark:border-slate-800"
              >
                <div className="absolute left-[-5px] top-0 h-2 w-2 rounded-full bg-primary" />
                <p className="text-xs font-bold text-primary mb-1">{e.academicYear.name}</p>
                <p className="text-sm font-semibold">
                  {e.class.name} - {e.section?.name ?? ""}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {student.documents.length === 0 ? (
              <div className="flex items-center justify-between p-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
                <span>No documents uploaded.</span>
                <StudentDocumentUpload studentId={student.id} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end">
                  <StudentDocumentUpload studentId={student.id} />
                </div>
                <div className="space-y-2">
                  {student.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50"
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold truncate">{doc.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {format(new Date(doc.uploadedAt), "MMM d, yyyy")} •{" "}
                          {(doc.sizeBytes / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" asChild>
                        <a
                          href={doc.filePath}
                          download={doc.fileName}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
