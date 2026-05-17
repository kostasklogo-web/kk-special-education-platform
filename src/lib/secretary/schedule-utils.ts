import {
  addDaysAthensCalendar,
  athensStartOfDayUtcIso,
  formatYmdAthensFromUtcMs,
  getSafeAthensYmd,
  mondayOfAthensWeek,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import type { SecretaryAppointment } from "./types";
import { matchesLocationFilter, type LocationFilter } from "./schedule-catalog";
import { SECRETARY_WORKING_HOUR_END, SECRETARY_WORKING_HOUR_START } from "./scheduling-rules";

const TZ = "Europe/Athens";

export type ScheduleViewMode = "day" | "week" | "month";

export type ScheduleFilterState = {
  view: ScheduleViewMode;
  dateYmd: string;
  location: LocationFilter;
  therapistId: string;
  roomId: string;
  childId: string;
  typeCode: string;
};

/** Ensures `dateYmd` is always a valid Athens civil day. */
export function normalizeScheduleFilters(filters: ScheduleFilterState): ScheduleFilterState {
  return {
    ...filters,
    dateYmd: getSafeAthensYmd(filters.dateYmd),
  };
}

export function defaultScheduleFilters(overrides?: Partial<ScheduleFilterState>): ScheduleFilterState {
  const base: ScheduleFilterState = {
    view: "day",
    dateYmd: todayAthensYmd(),
    location: "omilos",
    therapistId: "",
    roomId: "",
    childId: "",
    typeCode: "",
  };
  if (!overrides) return base;

  const view =
    overrides.view === "week" || overrides.view === "month" || overrides.view === "day"
      ? overrides.view
      : base.view;

  return {
    view,
    dateYmd: getSafeAthensYmd(overrides.dateYmd ?? base.dateYmd),
    location: overrides.location ?? base.location,
    therapistId: overrides.therapistId ?? base.therapistId,
    roomId: overrides.roomId ?? base.roomId,
    childId: overrides.childId ?? base.childId,
    typeCode: overrides.typeCode ?? base.typeCode,
  };
}

export function athensHourMinute(iso: string): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute };
}

export function appointmentYmdAthens(a: SecretaryAppointment): string {
  return formatYmdAthensFromUtcMs(Date.parse(a.startsAt));
}

function mondayOffsetFromYmd(ymd: string): number {
  const startMs = Date.parse(athensStartOfDayUtcIso(ymd));
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(new Date(startMs));
  const WD_MON0: Record<string, number> = { Sun: 6, Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5 };
  return WD_MON0[wd] ?? 0;
}

export function firstDayOfMonthYmd(anchorYmd: string): string {
  const safe = getSafeAthensYmd(anchorYmd);
  const [y, m] = safe.split("-");
  return `${y}-${m}-01`;
}

