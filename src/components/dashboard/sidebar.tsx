"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronLeft,
  Clock,
  DollarSign,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LineChart,
  Menu,
  Search,
  Settings,
  ShieldAlert,
  UserSquare2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

// ============ TYPES ============
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

// ============ CONSTANTS ============
const navItems: NavGroup[] = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/", icon: LayoutDashboard },
      { title: "Announcements", href: "/announcements", icon: Bell },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Students",
        href: "/students",
        icon: Users,
        roles: ["ADMIN", "TEACHER"],
      },
      { title: "Staff", href: "/staff", icon: UserSquare2, roles: ["ADMIN"] },
      {
        title: "Classes",
        href: "/classes",
        icon: BookOpen,
        roles: ["ADMIN", "TEACHER"],
      },
      {
        title: "Academic Year",
        href: "/academic-years",
        icon: CalendarDays,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Student Attendance",
        href: "/attendance",
        icon: Calendar,
        roles: ["ADMIN", "TEACHER"],
      },
      {
        title: "Staff Attendance",
        href: "/attendance/staff",
        icon: CalendarDays,
        roles: ["ADMIN"],
      },
      {
        title: "Leave Requests",
        href: "/leave",
        icon: Clock,
        roles: ["ADMIN"],
      },
      {
        title: "Directory",
        href: "/directory",
        icon: Search,
        roles: ["ADMIN", "TEACHER", "PARENT", "STUDENT"],
      },
    ],
  },
  {
    title: "Financials",
    items: [
      {
        title: "Billing",
        href: "/finance/records",
        icon: Wallet,
        roles: ["ADMIN"],
      },
      {
        title: "Payroll",
        href: "/finance/payroll",
        icon: DollarSign,
        roles: ["ADMIN"],
      },
      {
        title: "Fee Setup",
        href: "/finance/fee-structures",
        icon: Settings,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Attendance Reports",
        href: "/attendance/reports",
        icon: BarChart3,
        roles: ["ADMIN", "TEACHER"],
      },
      {
        title: "Finance Reports",
        href: "/finance/reports",
        icon: LineChart,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Audit Trail",
        href: "/audit-logs",
        icon: ShieldAlert,
        roles: ["ADMIN"],
      },
      {
        title: "User Management",
        href: "/users",
        icon: Users,
        roles: ["ADMIN"],
      },
      {
        title: "Password Requests",
        href: "/password-requests",
        icon: KeyRound,
        roles: ["ADMIN"],
      },
      {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        roles: ["ADMIN"],
      },
    ],
  },
];

// ============ SUB-COMPONENTS ============

/**
 * Sidebar header with school logo and name.
 */
const SidebarHeader = React.memo(({ 
  schoolName, 
  isCollapsed 
}: { 
  schoolName: string; 
  isCollapsed: boolean;
}) => (
  <div className="flex h-16 items-center justify-between px-6 relative">
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 font-bold text-xl tracking-tight overflow-hidden transition-all duration-300",
        isCollapsed && "lg:opacity-0 lg:w-0",
      )}
    >
      <div className="p-1.5 gradient-primary rounded-lg shadow-sm flex-shrink-0">
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

/**
 * Individual navigation item.
 */
const SidebarItem = React.memo(({
  item,
  isActive,
  isCollapsed
}: {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
}) => (
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
    <Link
      href={item.href}
      title={isCollapsed ? item.title : undefined}
    >
      <item.icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-transform duration-200",
          isActive
            ? "text-primary scale-110"
            : "text-slate-400 dark:text-slate-500",
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

  const isSelected = React.useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }, [pathname]);

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
        <SidebarHeader 
          schoolName={settings.schoolName} 
          isCollapsed={isCollapsed} 
        />

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-3">
            <div className="space-y-6 py-4">
              <LayoutGroup>
                {navItems.map((group) => {
                  const filteredItems = group.items.filter(
                    (item) =>
                      !item.roles ||
                      item.roles.some((role) => userRoles.includes(role)),
                  );

                  if (filteredItems.length === 0) return null;

                  const isGroupActive = filteredItems.some((item) =>
                    isSelected(item.href),
                  );

                  return (
                    <div key={group.title} className="px-3">
                      <AnimatePresence mode="wait">
                        {!isCollapsed ? (
                          <button
                            onClick={() => {
                              const el = document.getElementById(
                                `group-${group.title}`,
                              );
                              if (el) {
                                el.style.display =
                                  el.style.display === "none" ? "block" : "none";
                              }
                            }}
                            className="w-full flex items-center justify-between mb-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 hover:text-slate-600 transition-colors"
                          >
                            <span>{group.title}</span>
                          </button>
                        ) : (
                          <motion.div
                            key="sep"
                            initial={{ opacity: 0, scaleX: 0 }}
                            animate={{ opacity: 1, scaleX: 1 }}
                            exit={{ opacity: 0, scaleX: 0 }}
                            className="flex justify-center mb-2"
                          >
                            <Separator className="w-4" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div
                        id={`group-${group.title}`}
                        className="space-y-1"
                        style={{
                          display: isCollapsed && !isOpen ? "block" : "block",
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
            className={cn(
              "h-4 w-4 transition-transform duration-300",
              isCollapsed && "rotate-180",
            )}
          />
        </Button>

        {/* Footer Info */}
        <div className="mt-auto p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {!isCollapsed ? (
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
            ) : (
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
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Spacer for desktop layout */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 ease-in-out flex-shrink-0",
          isCollapsed ? "w-20" : "w-72",
        )}
      />
    </>
  );
}
