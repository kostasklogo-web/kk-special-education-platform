import { athensStartOfDayUtcIso, todayAthensYmd } from "@/lib/schedule/athens-civil";

/** Operational window 13:00–21:00 local Athens (8 ώρες) — πρωτότυπο control-center. */
export function athensOperationalWindowMs(ymd: string): { startMs: number; endMs: number; durationMs: number } {
  const dayStartMs = Date.parse(athensStartOfDayUtcIso(ymd));
  const base = Number.isFinite(dayStartMs) ? dayStartMs : Date.parse(athensStartOfDayUtcIso(todayAthensYmd()));
  const startMs = base + 13 * 60 * 60 * 1000;
  const endMs = startMs + 8 * 60 * 60 * 1000;
  return { startMs, endMs, durationMs: endMs - startMs };
}

export function clampIntervalToWindow(
  startMs: number,
  endMs: number,
  win: { startMs: number; endMs: number }
): { startMs: number; endMs: number } | null {
  const s = Math.max(startMs, win.startMs);
  const e = Math.min(endMs, win.endMs);
  if (e <= s) return null;
  return { startMs: s, endMs: e };
}

export function intervalOverlap(a: { startMs: number; endMs: number }, b: { startMs: number; endMs: number }): boolean {
  return a.startMs < b.endMs && b.startMs < a.endMs;
}
