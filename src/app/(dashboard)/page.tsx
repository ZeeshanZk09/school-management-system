import { AlertCircle } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { requireAuth } from "@/lib/auth/permissions";
import {
  getAdminDashboardData,
  getTeacherDashboardData,
  getAccountantDashboardData,
  getCommonDashboardData,
} from "@/lib/dashboard-data";
import {
  AdminDashboard,
  TeacherDashboard,
  AccountantDashboard,
  GenericDashboard,
} from "@/components/dashboard/views";

export default async function DashboardPage() {
  const user = await requireAuth();
  const isAdmin = user.roles.includes("ADMIN");
  const isTeacher = user.roles.includes("TEACHER");
  const isAccountant = user.roles.includes("ACCOUNTANT");

  // Get common data for all roles
  const commonData = await getCommonDashboardData();

  // ==================== ADMIN DASHBOARD ====================
  if (isAdmin) {
    const adminData = await getAdminDashboardData();
    return <AdminDashboard user={user} adminData={adminData} commonData={commonData} />;
  }

  // ==================== TEACHER DASHBOARD ====================
  if (isTeacher) {
    const staff = await prisma.staff.findUnique({
      where: { userId: user.id },
    });

    if (!staff) {
      return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Card className="border-none bg-white shadow-sm dark:bg-slate-900">
            <CardContent className="p-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-amber-500" />
              <p className="text-slate-600 dark:text-slate-400 font-semibold">
                Staff profile not found. Please contact administrator.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    const teacherData = await getTeacherDashboardData(staff.id);
    return <TeacherDashboard user={user} teacherData={teacherData} commonData={commonData} />;
  }

  // ==================== ACCOUNTANT DASHBOARD ====================
  if (isAccountant) {
    const accountantData = await getAccountantDashboardData();
    return <AccountantDashboard user={user} accountantData={accountantData} />;
  }

  // ==================== FALLBACK: Generic Dashboard ====================
  return <GenericDashboard user={user} commonData={commonData} />;
}
