import {
  Briefcase,
  Filter,
  Mail,
  MoreHorizontal,
  Search,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
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

export default async function StaffPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; page?: string; pageSize?: string }>;
}) {
  await requirePermission("staff.read");
  const params = await searchParams;
  const query = params.query || "";
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;
  const skip = (page - 1) * pageSize;

  const [staffList, totalCount] = await Promise.all([
    prisma.staff.findMany({
      where: {
        isDeleted: false,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { staffNumber: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { fullName: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.staff.count({
      where: {
        isDeleted: false,
        OR: [
          { fullName: { contains: query, mode: "insensitive" } },
          { staffNumber: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    }),
  ]);

  const _totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Staff Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and manage all teachers and school employees.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="h-10">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button asChild className="gradient-primary h-10 shadow-md">
            <Link href="/staff/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm glass overflow-hidden">
        <CardHeader className="pb-0 pt-6 px-6">
          <div className="relative w-full max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <form action="/staff" method="GET">
              <Input
                name="query"
                defaultValue={query}
                placeholder="Search name, email or staff #..."
                className="pl-10 h-10 bg-slate-50/50 dark:bg-slate-900/50 border-none"
              />
            </form>
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 border-y">
              <TableHead className="w-[300px]">Staff Member</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Employment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staffList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Briefcase className="h-10 w-10 text-slate-300" />
                    <p className="text-slate-500 font-medium">
                      No staff members found.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              staffList.map((staff) => (
                <TableRow
                  key={staff.id}
                  className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 ring-2 ring-primary/5">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                          {staff.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white leading-tight">
                          {staff.fullName}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 rounded uppercase">
                            {staff.staffNumber}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                            <Mail className="h-2.5 w-2.5" />
                            {staff.email}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {staff.designation}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 dark:text-slate-400">
                    {staff.department}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        staff.employmentType === "PERMANENT"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : staff.employmentType === "CONTRACT"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-slate-50 text-slate-700 border-slate-100"
                      }
                    >
                      {staff.employmentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Link href={`/staff/${staff.id}`}>View Profile</Link>
                      </Button>
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
                          <DropdownMenuItem asChild>
                            <Link href={`/staff/${staff.id}/edit`}>
                              Edit Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Mark Attendance</DropdownMenuItem>
                          <DropdownMenuItem>Salary Records</DropdownMenuItem>
                          <DropdownMenuItem>Assigned Classes</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-rose-600">
                            Terminate Record
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <div className="px-6 border-t bg-slate-50/30 dark:bg-slate-900/30">
          <Pagination
            totalItems={totalCount}
            pageSize={pageSize}
            currentPage={page}
          />
        </div>
      </Card>
    </div>
  );
}
