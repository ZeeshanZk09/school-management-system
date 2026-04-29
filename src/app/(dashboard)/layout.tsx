import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { getActiveAcademicYear } from "@/lib/academic-year";
import { getCurrentUser } from "@/lib/auth/permissions";
import { getSystemSettings } from "@/lib/settings";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, settings, activeAcademicYear] = await Promise.all([
    getCurrentUser(),
    getSystemSettings(),
    getActiveAcademicYear(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardSidebar
        userRoles={user.roles}
        settings={settings}
        activeAcademicYear={activeAcademicYear}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          user={{ fullName: user.fullName, email: user.email }}
          settings={settings}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
