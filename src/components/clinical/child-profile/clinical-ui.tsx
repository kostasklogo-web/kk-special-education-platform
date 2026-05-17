import type { ReactNode } from "react";

export function ClinicalPanel({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-clinical-100/80 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-sm font-bold text-ink">{title}</h3>
          {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function ClinicalEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-lg border border-dashed border-border bg-surface-muted/20 px-4 py-6 text-center text-sm text-ink-muted">
      {children}
    </p>
  );
}

export function ClinicalProgressBar({ percent, label }: { percent: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div>
      {label ? (
        <div className="mb-1 flex justify-between text-[10px] font-semibold text-ink-muted">
          <span>{label}</span>
          <span className="tabular-nums">{clamped}%</span>
        </div>
      ) : null}
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className="h-full rounded-full bg-clinical-600 transition-all"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

export function ClinicalBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "clinical" | "warning" | "success" | "violet";
}) {
  const tones = {
    neutral: "bg-surface-muted text-ink-muted",
    clinical: "bg-clinical-50 text-clinical-800 border-clinical-100",
    warning: "bg-amber-50 text-amber-900 border-amber-100",
    success: "bg-emerald-50 text-emerald-900 border-emerald-100",
    violet: "bg-violet-50 text-violet-900 border-violet-100",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export const ROLE_LABELS_EL = {
  therapist: "Θεραπευτής",
  supervisor: "Επόπτης",
  director: "Κλινικός διευθυντής",
} as const;
