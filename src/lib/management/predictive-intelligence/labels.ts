import type { PredictiveHorizon, PredictiveRiskLevel } from "./types";

export const PREDICTIVE_RISK_LABELS: Record<PredictiveRiskLevel, string> = {
  low: "Χαμηλός",
  medium: "Μέτριος",
  high: "Υψηλός",
  critical: "Κρίσιμος",
};

export const HORIZON_LABELS: Record<PredictiveHorizon, string> = {
  "7d": "7 ημέρες",
  "30d": "30 ημέρες",
  quarter: "Τρίμηνο",
  year: "Έτος",
};

export function riskBadgeClass(level: PredictiveRiskLevel): string {
  const map: Record<PredictiveRiskLevel, string> = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-900",
    medium: "border-amber-200 bg-amber-50 text-amber-950",
    high: "border-orange-200 bg-orange-50 text-orange-950",
    critical: "border-red-300 bg-red-100 text-red-900",
  };
  return map[level];
}

export function heatColor(score: number): string {
  if (score >= 75) return "bg-red-600 text-white";
  if (score >= 55) return "bg-orange-500 text-white";
  if (score >= 35) return "bg-amber-400 text-amber-950";
  return "bg-emerald-200 text-emerald-950";
}

export function formatEuro(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("el-GR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
}

export function formatPct(n: number, signed = false): string {
  const v = Number.isFinite(n) ? n : 0;
  return `${signed && v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}
