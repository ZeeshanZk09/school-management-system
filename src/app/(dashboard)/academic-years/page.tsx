import { format } from "date-fns";
import { CheckCircle2, MoreHorizontal, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { AcademicYearForm } from "./academic-year-form";

export default async function AcademicYearsPage() {
  await requirePermission("settings.read");

  const academicYears = await prisma.academicYear.findMany({
    where: { isDeleted: false },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Academic Years
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage school sessions and the active academic cycle.
          </p>
        </div>
        <AcademicYearForm>
          <Button className="gradient-primary shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            Add New Year
          </Button>
        </AcademicYearForm>
      </div>

      <Card className="border-none shadow-sm glass overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {academicYears.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-500"
                >
                  No academic years found.
                </TableCell>
              </TableRow>
            ) : (
              academicYears.map((year) => (
                <TableRow
                  key={year.id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell className="font-semibold">{year.name}</TableCell>
                  <TableCell>
                    {format(new Date(year.startDate), "PPP")}
                  </TableCell>
                  <TableCell>{format(new Date(year.endDate), "PPP")}</TableCell>
                  <TableCell>
                    {year.isActive ? (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-3 py-1 flex w-fit items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Active
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-slate-500 px-3 py-1"
                      >
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <AcademicYearForm initialData={year}>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                          >
                            Edit Details
                          </DropdownMenuItem>
                        </AcademicYearForm>
                        {!year.isActive && (
                          <DropdownMenuItem>Set as Active</DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/30">
                          Delete Year
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
