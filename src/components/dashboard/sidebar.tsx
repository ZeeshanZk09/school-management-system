"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  ChevronLeft,
  Clock,
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

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

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
        title: "Attendance",
        href: "/attendance",
        icon: Calendar,
        roles: ["ADMIN", "TEACHER"],
      },
      {
        title: "Leave Requests",
        href: "/leave",
        icon: Clock,
        roles: ["ADMIN"],
      },
      {
        title: "Billing",
        href: "/finance/records",
        icon: Wallet,
        roles: ["ADMIN"],
      },
      {
        title: "Fee Setup",
        href: "/finance/fee-structures",
        icon: Settings,
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
  const lastGroupTitle = navItems.at(-1)?.title;

  const isSelected = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  // Close sidebar on navigation (mobile)
  React.useEffect(() => {
    closeSidebar();
  }, [pathname, closeSidebar]);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-white dark:bg-slate-950 transition-all duration-300 ease-in-out border-r glass",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72",
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-6">
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
              {settings.schoolName}
            </span>
          </Link>

          {/* Logo when collapsed */}
          {isCollapsed && (
            <div className="hidden lg:flex absolute left-1/2 top-4 -translate-x-1/2 p-1.5 gradient-primary rounded-lg shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={closeSidebar}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Collapse toggle (Desktop) */}
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
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-6 py-4">
            {navItems.map((group) => {
              const filteredItems = group.items.filter(
                (item) =>
                  !item.roles ||
                  item.roles.some((role) => userRoles.includes(role)),
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={group.title} className="px-3">
                  {!isCollapsed && (
                    <h3 className="mb-2 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                      {group.title}
                    </h3>
                  )}
                  {isCollapsed && (
                    <div className="flex justify-center mb-2">
                      <Separator className="w-4" />
                    </div>
                  )}
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <Button
                        key={item.href}
                        asChild
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-11 transition-all duration-200 rounded-xl px-3",
                          isSelected(item.href)
                            ? "bg-primary/10 text-primary shadow-none border-none font-bold"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white",
                          isCollapsed && "lg:justify-center lg:px-0",
                          !isCollapsed &&
                            "hover:bg-slate-100 dark:hover:bg-slate-900/50 ",
                        )}
                      >
                        <Link
                          href={item.href}
                          title={isCollapsed ? item.title : undefined}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isSelected(item.href)
                                ? "text-primary"
                                : "text-slate-400 dark:text-slate-500",
                            )}
                          />
                          {!isCollapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {!isCollapsed && (
          <div className="p-6 mt-auto animate-in fade-in slide-in-from-bottom-2">
            <div className="rounded-2xl p-5 gradient-primary text-white shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <GraduationCap className="h-16 w-16 -mr-4 -mt-4" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">
                Academic Year
              </p>
              <p className="text-sm font-black truncate">
                {activeAcademicYear?.name ?? "No active session"}
              </p>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="p-4 mt-auto flex justify-center">
            <div className="h-10 w-10 gradient-primary rounded-xl flex items-center justify-center text-white shadow-lg">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
        )}
      </aside>

      {/* Spacer for desktop layout to prevent content overlap */}
      <div
        className={cn(
          "hidden lg:block transition-all duration-300 ease-in-out flex-shrink-0",
          isCollapsed ? "w-20" : "w-72",
        )}
      />
    </>
  );
}
