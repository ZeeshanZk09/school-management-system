"use client";

import * as React from "react";
import { UserCheck, XCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface BulkActionBarProps {
  presentCount: number;
  absentCount: number;
  hasExistingRecords: boolean;
  correctionReason: string;
  setCorrectionReason: (val: string) => void;
  bulkNote: string;
  setBulkNote: (val: string) => void;
  markAllPresent: () => void;
  markAllAbsent: () => void;
}

export function BulkActionBar({
  presentCount: _presentCount,
  absentCount: _absentCount,
  hasExistingRecords,
  correctionReason,
  setCorrectionReason,
  bulkNote,
  setBulkNote,
  markAllPresent,
  markAllAbsent,
}: Readonly<BulkActionBarProps>) {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center gap-4 animate-in slide-in-from-top-2 duration-500">
      <div className="flex items-center gap-2 mr-2">
        <div className="h-8 w-1 gradient-primary rounded-full" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
          Bulk Actions
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={markAllPresent}
          className="h-9 rounded-lg border-emerald-200 dark:border-emerald-900/30 text-emerald-600 hover:bg-emerald-50 text-xs font-bold"
        >
          <UserCheck className="mr-2 h-3.5 w-3.5" />
          All Present
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllAbsent}
          className="h-9 rounded-lg border-rose-200 dark:border-rose-900/30 text-rose-600 hover:bg-rose-50 text-xs font-bold"
        >
          <XCircle className="mr-2 h-3.5 w-3.5" />
          All Absent
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6 mx-2 hidden md:block" />

      <div className="flex-1 min-w-[280px] relative group">
        <input
          className="w-full h-10 pl-4 pr-10 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all group-hover:border-primary/30"
          placeholder='Add a session-wide note (e.g. "School Event", "Sports Day")...'
          value={hasExistingRecords ? correctionReason : bulkNote}
          onChange={(e) =>
            hasExistingRecords ? setCorrectionReason(e.target.value) : setBulkNote(e.target.value)
          }
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-30 group-hover:opacity-100 transition-opacity">
          <Save className="h-4 w-4 text-primary" />
        </div>
      </div>
    </div>
  );
}
