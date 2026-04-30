"use client";

import { Loader2, Settings2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { deleteFeeComponent, deleteFeeStructure } from "./actions";

export function DeleteFeeComponentButton({ id }: Readonly<{ id: string }>) {
  const [isPending, setIsPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this fee component?")) return;
    setIsPending(true);
    const result = await deleteFeeComponent(id);
    if (result.success) {
      toast.success("Fee component deleted successfully");
    } else {
      toast.error(result.message || "Failed to delete component");
    }
    setIsPending(false);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
    </Button>
  );
}

export function FeeStructureActions({ id }: Readonly<{ id: string }>) {
  const [isPending, setIsPending] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this fee structure? This will also hide its components.",
      )
    )
      return;
    setIsPending(true);
    const result = await deleteFeeStructure(id);
    if (result.success) {
      toast.success("Fee structure deleted successfully");
    } else {
      toast.error(result.message || "Failed to delete fee structure");
    }
    setIsPending(false);
  };

  if (!isMounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
        <Settings2 className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
          <Settings2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={"w-full"}>
        <DropdownMenuItem
          className="text-rose-600 focus:bg-rose-50 focus:text-rose-700 cursor-pointer"
          onClick={handleDelete}
          disabled={isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Structure
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
