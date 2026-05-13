import Link from "next/link";
import type { AttendancePageSearch } from "@/lib/attendance/search-params";
import { buildAttendanceHref } from "@/lib/attendance/search-params";

function tabClass(active: boolean): string {
  return [
    "inline-flex rounded-t-lg px-4 py-2 text-sm font-medium transition",
    active
      ? "border border-b-0 border-border bg-surface-card text-ink"
      : "border border-transparent text-ink-muted hover:text-ink",
  ].join(" ");
}

export function AttendanceViewTabs({ search }: { search: AttendancePageSearch }) {
  const base = { dateYmd: search.dateYmd, filters: search.filters };
  return (
    <nav className="mb-4 flex flex-wrap gap-1 border-b border-border" aria-label="Προβολή παρουσιολογίου">
      <Link href={buildAttendanceHref({ ...base, view: "day" })} className={tabClass(search.view === "day")}>
        Ημερήσια
      </Link>
      <Link href={buildAttendanceHref({ ...base, view: "list" })} className={tabClass(search.view === "list")}>
        Λίστα (εβδομάδα)
      </Link>
    </nav>
  );
}
