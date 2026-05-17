import type { OpsAlertKind, OpsRiskLevel, OpsTrend } from "./types";

export const OPS_RISK_LABELS: Record<OpsRiskLevel, string> = {
  low: "Χαμηλός",
  medium: "Μέτριος",
  high: "Υψηλός",
  critical: "Κρίσιμος",
};

export const OPS_ALERT_KIND_LABELS: Record<OpsAlertKind, string> = {
  low_attendance: "Κίνδυνος χαμηλής προσέλευσης",
  therapist_overload: "Υπερφόρτωση θεραπευτή",
  revenue_decline: "Πτώση εσόδων",
  report_delay: "Κίνδυνος καθυστέρησης αναφορών",
  room_capacity: "Χωρητικότητα αιθουσών",
  parent_followup: "Follow-up γονέων",
  waiting_list: "Πίεση λίστας αναμονής",
  clinical_coordination: "Συντονισμός κλινικής ομάδας",
};

export const OPS_TREND_LABELS: Record<OpsTrend, string> = {
  up: "Ανοδική",
  down: "Πτωτική",
  flat: "Σταθερή",
};

export function riskBadgeClass(level: OpsRiskLevel): string {
  const map: Record<OpsRiskLevel, string> = {
    low: "border-emerald-200 bg-emerald-50 text-emerald-900",
    medium: "border-amber-200 bg-amber-50 text-amber-950",
    high: "border-orange-200 bg-orange-50 text-orange-950",
    critical: "border-red-300 bg-red-100 text-red-900",
  };
  return map[level];
}

export function scoreBarClass(score: number, max: number): string {
  const pct = max > 0 ? (score / max) * 100 : 0;
  if (pct >= 85) return "bg-emerald-500";
  if (pct >= 70) return "bg-amber-400";
  if (pct >= 55) return "bg-orange-500";
  return "bg-red-500";
}

export function formatScore(score: number, max = 100): string {
  return `${Math.round(score)}/${max}`;
}
