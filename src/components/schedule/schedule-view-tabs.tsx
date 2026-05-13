import Link from "next/link";
import type { SchedulePageSearch } from "@/lib/schedule/search-params";
import { buildScheduleHref } from "@/lib/schedule/search-params";

function tabClass(active: boolean): string {
  return [
    "inline-flex rounded-t-lg px-4 py-2 text-sm font-medium transition",
    active
      ? "border border-b-0 border-border bg-surface-card text-ink"
      : "border border-transparent text-ink-muted hover:text-ink",
  ].join(" ");
}

export function ScheduleViewTabs({ search }: { search: SchedulePageSearch }) {
  const base = { dateYmd: search.dateYmd, filters: search.filters };
  return (
    <nav className="mb-4 flex flex-wrap gap-1 border-b border-border" aria-label="Προβολή προγράμματος">
      <Link href={buildScheduleHref({ ...base, view: "week" })} className={tabClass(search.view === "week")}>
        Εβδομαδιαία
      </Link>
      <Link href={buildScheduleHref({ ...base, view: "day" })} className={tabClass(search.view === "day")}>
        Ημερήσια
      </Link>
      <Link href={buildScheduleHref({ ...base, view: "list" })} className={tabClass(search.view === "list")}>
        Λίστα
      </Link>
    </nav>
  );
}
