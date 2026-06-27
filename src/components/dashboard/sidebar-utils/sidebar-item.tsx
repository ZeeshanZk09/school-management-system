"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem } from "./constants";

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarItem = React.memo(({ item, isActive, isCollapsed }: SidebarItemProps) => (
  <Button
    asChild
    variant="ghost"
    className={cn(
      "w-full justify-start gap-3 h-11 transition-all duration-200 rounded-xl px-3",
      isActive
        ? "bg-primary/10 text-primary shadow-none border-none font-bold"
        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
      isCollapsed && "lg:justify-center lg:px-0",
      !isCollapsed && "hover:bg-slate-100 dark:hover:bg-slate-900/50 ",
    )}
  >
    <Link href={item.href} title={isCollapsed ? item.title : undefined}>
      <item.icon
        className={cn(
          "h-5 w-5 shrink-0 transition-transform duration-200",
          isActive ? "text-primary scale-110" : "text-slate-400 dark:text-slate-500",
        )}
      />
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="truncate"
        >
          {item.title}
        </motion.span>
      )}
    </Link>
  </Button>
));

SidebarItem.displayName = "SidebarItem";
