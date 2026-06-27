"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { ChevronLeft, Calendar, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

import { useSidebar } from "./sidebar-context";
import { SidebarHeader, navItems, SidebarItem } from "./sidebar-utils";

/**
 * Main Sidebar component for the Dashboard.
 * Handles role-based navigation, collapse states, and mobile responsiveness.
 */
export function DashboardSidebar({
  userRoles,
  settings,
  activeAcademicYear,
}: Readonly<{
  userRoles: string[];
  settings: { schoolName: string };
  activeAcademicYear?: { name: string } | null;
}>) {
  const pathname = usePathname();
  const { isOpen, isCollapsed, toggleCollapse, closeSidebar } = useSidebar();

  const isSelected = React.useCallback(
    (href: string) => {
      if (href === "/") return pathname === "/";
      return pathname === href;
    },
    [pathname],
  );

  // Close sidebar on navigation (mobile only)
  React.useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out border-r shadow-premium dark-card-border",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72",
        )}
      >
        <SidebarHeader schoolName={settings.schoolName} isCollapsed={isCollapsed} />

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-3">
            <div className="space-y-6 py-4">
              <LayoutGroup>
                {navItems.map((group) => {
                  const filteredItems = group.items.filter(
                    (item) => !item.roles || item.roles.some((role) => userRoles.includes(role)),
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={group.title} className="px-3">
                      <AnimatePresence mode="wait">
                        {isCollapsed ? (
                          <motion.div
                            key="sep"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0 }}
                            className="flex justify-center mb-2"
                          >
                            <Separator className="w-4" />
                          </motion.div>
                        ) : (
                          <button
                            onClick={() => {
                              const el = document.getElementById(`group-${group.title}`);
                              if (el) {
                                el.style.display = el.style.display === "none" ? "block" : "none";
                              }
                            }}
                            className="w-full flex items-center justify-between mb-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                          >
                            <span>{group.title}</span>
                          </button>
                        )}
                      </AnimatePresence>
                      <div
                        id={`group-${group.title}`}
                        className="space-y-1"
                        style={{
                          display: isCollapsed && isOpen ? "block" : "none",
                        }}
                      >
                        {filteredItems.map((item) => (
                          <SidebarItem
                            key={item.href}
                            item={item}
                            isActive={isSelected(item.href)}
                            isCollapsed={isCollapsed}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </LayoutGroup>
            </div>
          </ScrollArea>
        </div>

        {/* Desktop Collapse Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border bg-white dark:bg-slate-900 shadow-sm z-50"
          onClick={toggleCollapse}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform duration-300", isCollapsed && "rotate-180")}
          />
        </Button>

        {/* Footer Info */}
        <div className="mt-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {isCollapsed ? (
              <motion.div
                key="mini"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex justify-center"
              >
                <div className="h-10 w-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Calendar className="h-5 w-5" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="rounded-2xl p-5 gradient-primary text-white shadow-xl overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <GraduationCap className="h-16 w-16 -mr-4 -mt-4" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                  Academic Year
                </p>
                <p className="text-sm font-black truncate">
                  {activeAcademicYear?.name ?? "No active session"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 ease-in-out shrink-0",
          isCollapsed ? "w-20" : "w-72",
        )}
      />
    </>
  );
}
