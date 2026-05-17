import type { CompareMode, MetricComparison, TrendDirection } from "./types";

export function compareValues(current: number, previous: number): MetricComparison {
  const delta = Math.round((current - previous) * 100) / 100;
  const deltaPct =
    previous !== 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : current > 0 ? 100 : 0;
  let trend: TrendDirection = "flat";
  if (deltaPct > 0.5) trend = "up";
  else if (deltaPct < -0.5) trend = "down";
  return { current, previous, delta, deltaPct, trend };
}

export function compareIndex(
  currentIndex: number,
  length: number,
  mode: CompareMode
): number {
  if (length <= 0) return 0;
  switch (mode) {
    case "previous_period":
      return Math.max(0, currentIndex - 1);
    case "same_period_last_month":
      return Math.max(0, currentIndex - 1);
    case "same_period_last_year":
      if (length >= 12) return Math.max(0, currentIndex - 12);
      return Math.max(0, currentIndex - 1);
    case "selected_period":
      return Math.max(0, currentIndex - 2);
    default:
      return Math.max(0, currentIndex - 1);
  }
}

export function scaleSnapshot<T extends Record<string, number>>(
  base: T,
  factor: number
): T {
  const out = { ...base };
  for (const k of Object.keys(out) as (keyof T)[]) {
    const v = out[k];
    if (typeof v === "number") {
      (out as Record<string, number>)[k as string] = Math.round(v * factor);
    }
  }
  return out;
}
