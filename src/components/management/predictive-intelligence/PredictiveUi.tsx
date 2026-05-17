"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import type { PredictiveRiskItem, PredictiveRiskLevel } from "@/lib/management/predictive-intelligence/types";
import {
  HORIZON_LABELS,
  PREDICTIVE_RISK_LABELS,
  heatColor,
  riskBadgeClass,
} from "@/lib/management/predictive-intelligence/labels";

export function RiskBadge({ level }: { level: PredictiveRiskLevel }) {
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${riskBadgeClass(level)}`}>
      {PREDICTIVE_RISK_LABELS[level]}
    </span>
  );
}

export function TrendPill({ trend }: { trend: PredictiveRiskItem["trendDirection"] }) {
  const map = {
    worsening: { Icon: ArrowDownRight, label: "Επιδείνωση", cls: "text-red-700 bg-red-50 border-red-200" },
    improving: { Icon: ArrowUpRight, label: "Βελτίωση", cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
    stable: { Icon: ArrowRight, label: "Σταθερό", cls: "text-ink-muted bg-surface-muted border-border" },
  };
  const m = map[trend];
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${m.cls}`}>
      <m.Icon className="h-3 w-3" aria-hidden />
      {m.label}
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

export function ForecastCurve({
  points,
  title,
}: {
  points: { label: string; predicted: number; baseline: number }[];
  title: string;
}) {
  const max = Math.max(...points.map((p) => Math.max(p.predicted, p.baseline)), 1);
  return (
    <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-ink-muted">{title}</p>
      <div className="mt-3 flex h-28 items-end gap-1">
        {points.map((p) => (
          <div key={p.label} className="flex flex-1 flex-col items-center gap-0.5">
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 80 }}>
              <div
                className="w-2 rounded-t bg-slate-300"
                style={{ height: `${Math.round((p.baseline / max) * 100)}%`, minHeight: 2 }}
                title={`Βaseline: ${p.baseline}`}
              />
              <div
                className="w-2 rounded-t bg-violet-600"
                style={{ height: `${Math.round((p.predicted / max) * 100)}%`, minHeight: 2 }}
                title={`Πρόβλεψη: ${p.predicted}`}
              />
            </div>
            <span className="text-[9px] text-ink-muted">{p.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-ink-muted">Γκρι = baseline · Μωβ = πρόβλεψη</p>
    </div>
  );
}

export function RiskCard({ item }: { item: PredictiveRiskItem }) {
  return (
    <article className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase text-ink-muted">{item.predictionLabel}</p>
          <p className="mt-1 text-base font-semibold text-ink">{item.subjectLabel}</p>
        </div>
        <RiskBadge level={item.riskLevel} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <TrendPill trend={item.trendDirection} />
        <span className="text-[10px] text-ink-muted">{HORIZON_LABELS[item.horizon]}</span>
        <span className="text-[10px] tabular-nums text-ink-muted">
          Score {item.score}/{item.maxScore} · εμπιστοσύνη {item.confidencePct}%
        </span>
      </div>
      <ul className="mt-3 space-y-1">
        {item.factors.filter((f) => f.present).map((f) => (
          <li key={f.code} className="text-xs text-ink-muted">
            • {f.label} <span className="text-ink-muted/70">(βάρος {f.weight})</span>
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-lg bg-surface-muted/50 p-3 text-xs">
        <p className="font-semibold text-ink">Προτεινόμενες ενέργειες</p>
        <p className="mt-1 text-ink-muted"><strong>Διοίκηση:</strong> {item.actions.management}</p>
        <p className="text-ink-muted"><strong>Πρόγραμμα:</strong> {item.actions.scheduling}</p>
        <p className="text-ink-muted"><strong>Εποπτεία:</strong> {item.actions.supervision}</p>
        <p className="text-ink-muted"><strong>Γονέας:</strong> {item.actions.parentFollowUp}</p>
      </div>
    </article>
  );
}

export function PredictiveHeatmap({
  rows,
}: {
  rows: { label: string; cells: { period: string; score: number }[] }[];
}) {
  const periods = rows[0]?.cells.map((c) => c.period) ?? [];
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-white p-4 shadow-sm">
      <p className="mb-3 text-xs font-bold uppercase text-ink-muted">Risk heatmap (πρόβλεψη έντασης κινδύνου)</p>
      <table className="w-full text-center text-xs">
        <thead>
          <tr>
            <th className="p-2 text-left" />
            {periods.map((p) => (
              <th key={p} className="p-2 font-medium text-ink-muted">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td className="p-2 text-left font-medium">{row.label}</td>
              {row.cells.map((c) => (
                <td key={c.period} className="p-1">
                  <div className={`rounded px-2 py-2 font-bold tabular-nums ${heatColor(c.score)}`}>{c.score}</div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
