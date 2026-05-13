import type { SessionFilters } from "@/lib/data/sessions/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

export type ScheduleView = "week" | "day" | "list";

export type SchedulePageSearch = {
  view: ScheduleView;
  dateYmd: string;
  filters: SessionFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function parseScheduleSearchParams(
  raw: Record<string, string | string[] | undefined>
): SchedulePageSearch {
  const viewRaw = firstString(raw.view);
  const view: ScheduleView =
    viewRaw === "day" || viewRaw === "list" ? viewRaw : "week";

  const dateParam = firstString(raw.date);
  const dateYmd = dateParam && YMD.test(dateParam) ? dateParam : todayAthensYmd();

  const filters: SessionFilters = {
    centerId: firstString(raw.center) || null,
    therapistId: firstString(raw.therapist) || null,
    childId: firstString(raw.child) || null,
    disciplineCode: firstString(raw.discipline) || null,
    roomId: firstString(raw.room) || null,
    status: firstString(raw.status) || null,
  };

  return { view, dateYmd, filters };
}

export function buildScheduleHref(opts: {
  view: ScheduleView;
  dateYmd: string;
  filters?: SessionFilters;
}): string {
  const p = new URLSearchParams();
  p.set("view", opts.view);
  p.set("date", opts.dateYmd);
  const f = opts.filters;
  if (f?.centerId) p.set("center", f.centerId);
  if (f?.therapistId) p.set("therapist", f.therapistId);
  if (f?.childId) p.set("child", f.childId);
  if (f?.disciplineCode) p.set("discipline", f.disciplineCode);
  if (f?.roomId) p.set("room", f.roomId);
  if (f?.status) p.set("status", f.status);
  const qs = p.toString();
  return qs ? `/schedule?${qs}` : "/schedule";
}
