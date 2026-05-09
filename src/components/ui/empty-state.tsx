import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("border-dashed border-2 bg-transparent shadow-none", className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900/50 mb-4">
          <Icon className="h-10 w-10 text-slate-300 dark:text-slate-700" />
        </div>
        <h3 className="text-lg font-black font-outfit tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-500 max-w-[250px]">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button
            onClick={onAction}
            variant="outline"
            className="mt-6 h-10 rounded-xl font-bold border-slate-200 dark:border-slate-800"
          >
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
