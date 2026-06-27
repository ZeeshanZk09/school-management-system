import type * as React from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CalendarDays,
  Clock,
  DollarSign,
  KeyRound,
  LayoutDashboard,
  LineChart,
  Search,
  Settings,
  ShieldAlert,
  UserSquare2,
  Users,
  Wallet,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const navItems: NavGroup[] = [
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
