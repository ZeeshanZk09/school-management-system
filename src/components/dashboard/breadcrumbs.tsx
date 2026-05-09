"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export function Breadcrumbs({ labels = {} }: Readonly<{ labels?: Record<string, string> }>) {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean);

  // Skip breadcrumbs on main dashboard page
  if (paths.length <= 0) return null;

  return (
    <nav className="flex items-center space-x-1 text-xs font-medium text-slate-500 dark:text-slate-400">
      <Link
        href="/"
        className="flex items-center hover:text-primary transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join("/")}`;
        const isLast = index === paths.length - 1;
        const label =
          labels[path] ||
          path.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

        // Skip role identifiers in paths if they are parents
        if (path.startsWith("(") && path.endsWith(")")) return null;

        return (
          <div key={path} className="flex items-center space-x-1">
            <ChevronRight className="h-3.5 w-3.5 opacity-50" />
            {isLast ? (
              <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-[150px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-primary transition-colors truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
