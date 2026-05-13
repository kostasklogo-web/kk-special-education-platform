import Link from "next/link";
import {
  addDaysAthensCalendar,
  athensStartOfDayUtcIso,
  mondayOfAthensWeek,
} from "@/lib/schedule/athens-civil";
import type { SchedulePageSearch } from "@/lib/schedule/search-params";
import { buildScheduleHref } from "@/lib/schedule/search-params";

function labelWeekRange(monYmd: string, sunYmd: string): string {
  const fmt = (ymd: string) =>
    new Intl.DateTimeFormat("el-GR", {
      timeZone: "Europe/Athens",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(athensStartOfDayUtcIso(ymd)));
  return `${fmt(monYmd)} — ${fmt(sunYmd)}`;
}

export function ScheduleDateNav({ search }: { search: SchedulePageSearch }) {
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
            href={buildScheduleHref({ view, dateYmd: prev, filters })}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
          >
            Προηγούμενη ημέρα
          </Link>
          <Link
            href={buildScheduleHref({ view, dateYmd: next, filters })}
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
  const prevWeekAnchor = addDaysAthensCalendar(dateYmd, -7);
  const nextWeekAnchor = addDaysAthensCalendar(dateYmd, 7);

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="text-sm font-medium text-ink">{labelWeekRange(mon, sun)}</div>
      <div className="flex gap-2">
        <Link
          href={buildScheduleHref({ view, dateYmd: prevWeekAnchor, filters })}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
        >
          Προηγούμενη εβδομάδα
        </Link>
        <Link
          href={buildScheduleHref({ view, dateYmd: nextWeekAnchor, filters })}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
        >
          Επόμενη εβδομάδα
        </Link>
      </div>
    </div>
  );
}
