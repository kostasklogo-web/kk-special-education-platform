"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ComparedMetric, TrendDirection } from "@/lib/management/analytics/types";
import { formatEuro, formatPct } from "@/lib/management/analytics/labels";

export function TrendBadge({ trend, label }: { trend: TrendDirection; label: string }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const cls =
    trend === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : trend === "down"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-ink-muted bg-surface-muted border-border";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${cls}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

function formatPrevious(metric: ComparedMetric): string {
  if (metric.label.includes("Είσπραξη") || metric.formatted.includes("%")) {
    return formatPct(metric.comparison.previous);
  }
  return formatEuro(metric.comparison.previous);
}

export function ComparedKpiCard({
  metric,
  masked,
}: {
  metric: ComparedMetric;
  masked?: boolean;
}) {
  const { comparison } = metric;
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{metric.label}</p>
        <TrendBadge trend={comparison.trend} label={formatPct(comparison.deltaPct, true)} />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums tracking-tight text-ink">
        {masked ? "—" : metric.formatted}
      </p>
      <p className="mt-1 text-xs text-ink-muted">
        {masked ? "Διαθέσιμο στη διοίκηση" : metric.helper}
      </p>
      {!masked ? (
        <p className="mt-1 text-[10px] text-ink-muted tabular-nums">
          Σύγκριση: {formatPrevious(metric)}
        </p>
      ) : null}
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function ChartBlock({
  label,
  current,
  previous,
  max,
}: {
  label: string;
  current: number;
  previous: number;
  max: number;
}) {
  const curPct = max > 0 ? Math.round((current / max) * 100) : 0;
  const prevPct = max > 0 ? Math.round((previous / max) * 100) : 0;
  return (
    <div className="space-y-2 rounded-lg border border-border bg-white p-3">
      <div className="flex justify-between text-xs font-medium">
        <span>{label}</span>
        <span className="tabular-nums text-ink-muted">{formatEuro(current)}</span>
      </div>
      <div className="space-y-1">
        <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${curPct}%` }} />
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-surface-muted/60">
          <div className="h-full rounded-full bg-slate-300" style={{ width: `${prevPct}%` }} />
        </div>
      </div>
      <p className="text-[10px] text-ink-muted">Προηγ.: {formatEuro(previous)}</p>
    </div>
  );
}

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-surface-muted/60 text-xs font-semibold uppercase text-ink-muted">
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-3 py-2.5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-surface-muted/30">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
