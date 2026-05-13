import type { TherapyGoalFilters } from "@/lib/data/therapy-goals/types";

export type TherapyGoalsPageSearch = {
  filters: TherapyGoalFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

export function parseTherapyGoalsSearchParams(
  raw: Record<string, string | string[] | undefined>
): TherapyGoalsPageSearch {
  const filters: TherapyGoalFilters = {
    childId: firstString(raw.child) || null,
    therapistId: firstString(raw.therapist) || null,
    disciplineCode: firstString(raw.discipline) || null,
    status: firstString(raw.status) || null,
    priority: firstString(raw.priority) || null,
  };
  return { filters };
}

export function buildTherapyGoalsHref(filters?: TherapyGoalFilters): string {
  const p = new URLSearchParams();
  const f = filters;
  if (f?.childId) p.set("child", f.childId);
  if (f?.therapistId) p.set("therapist", f.therapistId);
  if (f?.disciplineCode) p.set("discipline", f.disciplineCode);
  if (f?.status) p.set("status", f.status);
  if (f?.priority) p.set("priority", f.priority);
  const qs = p.toString();
  return qs ? `/therapy-goals?${qs}` : "/therapy-goals";
}
