import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Construction } from "lucide-react";

export type SecretaryFeatureCard = {
  title: string;
  description: string;
  href?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  status?: "planned" | "preview" | "live";
};

type Props = {
  title: string;
  description: string;
  features: SecretaryFeatureCard[];
  children?: ReactNode;
};

export function SecretaryFeatureHub({ title, description, features, children }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-clinical-100 bg-gradient-to-br from-clinical-50/80 via-white to-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <Construction className="mt-0.5 h-5 w-5 shrink-0 text-clinical-700" aria-hidden />
          <div>
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <p className="mt-1 text-sm text-ink-muted">{description}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {features.map((f) => {
          const Icon = f.icon;
          const statusLabel =
            f.status === "live" ? "Έτοιμο" : f.status === "preview" ? "Προεπισκόπηση" : "Σχεδίαση";
          const statusCls =
            f.status === "live"
              ? "bg-emerald-100 text-emerald-900"
              : f.status === "preview"
                ? "bg-sky-100 text-sky-900"
                : "bg-zinc-100 text-zinc-700";

          return (
            <article
              key={f.title}
              className="flex flex-col rounded-xl border border-border bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  {Icon ? <Icon className="mt-0.5 h-4 w-4 text-clinical-700" aria-hidden /> : null}
                  <h3 className="font-bold text-ink">{f.title}</h3>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${statusCls}`}>
                  {statusLabel}
                </span>
              </div>
              <p className="mt-2 flex-1 text-sm text-ink-muted">{f.description}</p>
              {f.href ? (
                <Link
                  href={f.href}
                  className="mt-3 inline-flex min-h-[40px] items-center gap-1 text-sm font-semibold text-clinical-700 hover:text-clinical-900"
                >
                  {f.actionLabel ?? "Άνοιγμα"}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              ) : (
                <span className="mt-3 text-xs text-ink-faint">Σύντομα διαθέσιμο</span>
              )}
            </article>
          );
        })}
      </div>

      {children ? (
        <div className="rounded-xl border border-dashed border-border bg-surface-muted/30 p-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Τρέχουσα προεπισκόπηση
          </p>
          {children}
        </div>
      ) : null}
    </div>
  );
}
