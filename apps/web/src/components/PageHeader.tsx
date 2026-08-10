import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
}

export function PageHeader({ title, subtitle, backTo }: PageHeaderProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="flex min-w-0 items-center gap-2.5">
        {backTo && <BackButton fallbackTo={backTo} />}
        <h1 className="truncate text-2xl font-bold tracking-tight text-ink">{title}</h1>
      </div>
      {subtitle && <p className="truncate text-sm text-hint">{subtitle}</p>}
    </div>
  );
}
