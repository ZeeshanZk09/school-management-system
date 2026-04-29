'use client';

import { debounce } from 'lodash';
import { Briefcase, GraduationCap, Loader2, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ students: any[]; staff: any[] }>({
    students: [],
    staff: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const search = useCallback(
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
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    search(query);
  }, [query, search]);

  const onSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='flex items-center gap-2 px-4 h-10 w-full max-w-[300px] rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all group'
      >
        <Search className='h-4 w-4 text-slate-400 group-hover:text-primary transition-colors' />
        <span className='text-sm text-slate-400 font-medium'>Search anything...</span>
        <kbd className='ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-white dark:bg-slate-800 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100'>
          <span className='text-xs'>⌘</span>K
        </kbd>
      </button>

      <CommandDialog className='min-w-sm min-h-[700px]' open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder='Search students (name/roll#) or staff...'
          onValueChange={setQuery}
        />
        <CommandList className='glass border-none'>
          <CommandEmpty>
            {isLoading ? (
              <div className='flex items-center justify-center py-6'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
              </div>
            ) : (
              'No results found.'
            )}
          </CommandEmpty>

          {results.students.length > 0 && (
            <CommandGroup heading='Students'>
              {results.students.map((student: any) => (
                <CommandItem
                  key={student.id}
                  onSelect={() => onSelect(`/students/${student.id}`)}
                  className='flex items-center gap-3 p-3 cursor-pointer'
                >
                  <div className='p-2 rounded-lg bg-blue-50 text-blue-600'>
                    <GraduationCap className='h-4 w-4' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{student.fullName}</span>
                    <span className='text-[10px] text-slate-500 uppercase tracking-widest'>
                      {student.admissionNumber}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {results.staff.length > 0 && (
            <CommandGroup heading='Staff'>
              {results.staff.map((staff: any) => (
                <CommandItem
                  key={staff.id}
                  onSelect={() => onSelect(`/staff/${staff.id}`)}
                  className='flex items-center gap-3 p-3 cursor-pointer'
                >
                  <div className='p-2 rounded-lg bg-emerald-50 text-emerald-600'>
                    <Briefcase className='h-4 w-4' />
                  </div>
                  <div className='flex flex-col'>
                    <span className='font-bold'>{staff.fullName}</span>
                    <span className='text-[10px] text-slate-500 uppercase tracking-widest'>
                      {staff.designation}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
