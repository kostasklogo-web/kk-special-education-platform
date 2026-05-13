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
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-muted/50 px-6 py-16 text-center"
      role="status"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-shell">
        <Icon className="h-6 w-6 text-ink-faint" aria-hidden />
      </div>
      <h2 className="text-base font-medium text-ink">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-ink-muted">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
