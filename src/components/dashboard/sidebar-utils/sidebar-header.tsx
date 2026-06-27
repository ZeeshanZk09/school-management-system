"use client";

import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SidebarHeaderProps {
  schoolName: string;
  isCollapsed: boolean;
}

export const SidebarHeader = React.memo(({ schoolName, isCollapsed }: SidebarHeaderProps) => (
  <div className="flex h-16 items-center justify-between px-6 relative">
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-bold text-xl tracking-tight overflow-hidden transition-all duration-300",
        isCollapsed && "lg:opacity-0 lg:w-0",
      )}
    >
      <div className="p-1.5 gradient-primary rounded-lg shadow-sm shrink-0">
        <GraduationCap className="h-5 w-5 text-white" />
      </div>
      <span className="bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 font-outfit truncate">
        {schoolName}
      </span>
    </Link>

    <AnimatePresence>
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="hidden lg:flex absolute left-1/2 top-4 -translate-x-1/2 p-1.5 gradient-primary rounded-lg shadow-sm"
        >
          <GraduationCap className="h-5 w-5 text-white" />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
));

SidebarHeader.displayName = "SidebarHeader";
