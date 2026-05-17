"use client";

import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ExecutiveKpi, FinanceAlertLevel, ParentPaymentRisk, TrendDirection } from "@/lib/secretary/finances/types";
import { formatEuro, formatEuroPrecise, PARENT_RISK_LABELS } from "@/lib/secretary/finances/labels";
import type { LucideIcon } from "lucide-react";

export function BarRow({
  label,
  amount,
  max,
  sublabel,
  tone = "emerald",
}: {
  label: string;
  amount: number;
  max: number;
  sublabel?: string;
  tone?: "emerald" | "rose" | "indigo";
}) {
  const pct = max > 0 ? Math.round((amount / max) * 100) : 0;
  const bar =
    tone === "emerald" ? "bg-emerald-500" : tone === "indigo" ? "bg-indigo-500" : "bg-rose-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-xs">
        <span className="font-medium text-ink">
          {label}
          {sublabel ? <span className="ml-1 font-normal text-ink-muted">({sublabel})</span> : null}
        </span>
        <span className="tabular-nums text-ink-muted">{formatEuro(amount)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function TrendIndicator({ trend, label }: { trend: TrendDirection; label: string }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const cls =
    trend === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : trend === "down"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-ink-muted bg-surface-muted border-border";
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${cls}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}

export function ExecutiveKpiCard({
  kpi,
  masked,
}: {
  kpi: ExecutiveKpi;
  masked?: boolean;
}) {
  const toneClass =
    kpi.tone === "positive"
      ? "text-emerald-700"
      : kpi.tone === "negative"
        ? "text-red-700"
        : kpi.tone === "warning"
          ? "text-amber-800"
          : "text-ink";
  return (
    <div
      className={`rounded-xl border border-border bg-white p-4 shadow-sm ${masked ? "opacity-75" : ""}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{kpi.label}</p>
        <TrendIndicator trend={kpi.trend} label={kpi.trendLabel} />
      </div>
      <p className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${toneClass}`}>
        {masked ? "—" : kpi.formatted}
      </p>
      <p className="mt-1 text-xs leading-snug text-ink-muted">{kpi.helper}</p>
    </div>
  );
}

export function FinanceAlertBadge({ level }: { level: FinanceAlertLevel }) {
  const map = {
    critical: { label: "Κρίσιμο", cls: "border-red-300 bg-red-100 text-red-900" },
    warning: { label: "Προσοχή", cls: "border-amber-300 bg-amber-100 text-amber-950" },
    info: { label: "Ενημέρωση", cls: "border-sky-200 bg-sky-50 text-sky-900" },
  };
  const m = map[level];
  return (
    <span className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function RiskBadge({ risk }: { risk: ParentPaymentRisk }) {
  const styles: Record<ParentPaymentRisk, string> = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-900",
    medium: "border-amber-200 bg-amber-50 text-amber-950",
    high: "border-orange-200 bg-orange-50 text-orange-950",
    critical: "border-red-200 bg-red-50 text-red-900",
  };
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${styles[risk]}`}>
      {PARENT_RISK_LABELS[risk]}
    </span>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      {description ? <p className="mt-0.5 text-sm text-ink-muted">{description}</p> : null}
    </div>
  );
}

export function Panel({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl border border-border bg-white p-4 shadow-sm ${className}`}>
      {title ? <h3 className="mb-3 text-sm font-semibold text-ink">{title}</h3> : null}
      {children}
    </div>
  );
}

export function MetricStrip({
  items,
}: {
  items: { label: string; value: string; tone?: "good" | "bad" | "neutral" }[];
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border border-border bg-slate-50/80 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">{item.label}</p>
          <p
            className={`mt-1 text-lg font-bold tabular-nums ${
              item.tone === "good"
                ? "text-emerald-800"
                : item.tone === "bad"
                  ? "text-red-800"
                  : "text-ink"
            }`}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}

export function SimpleTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface-muted/60 text-xs font-semibold uppercase tracking-wide text-ink-muted">
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

export type { LucideIcon };
