import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  action,
}: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/90 bg-gradient-to-b from-surface-muted/40 to-surface-card px-6 py-16 text-center"
      role="status"
    >
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-clinical-100 bg-white shadow-shell">
        <Icon className="h-6 w-6 text-clinical-700/70" aria-hidden />
      </div>
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-muted">{description}</p>
      {action ? <div className="mt-7">{action}</div> : null}
    </div>
  );
}
