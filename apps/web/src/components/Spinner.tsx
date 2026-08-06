import { Loader2 } from "lucide-react";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-hint">
      <Loader2 className="h-6 w-6 animate-spin" strokeWidth={2} />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
