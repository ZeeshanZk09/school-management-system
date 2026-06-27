"use client";
import Link from "next/link";
import { Edit, GraduationCap, ShieldAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  student: {
    id: string;
    fullName: string;
    status: string;
    photoUrl?: string | null;
    admissionNumber: string;
  };
  activeEnrollment?: {
    class: { name: string };
    section?: { name: string } | null;
  };
}

export function ProfileHeader({ student, activeEnrollment }: Readonly<ProfileHeaderProps>) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-xl">
          <AvatarImage src={student.photoUrl || ""} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
            {student.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-outfit">{student.fullName}</h1>
            <Badge
              className={
                student.status === "ACTIVE"
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-700"
              }
            >
              {student.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" />
              <span>
                {activeEnrollment
                  ? `${activeEnrollment.class.name} - ${activeEnrollment.section?.name ?? ""}`
                  : "Not Enrolled"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span>ID: {student.admissionNumber}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild className="h-10">
          <Link href={`/students/new?edit=true&studentId=${student.id}`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
        <Button className="gradient-primary h-10 shadow-md" asChild>
          <Link href={`/students/${student.id}/finance`}>Generate Report</Link>
        </Button>
      </div>
    </div>
  );
}
