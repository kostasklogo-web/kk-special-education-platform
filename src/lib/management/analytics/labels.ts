import type { AnalyticsPeriodKind, CompareMode } from "./types";

export const PERIOD_KIND_LABELS: Record<AnalyticsPeriodKind, string> = {
  day: "Ημέρα",
  week: "Εβδομάδα",
  month: "Μήνας",
  year: "Έτος",
  custom: "Προσαρμοσμένο εύρος",
};

export const COMPARE_MODE_LABELS: Record<CompareMode, string> = {
  previous_period: "Προηγούμενη περίοδος",
  same_period_last_month: "Ίδια περίοδος προηγ. μήνα",
  same_period_last_year: "Ίδια περίοδος προηγ. έτους",
  selected_period: "Επιλεγμένη περίοδος",
};

export const CENTER_FILTER_LABELS: Record<string, string> = {
  all: "Όλα τα κέντρα",
  nikaia: "Νίκαια",
  evosmos: "Εύοσμος",
};

export function formatEuro(amount: number): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatPct(value: number, signed = false): string {
  const n = Number.isFinite(value) ? value : 0;
  const prefix = signed && n > 0 ? "+" : "";
  return `${prefix}${n.toFixed(1)}%`;
}
