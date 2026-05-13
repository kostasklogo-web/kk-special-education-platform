import Link from "next/link";
import type { AttendanceSessionRow, AttendanceStatus } from "@/lib/data/attendance/types";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import { attendanceStatusLabelEl } from "@/lib/ui/attendance-labels";
import { sessionKindLabelEl, sessionStatusLabelEl } from "@/lib/ui/session-labels";
import { sessionStatusStripeClass } from "@/lib/ui/session-visual";

function attendancePillCompact(status: string): string {
  if (status === "present" || status === "made_up") return "bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100";
  if (status === "expected") return "bg-clinical-50 text-clinical-900 ring-1 ring-inset ring-clinical-100";
  if (status === "to_makeup") return "bg-amber-50 text-amber-900 ring-1 ring-inset ring-amber-200";
  if (status === "absent") return "bg-red-50 text-red-800 ring-1 ring-inset ring-red-100";
  if (status?.startsWith("cancel_")) return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";
  return "bg-surface-muted text-ink-muted ring-1 ring-inset ring-border";
}

export function DashboardTodaySessionRow({ session }: { session: AttendanceSessionRow }) {
  const att = session.attendance?.status ?? "expected";
  const pending = !session.attendance || session.attendance.status === "expected";

  return (
    <div
      className={[
        "grid gap-3 border-b border-border px-4 py-3.5 transition last:border-b-0 sm:px-5 md:grid-cols-[6.5rem_1fr_auto] md:items-center",
        "bg-white/40 hover:bg-clinical-50/30",
        sessionStatusStripeClass(session.status),
      ].join(" ")}
    >
      <div className="text-sm font-semibold tabular-nums text-ink">
        {formatAthensTimeEl(session.starts_at)}
        <span className="block text-xs font-normal text-ink-muted">{formatAthensTimeEl(session.ends_at)}</span>
      </div>
      <div className="min-w-0">
        <Link href={`/schedule/${session.id}`} className="truncate font-medium text-ink hover:text-clinical-800 hover:underline">
          {session.child_name}
        </Link>
        <p className="mt-1 truncate text-sm text-ink-muted">
          {session.therapist_name ?? "Χωρίς ανάθεση"} · {session.discipline_name_el ?? session.discipline_code}
          {session.room_name ? ` · ${session.room_name}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="inline-flex rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-clinical-800 ring-1 ring-clinical-100">
            {sessionKindLabelEl(session.session_kind)}
          </span>
          <span className="inline-flex rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-ink-muted ring-1 ring-border">
            {sessionStatusLabelEl(session.status)}
          </span>
          <span className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-semibold ${attendancePillCompact(att)}`}>
            Παρουσία: {attendanceStatusLabelEl(att as AttendanceStatus)}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {pending && session.status !== "cancelled" ? (
          <Link
            href={`/attendance/${session.id}/edit`}
            className="inline-flex min-h-[2.5rem] min-w-[2.5rem] items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 sm:px-4"
          >
            Παρουσία
          </Link>
        ) : null}
        <Link
          href={`/schedule/${session.id}`}
          className="inline-flex min-h-[2.5rem] items-center justify-center rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Λεπτομέρειες
        </Link>
      </div>
    </div>
  );
}
