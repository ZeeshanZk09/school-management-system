"use client";

import * as React from "react";
import { format } from "date-fns";
import { DollarSign, Mail, Phone, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Decimal } from "@prisma/client/runtime/client";

interface RoleRelation {
  role: {
    id: string;
    name: string;
  };
}

interface UserRelation {
  roles: RoleRelation[];
}

interface TabOverviewProps {
  staff: {
    dateOfBirth?: Date | string | null;
    gender: string;
    joiningDate: Date | string;
    qualification?: string | null;
    email: string | null;
    phoneNumber?: string | null;
    user?: UserRelation | null;
  };
  currentSalary?: {
    basePay: Decimal | number;
  } | null;
}

export function TabOverview({ staff, currentSalary }: Readonly<TabOverviewProps>) {
  return (
    <div className="pt-6 grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Personal & Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Date of Birth
              </p>
              {staff.dateOfBirth ? (
                <p className="text-sm font-medium">{format(new Date(staff.dateOfBirth), "PPP")}</p>
              ) : (
                <p className="text-sm font-medium">N/A</p>
              )}
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Gender
              </p>
              <p className="text-sm font-medium">{staff.gender}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Joining Date
              </p>
              <p className="text-sm font-medium">{format(new Date(staff.joiningDate), "PPP")}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Qualifications
              </p>
              <p className="text-sm font-medium">{staff.qualification || "N/A"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Contact & Portal Access</CardTitle>
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
                <p className="text-sm font-medium">{staff.email}</p>
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
                <p className="text-sm font-medium">{staff.phoneNumber || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-sm glass bg-linear-to-br from-emerald-500/5 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              System Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {staff.user?.roles.map((r) => (
              <Badge
                key={r.role.id}
                variant="secondary"
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold text-[10px]"
              >
                {r.role.name}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm glass">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-500" />
              Payroll Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Base Pay
              </p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {currentSalary
                  ? `Rs ${Number(currentSalary.basePay).toLocaleString()}`
                  : "Not Configured"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
