"use client";

import * as React from "react";
import Link from "next/link";
import { Edit, Plus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GuardianForm } from "@/app/(dashboard)/students/[id]/guardian-form";
import { SiblingForm } from "@/app/(dashboard)/students/[id]/sibling-form";

interface GuardianLink {
  guardianId: string;
  relationship: string;
  isPrimaryEmergency: boolean;
  guardian: {
    fullName: string;
    primaryPhone: string;
    email?: string | null;
    occupation?: string | null;
  };
}

interface SiblingMember {
  studentId: string;
  student: {
    fullName: string;
    admissionNumber: string;
    photoUrl?: string | null;
    enrollments: Array<{
      class: { name: string };
    }>;
  };
}

interface SiblingGroupItem {
  group: {
    members: SiblingMember[];
  };
}

interface TabGuardiansProps {
  student: {
    id: string;
    guardians: GuardianLink[];
    siblings: SiblingGroupItem[];
  };
}

export function TabGuardians({ student }: Readonly<TabGuardiansProps>) {
  const hasSiblings = student.siblings.length > 0 && student.siblings[0].group.members.length > 0;

  return (
    <div className="pt-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Guardian Information</h2>
        <GuardianForm studentId={student.id}>
          <Button size="sm" className="gradient-primary">
            <Plus className="mr-2 h-4 w-4" />
            Add Guardian
          </Button>
        </GuardianForm>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {student.guardians.length === 0 ? (
          <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            No guardians linked to this student.
          </div>
        ) : (
          student.guardians.map((link) => (
            <Card key={link.guardianId} className="border-none shadow-sm glass group/card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">{link.guardian.fullName}</CardTitle>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      {link.relationship}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {link.isPrimaryEmergency && (
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none text-[10px] font-bold">
                      PRIMARY
                    </Badge>
                  )}
                  <GuardianForm
                    studentId={student.id}
                    initialData={{
                      id: link.guardianId,
                      fullName: link.guardian.fullName,
                      relation: link.relationship,
                      phoneNumber: link.guardian.primaryPhone,
                      email: link.guardian.email || "",
                      occupation: link.guardian.occupation || "",
                      isPrimary: link.isPrimaryEmergency,
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </GuardianForm>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Phone
                    </p>
                    <p className="text-sm font-medium">{link.guardian.primaryPhone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Email
                    </p>
                    <p className="text-sm font-medium">{link.guardian.email || "N/A"}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Occupation
                  </p>
                  <p className="text-sm font-medium">{link.guardian.occupation || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold">Siblings</h2>
            <p className="text-sm text-slate-500">
              Students linked as part of the same family group.
            </p>
          </div>
          <SiblingForm studentId={student.id}>
            <Button variant="outline" size="sm" className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Link Sibling
            </Button>
          </SiblingForm>
        </div>

        {hasSiblings ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.siblings[0].group.members.map((member) => (
              <Link key={member.studentId} href={`/students/${member.studentId}`} className="group">
                <Card className="border-none shadow-sm glass hover:shadow-md transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 ring-2 ring-white dark:ring-slate-800">
                        <AvatarImage src={member.student.photoUrl || ""} />
                        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold">
                          {member.student.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors truncate">
                          {member.student.fullName}
                        </span>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                          {member.student.admissionNumber}
                        </span>
                        <Badge variant="secondary" className="w-fit mt-1 text-[9px] py-0 h-4">
                          {member.student.enrollments[0]?.class.name || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400">
            No siblings linked to this student.
          </div>
        )}
      </div>
    </div>
  );
}
