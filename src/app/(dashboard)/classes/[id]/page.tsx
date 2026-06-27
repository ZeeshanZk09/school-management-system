import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Users, GraduationCap, ArrowLeft, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireAuth, ForbiddenError } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";

export default async function ClassDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const user = await requireAuth();
  const { id } = await params;

  // Enforce teacher class isolation
  if (user.roles.includes("TEACHER")) {
    const isAssigned = user.assignedClasses.some((ac) => ac.classId === id);
    if (!isAssigned) {
      throw new ForbiddenError("You are not assigned to this class.");
    }
  }

  // Fetch Class details, sections, and active enrollments
  const [cls, sections, enrollments] = await Promise.all([
    prisma.class.findUnique({
      where: { id, isDeleted: false },
    }),
    prisma.section.findMany({
      where: { classId: id, isDeleted: false },
      include: {
        classTeacher: true,
        _count: {
          select: {
            enrollments: { where: { academicYear: { isActive: true }, isDeleted: false } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.studentEnrollment.findMany({
      where: {
        classId: id,
        academicYear: { isActive: true },
        isDeleted: false,
        student: { isDeleted: false },
      },
      include: {
        student: {
          include: {
            guardians: {
              where: { isDeleted: false },
              include: { guardian: true },
              orderBy: { isPrimaryEmergency: "desc" },
            },
          },
        },
        section: true,
      },
      orderBy: [{ section: { name: "asc" } }, { rollNumber: "asc" }],
    }),
  ]);

  if (!cls) {
    notFound();
  }

  const totalCapacity = sections.reduce((acc, sec) => acc + (sec.capacity || 30), 0);
  const totalStudents = enrollments.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-xl">
          <Link href="/classes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight font-outfit text-slate-900 dark:text-white">
              {cls.name}
            </h1>
            {cls.code && (
              <Badge className="bg-slate-100 text-slate-600 border-none select-none text-[10px] font-bold">
                {cls.code}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500">Roster, sections, and teacher assignments.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Enrolled
              </p>
              <h3 className="text-2xl font-black font-outfit text-slate-900 dark:text-white">
                {totalStudents}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <GraduationCap className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Sections
              </p>
              <h3 className="text-2xl font-black font-outfit text-slate-900 dark:text-white">
                {sections.length}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <BookOpen className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Class Capacity
              </p>
              <h3 className="text-2xl font-black font-outfit text-slate-900 dark:text-white">
                {totalStudents} / {totalCapacity}
              </h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sections Roster summary */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Class Sections
          </h3>
          {sections.map((sec) => (
            <Card key={sec.id} className="border-none shadow-sm bg-white dark:bg-slate-900/50">
              <CardHeader className="p-4 pb-2 border-b">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-bold">Section {sec.name}</CardTitle>
                  <Badge className="bg-slate-100 text-slate-600 border-none select-none text-[10px] font-bold">
                    {sec._count.enrollments} / {sec.capacity || 30}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Class Teacher
                  </span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {sec.classTeacher?.fullName || "Not Assigned"}
                  </span>
                  {sec.classTeacher?.email && (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {sec.classTeacher.email}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {sections.length === 0 && (
            <p className="text-xs text-slate-400 italic">No sections configured for this class.</p>
          )}
        </div>

        {/* Student Roster Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Student Roster
          </h3>
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
                  <TableHead className="w-[80px]">Roll No</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Emergency Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.map((enr) => {
                  const primaryGuardianLink = enr.student.guardians[0];
                  const guardian = primaryGuardianLink?.guardian;
                  return (
                    <TableRow
                      key={enr.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {enr.rollNumber}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {enr.student.fullName}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Adm: {enr.student.admissionNumber}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-indigo-50 text-indigo-700 border-none select-none text-[10px] font-bold">
                          {enr.section?.name || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {guardian ? (
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{guardian.fullName}</span>
                            <span className="text-[10px] text-slate-500 flex items-center gap-1">
                              <Phone className="h-2.5 w-2.5" />
                              {guardian.primaryPhone}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None linked</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-8 text-xs text-primary"
                        >
                          <Link href={`/students/${enr.studentId}`}>View Profile</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {enrollments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-xs text-slate-400 italic"
                    >
                      No active student enrollments for this class.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
