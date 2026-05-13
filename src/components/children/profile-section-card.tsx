import type { ReactNode } from "react";

type ProfileSectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function ProfileSectionCard({
  title,
  description,
  children,
  footer,
}: ProfileSectionCardProps) {
  return (
    <section className="rounded-xl border border-border bg-surface-card p-6 shadow-shell">
      <header className="mb-4 border-b border-border pb-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      </header>
      <div className="text-sm text-ink-muted">{children}</div>
      {footer ? <footer className="mt-4 border-t border-border pt-3">{footer}</footer> : null}
    </section>
  );
}
