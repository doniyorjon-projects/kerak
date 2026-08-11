import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-divider py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-secondary">
        <Icon className="h-6 w-6 text-hint" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-ink">{title}</span>
        {description && <span className="max-w-[220px] text-xs text-hint">{description}</span>}
      </div>
      {action}
    </div>
  );
}
