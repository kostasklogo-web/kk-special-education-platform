import type { HrKpiStatus, HrRiskLevel, HrTrend } from "./types";

export const HR_RISK_LABELS: Record<HrRiskLevel, string> = {
  low: "Χαμηλός",
  medium: "Μέτριος",
  high: "Υψηλός",
  critical: "Κρίσιμος",
};

export const HR_TREND_LABELS: Record<HrTrend, string> = {
  up: "Βελτίωση",
  down: "Πτώση",
  flat: "Σταθερό",
};

export const HR_KPI_STATUS_LABELS: Record<HrKpiStatus, string> = {
  strong: "Ισχυρό",
  on_track: "Εντός στόχου",
  attention: "Προσοχή",
  critical: "Κρίσιμο",
};

export function riskBadgeClass(level: HrRiskLevel): string {
  switch (level) {
    case "low":
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
    case "medium":
      return "bg-amber-50 text-amber-900 border-amber-200";
    case "high":
      return "bg-orange-50 text-orange-900 border-orange-200";
    case "critical":
      return "bg-red-50 text-red-900 border-red-200";
  }
}

export function kpiStatusClass(status: HrKpiStatus): string {
  switch (status) {
    case "strong":
      return "bg-emerald-50 text-emerald-800";
    case "on_track":
      return "bg-sky-50 text-sky-900";
    case "attention":
      return "bg-amber-50 text-amber-900";
    case "critical":
      return "bg-red-50 text-red-900";
  }
}

export function scoreBarClass(score: number, max = 100): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 85) return "bg-emerald-500";
  if (pct >= 70) return "bg-sky-500";
  if (pct >= 55) return "bg-amber-500";
  return "bg-red-500";
}

export function formatPct(n: number): string {
  return `${n.toFixed(0)}%`;
}
