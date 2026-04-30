"use client";

import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClassForm } from "./class-form";

interface ClassActionsProps {
  cls: {
    id: string;
    name: string;
    code: string | null;
  };
}

export function ClassActions({ cls }: Readonly<ClassActionsProps>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <ClassForm initialData={cls}>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            Edit Class
          </DropdownMenuItem>
        </ClassForm>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-rose-600 focus:bg-rose-50">
          Delete Class
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
