/** Europe/Athens civil calendar helpers (no extra deps). Used for week/day boundaries and grouping. */

const TZ = "Europe/Athens";

export function formatYmdAthensFromUtcMs(ms: number): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(ms));
}

/** First instant (UTC) where Athens civil date equals `ymd` (YYYY-MM-DD). */
export function athensStartOfDayUtcIso(ymd: string): string {
  const [y, m, d] = ymd.split("-").map(Number);
  let lo = Date.UTC(y, m - 1, d - 2, 0, 0, 0);
  let hi = Date.UTC(y, m - 1, d + 2, 0, 0, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const cy = formatYmdAthensFromUtcMs(mid);
    if (cy < ymd) lo = mid + 1;
    else hi = mid;
  }
  return new Date(lo).toISOString();
}

/** Last instant (UTC) still on Athens civil date `ymd`. */
export function athensEndOfDayUtcIso(ymd: string): string {
  const nextYmd = addDaysAthensCalendar(ymd, 1);
  const startNextMs = Date.parse(athensStartOfDayUtcIso(nextYmd));
  return new Date(startNextMs - 1).toISOString();
}

const WD_MON0: Record<string, number> = {
  Sun: 6,
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
};

function mondayOffsetFromYmd(ymd: string): number {
  const startMs = Date.parse(athensStartOfDayUtcIso(ymd));
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
  }).format(new Date(startMs));
  return WD_MON0[wd] ?? 0;
}

/** Monday YYYY-MM-DD (Athens) of the week containing `ymd`. */
export function mondayOfAthensWeek(ymd: string): string {
  const n = mondayOffsetFromYmd(ymd);
  return addDaysAthensCalendar(ymd, -n);
}

/** Add signed calendar days in Athens by anchoring at noon UTC on the civil YMD. */
export function addDaysAthensCalendar(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const utc = Date.UTC(y, m - 1, d + delta, 12, 0, 0);
  return formatYmdAthensFromUtcMs(utc);
}

export function todayAthensYmd(now = new Date()): string {
  return formatYmdAthensFromUtcMs(now.getTime());
}

export function formatAthensDateTimeEl(iso: string): string {
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: TZ,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatAthensTimeEl(iso: string): string {
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: TZ,
    timeStyle: "short",
  }).format(new Date(iso));
}

export function formatAthensWeekdayShortEl(iso: string): string {
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: TZ,
    weekday: "short",
  }).format(new Date(iso));
}

/** Long Greek date for Athens civil `ymd` (YYYY-MM-DD), e.g. dashboard headings. */
export function formatAthensLongDateFromYmd(ymd: string): string {
  const iso = athensStartOfDayUtcIso(ymd);
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
