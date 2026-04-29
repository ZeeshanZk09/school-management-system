import { format } from "date-fns";
import {
  CalendarDays,
  DollarSign,
  FileText,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/permissions";
import prisma from "@/lib/prisma";
import { FeeComponentForm } from "./fee-component-form";
import { FeeStructureForm } from "./fee-structure-form";

export default async function FeeStructuresPage() {
  await requirePermission("finance.read");

  const structures = await prisma.feeStructure.findMany({
    where: { isDeleted: false },
    include: {
      class: true,
      academicYear: true,
      components: {
        where: { isDeleted: false },
        orderBy: { sortOrder: "asc" },
      },
    },
    orderBy: { class: { name: "asc" } },
  });

  const [classes, academicYears] = await Promise.all([
    prisma.class.findMany({ where: { isDeleted: false } }),
    prisma.academicYear.findMany({
      where: { isDeleted: false },
      orderBy: { startDate: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight font-outfit">
            Fee Structures
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Define fee templates and components for different classes.
          </p>
        </div>
        <FeeStructureForm classes={classes} academicYears={academicYears}>
          <Button className="gradient-primary shadow-md">
            <Plus className="mr-2 h-4 w-4" />
            New Structure
          </Button>
        </FeeStructureForm>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {structures.length === 0 ? (
          <div className="col-span-full h-64 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <DollarSign className="h-12 w-12 text-slate-300 mb-2" />
            <p className="text-slate-500 font-medium">
              No fee structures defined yet.
            </p>
          </div>
        ) : (
          structures.map((s) => (
            <Card
              key={s.id}
              className="border-none shadow-sm glass overflow-hidden group"
            >
              <CardHeader className="pb-3 border-b bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg font-bold">
                      {s.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-bold"
                      >
                        {s.class.name}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium"
                      >
                        {s.academicYear.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <FeeComponentForm feeStructureId={s.id}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </FeeComponentForm>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400"
                    >
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {s.components.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">
                      No fee components added.
                    </p>
                  ) : (
                    s.components.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold">{c.label}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                              <CalendarDays className="h-2.5 w-2.5" />
                              Due: {format(new Date(c.dueDate), "PP")} •{" "}
                              {c.frequency}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-slate-900 dark:text-white">
                            ${Number(c.amount).toLocaleString()}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}

                  {s.components.length > 0 && (
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Total Annual Fee
                      </span>
                      <span className="text-lg font-black text-primary">
                        $
                        {s.components
                          .reduce((acc, curr) => acc + Number(curr.amount), 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
