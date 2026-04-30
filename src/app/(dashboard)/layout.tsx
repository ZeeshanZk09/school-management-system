import { redirect } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { SidebarProvider } from '@/components/dashboard/sidebar-context';
import { getActiveAcademicYear } from '@/lib/academic-year';
import { getCurrentUser } from '@/lib/auth/permissions';
import { getSystemSettings } from '@/lib/settings';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, settings, activeAcademicYear] = await Promise.all([
    getCurrentUser(),
    getSystemSettings(),
    getActiveAcademicYear(),
  ]);

  if (!user) {
    redirect('/login');
  }

  return (
    <SidebarProvider>
      <div className='flex min-h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden'>
        <DashboardSidebar
          userRoles={user.roles}
          settings={settings}
          activeAcademicYear={activeAcademicYear}
        />
        <div className='flex flex-1 flex-col transition-all duration-300 min-w-0'>
          <DashboardHeader
            user={{ fullName: user.fullName, email: user.email }}
            settings={settings}
          />
          <main className='flex-1 p-4 lg:p-8'>
            <div className='mx-auto max-w-7xl'>{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
