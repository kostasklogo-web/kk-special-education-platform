import Link from "next/link";
import type { DashboardKpi } from "@/lib/secretary/types";
import { AlertBadge } from "./AlertBadge";

export function KpiGrid({ kpis }: { kpis: DashboardKpi[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {kpis.map((k) => {
        const inner = (
          <>
            <div className="flex items-start justify-between gap-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{k.label}</p>
              <AlertBadge level={k.alertLevel} />
            </div>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">{k.value}</p>
            <p className="mt-0.5 text-xs text-ink-faint">{k.helper}</p>
          </>
        );
        const cls =
          "rounded-lg border border-border bg-surface-card p-3 shadow-sm transition hover:border-clinical-300 hover:shadow";
        return k.href ? (
          <Link key={k.id} href={k.href} className={cls}>
            {inner}
          </Link>
        ) : (
          <div key={k.id} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
