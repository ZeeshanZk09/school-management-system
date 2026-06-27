"use client";

import { debounce } from "lodash";
import {
  Briefcase,
  GraduationCap,
  Loader2,
  Search,
  UserPlus,
  Wallet,
  CalendarCheck,
  User,
  PlusCircle,
  FileText,
  DollarSign,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  CommandDialog,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import type { Staff, Student } from "@/lib/generated/prisma/browser";

// ============ CONSTANTS ============
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_QUERY_LENGTH = 2;
const SEARCH_MAX_HEIGHT_CLASS = "max-h-[450px]";

// ============ TYPES ============
interface SearchResults {
  students: Student[];
  staff: Staff[];
}

/**
 * Renders a single action item in the command palette.
 */
const ActionItem = memo(
  ({
    icon: Icon,
    title,
    description,
    onSelect,
    colorClass,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    onSelect: () => void;
    colorClass: string;
  }) => (
    <CommandItem onSelect={onSelect} className="flex items-center gap-3 p-3 cursor-pointer">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-col text-left">
        <span className="font-bold">{title}</span>
        <span className="text-[10px] text-slate-500">{description}</span>
      </div>
      <PlusCircle className="ml-auto h-4 w-4 opacity-30" />
    </CommandItem>
  ),
);

ActionItem.displayName = "ActionItem";

/**
 * Renders a search result item (Student or Staff) with quick actions.
 */
const SearchResultItem = memo(
  ({
    icon: Icon,
    title,
    subtitle,
    path,
    colorClass,
    actions,
    onSelect,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
    path: string;
    colorClass: string;
    onSelect: (path: string) => void;
    actions: {
      label: string;
      icon: React.ComponentType<{ className?: string }>;
      path: string;
      variant: string;
    }[];
  }) => (
    <div className="relative group/item">
      <CommandItem
        value={title}
        onSelect={() => onSelect(path)}
        className="flex items-center gap-3 p-3 cursor-pointer"
      >
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="font-bold">{title}</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{subtitle}</span>
        </div>

        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
          {actions.map((action) => (
            <Button
              key={action.label}
              size="sm"
              variant="ghost"
              className={`h-8 px-2 text-[10px] uppercase font-bold ${action.variant}`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect(action.path);
              }}
            >
              <action.icon className="h-3 w-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </CommandItem>
    </div>
  ),
);

SearchResultItem.displayName = "SearchResultItem";

/**
 * Global Search component providing a command palette interface for quick navigation and actions.
 */
export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({
    students: [],
    staff: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const performSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        if (!q.trim()) {
          setResults({ students: [], staff: [] });
          return;
        }
        setIsLoading(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          const data = await res.json();
          setResults(data);
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsLoading(false);
        }
      }, SEARCH_DEBOUNCE_MS),
    [],
  );

  useEffect(() => {
    performSearch(query);
  }, [query, performSearch]);

  const onSelect = useCallback(
    (path: string) => {
      setOpen(false);
      router.push(path);
    },
    [router],
  );

  return (
    <>
      <Button
        variant="outline"
        className="relative h-12 w-full justify-start rounded-xl bg-slate-50 dark:bg-slate-900 border-none shadow-sm text-sm text-slate-500 md:w-64 lg:w-80 group transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4 opacity-50 group-hover:scale-110 transition-transform" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 hidden h-7 select-none items-center gap-1 rounded border bg-white dark:bg-slate-950 p-2 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs ">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a student name, staff, or action..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList className={SEARCH_MAX_HEIGHT_CLASS}>
          {isLoading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}

          {!isLoading && query.length < SEARCH_MIN_QUERY_LENGTH && (
            <CommandGroup heading="Top Actions">
              <ActionItem
                icon={UserPlus}
                title="Register Student"
                description="Add a new student to the system"
                onSelect={() => onSelect("/students/new")}
                colorClass="bg-blue-500/10 text-blue-600"
              />
              <ActionItem
                icon={UserPlus}
                title="Add Staff Member"
                description="Create a new employee record"
                onSelect={() => onSelect("/staff/new")}
                colorClass="bg-emerald-500/10 text-emerald-600"
              />
              <ActionItem
                icon={FileText}
                title="Create Invoice"
                description="Generate fee records for students"
                onSelect={() => onSelect("/finance/records")}
                colorClass="bg-indigo-500/10 text-indigo-600"
              />
              <ActionItem
                icon={CalendarCheck}
                title="Staff Attendance"
                description="Mark daily attendance for teachers"
                onSelect={() => onSelect("/attendance/staff")}
                colorClass="bg-amber-500/10 text-amber-600"
              />
              <ActionItem
                icon={DollarSign}
                title="Payroll Management"
                description="Generate and manage salary slips"
                onSelect={() => onSelect("/finance/payroll")}
                colorClass="bg-rose-500/10 text-rose-600"
              />
              <ActionItem
                icon={Users}
                title="User Management"
                description="Manage system users and roles"
                onSelect={() => onSelect("/users")}
                colorClass="bg-slate-500/10 text-slate-600"
              />
            </CommandGroup>
          )}

          {!isLoading &&
            query.length >= SEARCH_MIN_QUERY_LENGTH &&
            results.students.length === 0 &&
            results.staff.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-500">No results found.</div>
            )}

          {results.students.length > 0 && (
            <CommandGroup heading="Students">
              {results.students.map((student) => (
                <SearchResultItem
                  key={student.id}
                  icon={GraduationCap}
                  title={student.fullName}
                  subtitle={student.admissionNumber}
                  path={`/students/${student.id}`}
                  colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  onSelect={onSelect}
                  actions={[
                    {
                      label: "Pay Fees",
                      icon: Wallet,
                      path: `/finance/records?query=${student.fullName}`,
                      variant: "text-blue-600 hover:text-blue-700 hover:bg-blue-50",
                    },
                    {
                      label: "Profile",
                      icon: User,
                      path: `/students/${student.id}`,
                      variant: "text-slate-500 hover:text-slate-700",
                    },
                  ]}
                />
              ))}
            </CommandGroup>
          )}

          {results.staff.length > 0 && (
            <CommandGroup heading="Staff">
              {results.staff.map((staff) => (
                <SearchResultItem
                  key={staff.id}
                  icon={Briefcase}
                  title={staff.fullName}
                  subtitle={staff.designation || "Staff"}
                  path={`/staff/${staff.id}`}
                  colorClass="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                  onSelect={onSelect}
                  actions={[
                    {
                      label: "Attendance",
                      icon: CalendarCheck,
                      path: `/attendance/reports?query=${staff.fullName}`,
                      variant: "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50",
                    },
                    {
                      label: "Profile",
                      icon: User,
                      path: `/staff/${staff.id}`,
                      variant: "text-slate-500 hover:text-slate-700",
                    },
                  ]}
                />
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
