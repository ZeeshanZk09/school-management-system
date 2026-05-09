import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Skeleton */}
      <Skeleton className="h-64 rounded-[2.5rem]" />

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-6 space-y-6">
          <Skeleton className="h-96 rounded-[2rem]" />
          <Skeleton className="h-64 rounded-[2rem]" />
        </div>
        <div className="lg:col-span-6">
          <Skeleton className="h-[40rem] rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
