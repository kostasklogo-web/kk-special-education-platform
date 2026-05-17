/** Server-safe query parsing for `/schedule/control-center` (no "use client"). */

import { getSafeAthensYmd, isValidAthensYmd } from "@/lib/schedule/athens-civil";

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

/** Returns `YYYY-MM-DD` when valid, otherwise `""` (caller should fall back to today). */
export function parseControlCenterDate(raw: Record<string, string | string[] | undefined>): string {
  const s = firstString(raw.date);
  if (isValidAthensYmd(s)) return s!.trim();
  return "";
}

/** Parsed query date or today Athens — safe for page props. */
export function resolveControlCenterPageDate(raw: Record<string, string | string[] | undefined>): string {
  const parsed = parseControlCenterDate(raw);
  return parsed ? parsed : getSafeAthensYmd();
}
