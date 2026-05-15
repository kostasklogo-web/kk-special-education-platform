/** Server-safe query parsing for `/schedule/control-center` (no "use client"). */

const YMD = /^\d{4}-\d{2}-\d{2}$/;

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

/** Returns `YYYY-MM-DD` when valid, otherwise `""`. Safe for Server Components (no `"use client"`). */
export function parseControlCenterDate(raw: Record<string, string | string[] | undefined>): string {
  const s = firstString(raw.date);
  if (s && YMD.test(s)) return s;
  return "";
}
