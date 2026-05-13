import type { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
};

export function DashboardCard({
  title,
  subtitle,
  children,
  className = "",
}: DashboardCardProps) {
  return (
    <div
      className={`flex flex-col rounded-xl border border-border bg-surface-card p-5 shadow-shell ${className}`}
    >
      <div className="mb-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {subtitle ? <p className="mt-1 text-xs text-ink-muted">{subtitle}</p> : null}
      </div>
      <div className="flex-1 text-sm text-ink-muted">{children}</div>
    </div>
  );
}
