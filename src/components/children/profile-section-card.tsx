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
    <section className="rounded-2xl border border-border bg-surface-card p-6 shadow-shell sm:p-7">
      <header className="mb-5 border-b border-border pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
        {description ? <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p> : null}
      </header>
      <div className="text-sm leading-relaxed text-ink">{children}</div>
      {footer ? <footer className="mt-4 border-t border-border pt-3">{footer}</footer> : null}
    </section>
  );
}
