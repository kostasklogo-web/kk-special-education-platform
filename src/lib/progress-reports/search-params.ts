import type { ProgressReportFilters } from "@/lib/data/progress-reports/types";

export type ReportsPageSearch = {
  filters: ProgressReportFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export function parseReportsSearchParams(
  raw: Record<string, string | string[] | undefined>
): ReportsPageSearch {
  const filters: ProgressReportFilters = {
    childId: firstString(raw.child) || null,
    status: firstString(raw.status) || null,
  };
  return { filters };
}

export function buildReportsHref(filters?: ProgressReportFilters): string {
  const p = new URLSearchParams();
  if (filters?.childId) p.set("child", filters.childId);
  if (filters?.status) p.set("status", filters.status);
  const qs = p.toString();
  return qs ? `/reports?${qs}` : "/reports";
}
