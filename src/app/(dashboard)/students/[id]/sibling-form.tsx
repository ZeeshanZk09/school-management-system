"use client";

import { Loader2, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { linkSiblings } from "../actions";

interface SearchResult {
  id: string;
  fullName: string;
  admissionNumber: string;
  currentClass?: string;
}

export function SiblingForm({
  studentId,
  children,
}: Readonly<{
  studentId: string;
  children: React.ReactNode;
}>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.length < 3) {
      toast.error("Please enter at least 3 characters");
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/students/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      // Filter out current student
      setResults(data.filter((s: SearchResult) => s.id !== studentId));
    } catch {
      toast.error("Failed to search students");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLink = (siblingId: string) => {
    startTransition(async () => {
      const result = await linkSiblings(studentId, siblingId);
      if (result.success) {
        toast.success("Siblings linked successfully");
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to link siblings");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] glass border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-outfit">Link Sibling</DialogTitle>
          <DialogDescription>
            Search for another student to link them as a sibling. They will share guardian
            information and fee records can be grouped.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or admission number..."
              className="pl-10 h-11 bg-slate-50/50 dark:bg-slate-900/50 border-none"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full gradient-primary shadow-lg"
            disabled={isSearching}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            Search Student
          </Button>
        </form>

        <div className="mt-6 space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {results.length === 0 && !isSearching && query.length >= 3 && (
            <p className="text-center text-sm text-slate-500 py-4">No students found.</p>
          )}

          {results.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col">
                <span className="text-sm font-bold">{student.fullName}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                  {student.admissionNumber} • {student.currentClass || "No Class"}
                </span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 rounded-full text-primary hover:bg-primary/10"
                disabled={isPending}
                onClick={() => handleLink(student.id)}
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
