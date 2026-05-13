import type { SessionNoteFilters } from "@/lib/data/session-notes/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

export type SessionNotesPageSearch = {
  dateYmd: string;
  filters: SessionNoteFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function parseSessionNotesSearchParams(
  raw: Record<string, string | string[] | undefined>
): SessionNotesPageSearch {
  const dateParam = firstString(raw.date);
  const dateYmd = dateParam && YMD.test(dateParam) ? dateParam : todayAthensYmd();

  const filters: SessionNoteFilters = {
    childId: firstString(raw.child) || null,
    therapistId: firstString(raw.therapist) || null,
    disciplineCode: firstString(raw.discipline) || null,
  };

  return { dateYmd, filters };
}

export function buildSessionNotesHref(opts: { dateYmd: string; filters?: SessionNoteFilters }): string {
  const p = new URLSearchParams();
  p.set("date", opts.dateYmd);
  const f = opts.filters;
  if (f?.childId) p.set("child", f.childId);
  if (f?.therapistId) p.set("therapist", f.therapistId);
  if (f?.disciplineCode) p.set("discipline", f.disciplineCode);
  const qs = p.toString();
  return qs ? `/session-notes?${qs}` : "/session-notes";
}