export function daysInMonthAthens(anchorYmd: string): number {
  const safe = getSafeAthensYmd(anchorYmd);
  const [y, m] = safe.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function monthDayYmds(anchorYmd: string): string[] {
  const first = firstDayOfMonthYmd(anchorYmd);
  const n = daysInMonthAthens(anchorYmd);
  return Array.from({ length: n }, (_, i) => addDaysAthensCalendar(first, i));
}

/** Calendar grid cells (42) including leading/trailing days for month view. */
export function monthCalendarCells(anchorYmd: string): { ymd: string; inMonth: boolean }[] {
  const first = firstDayOfMonthYmd(anchorYmd);
  const monthDays = monthDayYmds(anchorYmd);
  const padStart = mondayOffsetFromYmd(first);
  const cells: { ymd: string; inMonth: boolean }[] = [];
  for (let i = padStart; i > 0; i--) {
    cells.push({ ymd: addDaysAthensCalendar(first, -i), inMonth: false });
  }
  for (const ymd of monthDays) {
    cells.push({ ymd, inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const last = cells[cells.length - 1]?.ymd ?? first;
    cells.push({ ymd: addDaysAthensCalendar(last, 1), inMonth: false });
  }
  while (cells.length < 42) {
    const last = cells[cells.length - 1].ymd;
    cells.push({ ymd: addDaysAthensCalendar(last, 1), inMonth: false });
  }
  return cells;
}

export function formatMonthTitleEl(anchorYmd: string): string {
  const iso = athensStartOfDayUtcIso(firstDayOfMonthYmd(getSafeAthensYmd(anchorYmd)));
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function shiftAnchorYmd(anchorYmd: string, view: ScheduleViewMode, delta: number): string {
  const safe = getSafeAthensYmd(anchorYmd);
  if (view === "month") {
    const [y, m] = safe.split("-").map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1, 12, 0, 0));
    return formatYmdAthensFromUtcMs(d.getTime());
  }
  if (view === "week") return addDaysAthensCalendar(safe, delta * 7);
  return addDaysAthensCalendar(safe, delta);
}

export function filterAppointments(
  appointments: SecretaryAppointment[],
  filters: ScheduleFilterState
): SecretaryAppointment[] {
  const anchorYmd = getSafeAthensYmd(filters.dateYmd);
  let daySet: string[];
  if (filters.view === "month") {
    daySet = monthDayYmds(anchorYmd);
  } else if (filters.view === "week") {
    daySet = weekDayYmds(anchorYmd);
  } else {
    daySet = [anchorYmd];
  }

  return appointments.filter((a) => {
    const ymd = appointmentYmdAthens(a);
    if (!daySet.includes(ymd)) return false;
    if (!matchesLocationFilter(a.locationCode, filters.location)) return false;
    if (filters.therapistId && !a.staffIds.includes(filters.therapistId)) return false;
    if (filters.roomId && a.roomId !== filters.roomId) return false;
    if (filters.childId && a.childId !== filters.childId) return false;
    if (filters.typeCode && a.appointmentTypeCode !== filters.typeCode) return false;
    return true;
  });
}

export function weekDayYmds(anchorYmd: string): string[] {
  const mon = mondayOfAthensWeek(anchorYmd);
  return Array.from({ length: 7 }, (_, i) => addDaysAthensCalendar(mon, i));
}

export function sortAppointmentsByStart(a: SecretaryAppointment, b: SecretaryAppointment): number {
  return Date.parse(a.startsAt) - Date.parse(b.startsAt);
}

export function minutesFromWindowStart(iso: string): number {
  const { hour, minute } = athensHourMinute(iso);
  return Math.max(0, (hour - SECRETARY_WORKING_HOUR_START) * 60 + minute);
}

export function appointmentDurationMinutes(a: SecretaryAppointment): number {
  return Math.max(15, Math.round((Date.parse(a.endsAt) - Date.parse(a.startsAt)) / 60000));
}

export const SCHEDULE_SLOT_MINUTES = 30;
export const SCHEDULE_WINDOW_MINUTES = (SECRETARY_WORKING_HOUR_END - SECRETARY_WORKING_HOUR_START) * 60;

export function timeSlotLabels(): string[] {
  const out: string[] = [];
  for (let h = SECRETARY_WORKING_HOUR_START; h < SECRETARY_WORKING_HOUR_END; h++) {
    out.push(`${String(h).padStart(2, "0")}:00`);
    out.push(`${String(h).padStart(2, "0")}:30`);
  }
  return out;
}

export function formatWeekdayHeaderEl(ymd: string): string {
  const safe = getSafeAthensYmd(ymd);
  const iso = `${safe}T12:00:00.000Z`;
  const wd = new Intl.DateTimeFormat("el-GR", { timeZone: TZ, weekday: "short" }).format(new Date(iso));
  const day = new Intl.DateTimeFormat("el-GR", { timeZone: TZ, day: "numeric", month: "short" }).format(
    new Date(iso)
  );
  return `${wd} ${day}`;
}

export function isTodayAthens(ymd: string): boolean {
  return getSafeAthensYmd(ymd) === todayAthensYmd();
}

export function athensCivilToUtcIso(ymd: string, hour: number, minute: number): string {
  const safe = getSafeAthensYmd(ymd);
  const targetMin = hour * 60 + minute;
  let lo = Date.parse(athensStartOfDayUtcIso(safe));
  let hi = lo + 36 * 3_600_000;
  while (lo < hi - 30_000) {
    const mid = Math.floor((lo + hi) / 2);
    const { hour: h, minute: m } = athensHourMinute(new Date(mid).toISOString());
    const cur = h * 60 + m;
    if (cur < targetMin) lo = mid + 60_000;
    else hi = mid;
  }
  return new Date(lo).toISOString();
}

export function addMinutesToIso(iso: string, minutes: number): string {
  return new Date(Date.parse(iso) + minutes * 60_000).toISOString();
}
