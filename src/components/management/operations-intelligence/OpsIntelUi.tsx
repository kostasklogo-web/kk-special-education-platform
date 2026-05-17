"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { OpsHealthScore, OpsRiskLevel, OpsTrend } from "@/lib/management/operations-intelligence/types";
import {
  OPS_RISK_LABELS,
  OPS_TREND_LABELS,
  formatScore,
  riskBadgeClass,
  scoreBarClass,
} from "@/lib/management/operations-intelligence/labels";

export function RiskBadge({ level }: { level: OpsRiskLevel }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadgeClass(level)}`}>
      {OPS_RISK_LABELS[level]}
    </span>
  );
}

export function TrendBadge({ trend }: { trend: OpsTrend }) {
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
      {OPS_TREND_LABELS[trend]}
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

export function HealthScoreCard({ score }: { score: OpsHealthScore }) {
  const pct = score.maxScore > 0 ? Math.round((score.score / score.maxScore) * 100) : 0;
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">{score.label}</p>
        <RiskBadge level={score.riskLevel} />
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums text-ink">{formatScore(score.score, score.maxScore)}</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full ${scoreBarClass(score.score, score.maxScore)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <TrendBadge trend={score.trend} />
        <span className="text-[10px] tabular-nums text-ink-muted">{score.trendLabel}</span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">{score.helper}</p>
    </div>
  );
}

export function KpiCard({
  label,
  value,
  helper,
  risk,
}: {
  label: string;
  value: string;
  helper?: string;
  risk?: OpsRiskLevel;
}) {
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-bold uppercase text-ink-muted">{label}</p>
        {risk ? <RiskBadge level={risk} /> : null}
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums text-ink">{value}</p>
      {helper ? <p className="mt-1 text-xs text-ink-muted">{helper}</p> : null}
    </div>
  );
}

export function OccupancyStrip({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="tabular-nums text-ink-muted">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
        <div
          className={`h-full rounded-full ${pct >= 90 ? "bg-red-500" : pct >= 75 ? "bg-amber-400" : "bg-emerald-500"}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
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
      <table className="w-full min-w-[720px] text-left text-sm">
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

export function TrendMiniChart({ points, label }: { points: { label: string; value: number }[]; label: string }) {
  const max = Math.max(...points.map((p) => p.value), 1);
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-ink-muted">{label}</p>
      <div className="mt-3 flex h-24 items-end gap-1">
        {points.map((p) => (
          <div key={p.label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t bg-indigo-500/80"
              style={{ height: `${Math.round((p.value / max) * 100)}%`, minHeight: 4 }}
              title={`${p.label}: ${p.value}`}
            />
            <span className="text-[9px] text-ink-muted">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OccupancyHeatmap({
  cells,
}: {
  cells: { day: string; hour: string; intensity: number; label: string }[];
}) {
  const days = [...new Set(cells.map((c) => c.day))];
  const hours = [...new Set(cells.map((c) => c.hour))];
  const cellMap = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c]));

  function heatColor(intensity: number): string {
    if (intensity >= 90) return "bg-red-600 text-white";
    if (intensity >= 75) return "bg-orange-500 text-white";
    if (intensity >= 55) return "bg-amber-400 text-amber-950";
    if (intensity >= 35) return "bg-emerald-300 text-emerald-950";
    return "bg-slate-100 text-slate-600";
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-bold uppercase text-ink-muted">Heatmap πληρότητας (ώρα × ημέρα)</p>
      <table className="text-center text-[10px]">
        <thead>
          <tr>
            <th className="p-1" />
            {hours.map((h) => (
              <th key={h} className="p-1 font-medium text-ink-muted">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day) => (
            <tr key={day}>
              <td className="p-1 font-medium text-ink-muted">{day}</td>
              {hours.map((hour) => {
                const c = cellMap.get(`${day}-${hour}`);
                const intensity = c?.intensity ?? 0;
                return (
                  <td key={hour} className="p-0.5">
                    <div
                      className={`rounded px-1 py-2 font-semibold tabular-nums ${heatColor(intensity)}`}
                      title={c?.label}
                    >
                      {intensity}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
