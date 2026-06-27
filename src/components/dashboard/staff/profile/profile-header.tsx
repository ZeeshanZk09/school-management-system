"use client";

import * as React from "react";
import Link from "next/link";
import { Briefcase, Edit, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProfileHeaderProps {
  staff: {
    id: string;
    fullName: string;
    employmentType: string;
    designation: string;
    department: string;
    staffNumber: string;
  };
}

export function ProfileHeader({ staff }: Readonly<ProfileHeaderProps>) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-xl">
          <AvatarImage src="" />
          <AvatarFallback className="bg-emerald-50 text-emerald-600 text-2xl font-bold">
            {staff.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight font-outfit">{staff.fullName}</h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100">
              {staff.employmentType}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <div className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4" />
              <span>
                {staff.designation} • {staff.department}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>ID: {staff.staffNumber}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" asChild className="h-10">
          <Link href={`/staff/${staff.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Link>
        </Button>
      </div>
    </div>
  );
}
