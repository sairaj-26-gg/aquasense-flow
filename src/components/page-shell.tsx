import type { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground md:text-base">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function StatusDot({ status }: { status: "healthy" | "warning" | "critical" }) {
  const color =
    status === "healthy"
      ? "bg-[var(--color-health-good)]"
      : status === "warning"
        ? "bg-[var(--color-health-warn)]"
        : "bg-[var(--color-health-crit)]";
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className={`absolute inset-0 rounded-full ${color} opacity-60 blur-[2px]`} />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}
