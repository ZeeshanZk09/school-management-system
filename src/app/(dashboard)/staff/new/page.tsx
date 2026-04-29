import { requirePermission } from "@/lib/auth/permissions";
import { StaffForm } from "../staff-form";

export default async function NewStaffPage() {
  await requirePermission("staff.manage");

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight font-outfit">
          Add New Staff Member
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Register a new employee and create their portal access account.
        </p>
      </div>

      <StaffForm />
    </div>
  );
}
