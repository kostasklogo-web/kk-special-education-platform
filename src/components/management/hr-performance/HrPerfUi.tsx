"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Award, Minus, TrendingUp } from "lucide-react";
import type { HrKpiStatus, HrRiskLevel, HrScoreDimension, HrTherapistKpi, HrTrend } from "@/lib/management/hr-performance/types";
import {
  HR_KPI_STATUS_LABELS,
  HR_RISK_LABELS,
  HR_TREND_LABELS,
  formatPct,
  kpiStatusClass,
  riskBadgeClass,
  scoreBarClass,
} from "@/lib/management/hr-performance/labels";

export function RiskBadge({ level }: { level: HrRiskLevel }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadgeClass(level)}`}>
      {HR_RISK_LABELS[level]}
    </span>
  );
}

export function TrendBadge({ trend }: { trend: HrTrend }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  const cls =
    trend === "up"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : trend === "down"
        ? "text-red-700 bg-red-50 border-red-200"
        : "text-ink-muted bg-surface-muted border-border";
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${cls}`}>
      <Icon className="h-3 w-3" aria-hidden />
      {HR_TREND_LABELS[trend]}
    </span>
  );
}

export function KpiStatusBadge({ status }: { status: HrKpiStatus }) {
  return (
    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${kpiStatusClass(status)}`}>
      {HR_KPI_STATUS_LABELS[status]}
    </span>
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

export function KpiCard({ kpi }: { kpi: HrTherapistKpi }) {
  const display =
    kpi.unit === "%"
      ? formatPct(kpi.value)
      : kpi.unit === "hours"
        ? `${kpi.value}ω`
        : kpi.unit === "days"
          ? `${kpi.value}η`
          : String(kpi.value);

  return (
    <div className="rounded-xl border border-border bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted leading-tight">{kpi.labelEl}</p>
        <KpiStatusBadge status={kpi.status} />
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums text-ink">{display}</p>
      <div className="mt-2 flex items-center justify-between gap-1">
        <TrendBadge trend={kpi.trend} />
        <span className="text-[10px] text-ink-muted">{kpi.trendLabel}</span>
      </div>
      {kpi.helper ? <p className="mt-1 text-[11px] text-ink-muted">{kpi.helper}</p> : null}
    </div>
  );
}

export function ScoreDimensionCard({ dim }: { dim: HrScoreDimension }) {
  const pct = dim.maxScore > 0 ? Math.round((dim.score / dim.maxScore) * 100) : 0;
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-ink">{dim.labelEl}</p>
          <p className="text-[10px] text-ink-muted">Βάρος {dim.weightPct}%</p>
        </div>
        <RiskBadge level={dim.riskLevel} />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{dim.score}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div className={`h-full rounded-full ${scoreBarClass(dim.score, dim.maxScore)}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-ink-muted">{dim.helper}</p>
    </div>
  );
}

export function AchievementBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-900">
      <Award className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}

export function GrowthIndicator({ label, positive }: { label: string; positive?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${positive ? "text-emerald-700" : "text-amber-800"}`}
    >
      <TrendingUp className={`h-3.5 w-3.5 ${positive ? "" : "rotate-180"}`} aria-hidden />
      {label}
    </span>
  );
}

export function WarningAlert({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm">
      <p className="font-semibold text-red-900">{title}</p>
      <p className="mt-0.5 text-red-800/90">{detail}</p>
    </div>
  );
}
