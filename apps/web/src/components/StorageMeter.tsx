import type { LucideIcon } from "lucide-react";
import { formatBytes } from "../utils/formatBytes";

interface StorageMeterProps {
  icon: LucideIcon;
  label: string;
  usedBytes: number;
  limitBytes: number;
  hint?: string;
}

/** Severity: <70% xotirjam, 70-90% ogohlantirish, >90% tanqidiy. */
function severityClass(percent: number): { fill: string; text: string } {
  if (percent >= 90) return { fill: "bg-destructive", text: "text-destructive" };
  if (percent >= 70) return { fill: "bg-promo", text: "text-promo-dark" };
  return { fill: "bg-success", text: "text-success" };
}

export function StorageMeter({ icon: Icon, label, usedBytes, limitBytes, hint }: StorageMeterProps) {
  const percent = limitBytes > 0 ? Math.min(100, (usedBytes / limitBytes) * 100) : 0;
  const { fill, text } = severityClass(percent);

  return (
    <div className="card flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Icon className="h-4 w-4 text-hint" />
          {label}
        </span>
        <span className={`text-sm font-bold ${text}`}>{percent.toFixed(1)}%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-secondary">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${fill}`}
          style={{ width: `${Math.max(percent, percent > 0 ? 2 : 0)}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-hint">
        <span>
          {formatBytes(usedBytes)} / {formatBytes(limitBytes)}
        </span>
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
