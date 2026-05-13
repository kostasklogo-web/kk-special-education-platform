import type { AttendanceListFilters } from "@/lib/data/attendance/types";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

export type AttendanceView = "day" | "list";

export type AttendancePageSearch = {
  view: AttendanceView;
  dateYmd: string;
  filters: AttendanceListFilters;
};

function firstString(v: string | string[] | undefined): string | undefined {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0) return v[0];
  return undefined;
}

const YMD = /^\d{4}-\d{2}-\d{2}$/;

export function parseAttendanceSearchParams(
  raw: Record<string, string | string[] | undefined>
): AttendancePageSearch {
  const viewRaw = firstString(raw.view);
  const view: AttendanceView = viewRaw === "list" ? "list" : "day";
  const dateParam = firstString(raw.date);
  const dateYmd = dateParam && YMD.test(dateParam) ? dateParam : todayAthensYmd();

  const filters: AttendanceListFilters = {
    centerId: firstString(raw.center) || null,
    therapistId: firstString(raw.therapist) || null,
    childId: firstString(raw.child) || null,
    attendanceStatus: firstString(raw.att_status) || null,
  };

  return { view, dateYmd, filters };
}

export function buildAttendanceHref(opts: {
  view: AttendanceView;
  dateYmd: string;
  filters?: AttendanceListFilters;
}): string {
  const p = new URLSearchParams();
  p.set("view", opts.view);
  p.set("date", opts.dateYmd);
  const f = opts.filters;
  if (f?.centerId) p.set("center", f.centerId);
  if (f?.therapistId) p.set("therapist", f.therapistId);
  if (f?.childId) p.set("child", f.childId);
  if (f?.attendanceStatus) p.set("att_status", f.attendanceStatus);
  const qs = p.toString();
  return qs ? `/attendance?${qs}` : "/attendance";
}
