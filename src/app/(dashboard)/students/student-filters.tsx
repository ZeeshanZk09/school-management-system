"use client";

import { Filter } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterProps {
  classes: { id: string; name: string }[];
  sections: { id: string; name: string; classId: string }[];
  statuses: string[];
}

export function StudentFilters({
  classes,
  sections,
  statuses,
}: Readonly<FilterProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStatus = searchParams.get("status");
  const currentClassId = searchParams.get("classId");
  const currentSectionId = searchParams.get("sectionId");

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      // Reset page when filtering
      params.set("page", "1");
      return params.toString();
    },
    [searchParams],
  );

  const handleFilter = (name: string, value: string | null) => {
    router.push(`?${createQueryString(name, value)}`);
  };

  const clearFilters = () => {
    router.push("/students");
  };

  const activeFiltersCount = [
    currentStatus,
    currentClassId,
    currentSectionId,
  ].filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-10 relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-primary text-[10px]"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 glass border-none shadow-xl"
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Filter Students</span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 px-2 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50"
            >
              Clear All
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            Status
          </DropdownMenuLabel>
          {statuses.map((status) => (
            <DropdownMenuItem
              key={status}
              onClick={() =>
                handleFilter("status", currentStatus === status ? null : status)
              }
              className="flex items-center justify-between"
            >
              <span className="capitalize">
                {status.replace("_", " ").toLowerCase()}
              </span>
              {currentStatus === status && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
            Class
          </DropdownMenuLabel>
          <div className="max-h-48 overflow-y-auto">
            {classes.map((cls) => (
              <DropdownMenuItem
                key={cls.id}
                onClick={() =>
                  handleFilter(
                    "classId",
                    currentClassId === cls.id ? null : cls.id,
                  )
                }
                className="flex items-center justify-between"
              >
                <span>{cls.name}</span>
                {currentClassId === cls.id && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuGroup>

        {currentClassId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">
                Section
              </DropdownMenuLabel>
              <div className="max-h-48 overflow-y-auto">
                {sections
                  .filter((s) => s.classId === currentClassId)
                  .map((sec) => (
                    <DropdownMenuItem
                      key={sec.id}
                      onClick={() =>
                        handleFilter(
                          "sectionId",
                          currentSectionId === sec.id ? null : sec.id,
                        )
                      }
                      className="flex items-center justify-between"
                    >
                      <span>{sec.name}</span>
                      {currentSectionId === sec.id && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </DropdownMenuItem>
                  ))}
              </div>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
