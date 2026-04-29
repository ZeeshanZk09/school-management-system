"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  GraduationCap,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  ShieldAlert,
  UserSquare2,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

const navItems = [
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
      { title: "Students", href: "/students", icon: Users },
      { title: "Staff", href: "/staff", icon: UserSquare2 },
      { title: "Classes", href: "/classes", icon: BookOpen },
      { title: "Academic Year", href: "/academic-years", icon: CalendarDays },
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
      { title: "Billing", href: "/finance/records", icon: Wallet },
      { title: "Fee Setup", href: "/finance/fee-structures", icon: Settings },
      { title: "Directory", href: "/directory", icon: Search },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        title: "Attendance Reports",
        href: "/attendance/reports",
        icon: BarChart3,
      },
      { title: "Finance Reports", href: "/finance/reports", icon: LineChart },
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
}: {
  userRoles: string[];
  settings: { schoolName: string };
  activeAcademicYear?: { name: string } | null;
}) {
  const pathname = usePathname();
  const lastGroupTitle = navItems[navItems.length - 1]?.title;

  const isSelected = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden border-r bg-slate-50/50 dark:bg-slate-950/50 lg:block lg:w-72 glass">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-16 items-center px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <div className="p-1.5 gradient-primary rounded-lg shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 font-outfit">
              {settings.schoolName}
            </span>
          </Link>
        </div>

        <ScrollArea className="flex-1 px-4">
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
                  <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {group.title}
                  </h3>
                  <div className="space-y-1">
                    {filteredItems.map((item) => (
                      <Button
                        key={item.href}
                        asChild
                        variant="ghost"
                        className={cn(
                          "w-full justify-start gap-3 h-10 transition-all duration-200",
                          isSelected(item.href)
                            ? "bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 font-medium"
                            : "text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-white",
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex gap-2 items-center"
                        >
                          <item.icon
                            className={cn(
                              "h-4 w-4",
                              isSelected(item.href)
                                ? "text-primary"
                                : "text-slate-400 dark:text-slate-500",
                            )}
                          />
                          {item.title}
                        </Link>
                      </Button>
                    ))}
                  </div>
                  {group.title !== lastGroupTitle && (
                    <Separator className="mt-4 opacity-50" />
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="p-6 mt-auto">
          <div className="rounded-xl p-4 gradient-primary text-white shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <GraduationCap className="h-16 w-16 -mr-4 -mt-4" />
            </div>
            <p className="text-xs font-medium opacity-80 mb-1">
              Current Session
            </p>
            <p className="text-sm font-bold truncate">
              {activeAcademicYear?.name ?? "No active academic year"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
