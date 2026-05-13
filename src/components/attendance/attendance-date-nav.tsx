import Link from "next/link";
import {
  addDaysAthensCalendar,
  athensStartOfDayUtcIso,
  mondayOfAthensWeek,
} from "@/lib/schedule/athens-civil";
import type { AttendancePageSearch } from "@/lib/attendance/search-params";
import { buildAttendanceHref } from "@/lib/attendance/search-params";

export function AttendanceDateNav({ search }: { search: AttendancePageSearch }) {
  const filters = search.filters;
  const { view, dateYmd } = search;

  if (view === "day") {
    const prev = addDaysAthensCalendar(dateYmd, -1);
    const next = addDaysAthensCalendar(dateYmd, 1);
    const label = new Intl.DateTimeFormat("el-GR", {
      timeZone: "Europe/Athens",
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(athensStartOfDayUtcIso(dateYmd)));

    return (
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-medium capitalize text-ink">{label}</div>
        <div className="flex gap-2">
          <Link
            href={buildAttendanceHref({ view, dateYmd: prev, filters })}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
          >
            Προηγούμενη ημέρα
          </Link>
          <Link
            href={buildAttendanceHref({ view, dateYmd: next, filters })}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
          >
            Επόμενη ημέρα
          </Link>
        </div>
      </div>
    );
  }

  const mon = mondayOfAthensWeek(dateYmd);
  const sun = addDaysAthensCalendar(mon, 6);
  const label = `${new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(athensStartOfDayUtcIso(mon)))} — ${new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(athensStartOfDayUtcIso(sun)))}`;

  const prevWeek = addDaysAthensCalendar(dateYmd, -7);
  const nextWeek = addDaysAthensCalendar(dateYmd, 7);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm font-medium text-ink">{label}</div>
      <div className="flex gap-2">
        <Link
          href={buildAttendanceHref({ view, dateYmd: prevWeek, filters })}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
        >
          Προηγούμενη εβδομάδα
        </Link>
        <Link
          href={buildAttendanceHref({ view, dateYmd: nextWeek, filters })}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
        >
          Επόμενη εβδομάδα
        </Link>
      </div>
    </div>
  );
}
