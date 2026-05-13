import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Short label above the title (e.g. module name) */
  eyebrow?: string;
  title: string;
  description?: string;
  /** Extra line under description (e.g. date, scope) */
  meta?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({ eyebrow, title, description, meta, actions }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 border-b border-border/80 pb-7 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clinical-700">{eyebrow}</p>
        ) : null}
        <h1
          className={[
            "font-semibold tracking-tight text-ink",
            eyebrow ? "mt-2 text-2xl sm:text-3xl" : "text-3xl",
          ].join(" ")}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
        {meta ? <div className="mt-3 text-xs text-ink-faint">{meta}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
