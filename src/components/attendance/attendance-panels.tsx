import Link from "next/link";
import type { AttendanceSessionRow } from "@/lib/data/attendance/types";
import { formatAthensTimeEl, formatYmdAthensFromUtcMs } from "@/lib/schedule/athens-civil";
import { EmptyState } from "@/components/shell/EmptyState";
import { attendanceStatusLabelEl } from "@/lib/ui/attendance-labels";
import { sessionStatusLabelEl } from "@/lib/ui/session-labels";

function attendancePillClass(status: string): string {
  if (status === "present" || status === "made_up") return "bg-emerald-50 text-emerald-800 border-emerald-100";
  if (status === "expected") return "bg-clinical-50 text-clinical-900 border-clinical-100";
  if (status === "absent") return "bg-red-50 text-red-800 border-red-100";
  if (status === "to_makeup") return "bg-amber-50 text-amber-900 border-amber-100";
  if (status?.startsWith("cancel_")) return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-surface-muted text-ink-muted border-border";
}

function AttendanceRowActions({ row, canRecord }: { row: AttendanceSessionRow; canRecord: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <Link
        href={`/attendance/${row.id}`}
        className="inline-flex min-h-[36px] min-w-[36px] items-center rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-clinical-700 hover:border-clinical-100 hover:bg-clinical-50/60"
      >
        Προβολή
      </Link>
      {canRecord ? (
        <Link
          href={`/attendance/${row.id}/edit`}
          className="inline-flex min-h-[36px] items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700"
        >
          Καταχώρηση
        </Link>
      ) : null}
      <Link
        href={`/schedule/${row.id}`}
        className="inline-flex min-h-[36px] items-center rounded-lg border border-border bg-white px-2 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-muted"
      >
        Πρόγραμμα
      </Link>
    </div>
  );
}

export function AttendanceDayPanel({
  items,
  dayYmd,
  canRecordForSession,
}: {
  items: AttendanceSessionRow[];
  dayYmd: string;
  canRecordForSession: (therapistUserId: string) => boolean;
}) {
  const dayItems = items
    .filter((s) => formatYmdAthensFromUtcMs(new Date(s.starts_at).getTime()) === dayYmd)
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  if (dayItems.length === 0) {
    return (
      <EmptyState
        title="Δεν υπάρχουν συνεδρίες"
        description="Δεν βρέθηκαν προγραμματισμένες συνεδρίες για αυτή την ημέρα με τα τρέχοντα φίλτρα."
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceSummaryStrip items={dayItems} />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Ώρα</th>
            <th className="px-4 py-3">Παιδί</th>
            <th className="px-4 py-3">Θεραπευτής</th>
            <th className="px-4 py-3">Κέντρο</th>
            <th className="px-4 py-3">Κατάσταση συνεδρίας</th>
            <th className="px-4 py-3">Παρουσία</th>
            <th className="sticky right-0 z-20 bg-surface-muted/95 px-4 py-3 text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
              Ενέργειες
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {dayItems.map((row) => (
            <tr
              key={row.id}
              className={row.attendance?.status === "to_makeup" ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-surface-muted/40"}
            >
              <td className="whitespace-nowrap px-4 py-2 text-ink-muted">
                {formatAthensTimeEl(row.starts_at)} — {formatAthensTimeEl(row.ends_at)}
              </td>
              <td className="px-4 py-2 font-medium text-ink">{row.child_name}</td>
              <td className="px-4 py-2 text-ink-muted">{row.therapist_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{row.center_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{sessionStatusLabelEl(row.status)}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${attendancePillClass(row.attendance?.status ?? "expected")}`}>
                  {attendanceStatusLabelEl(row.attendance?.status ?? "expected")}
                </span>
              </td>
              <td className="sticky right-0 z-10 bg-surface-card px-4 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                <AttendanceRowActions row={row} canRecord={canRecordForSession(row.therapist_user_id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function AttendanceWeekListPanel({
  items,
  canRecordForSession,
}: {
  items: AttendanceSessionRow[];
  canRecordForSession: (therapistUserId: string) => boolean;
}) {
  const sorted = [...items].sort((a, b) => a.starts_at.localeCompare(b.starts_at));

  if (sorted.length === 0) {
    return (
      <EmptyState
        title="Κενή λίστα"
        description="Δεν βρέθηκαν συνεδρίες στην επιλεγμένη εβδομάδα. Αλλάξτε εβδομάδα ή φίλτρα."
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceSummaryStrip items={sorted} />
      <div className="overflow-x-auto rounded-xl border border-border bg-surface-card shadow-shell">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-surface-muted/50 text-left text-xs font-semibold uppercase text-ink-muted">
          <tr>
            <th className="px-4 py-3">Ημερομηνία</th>
            <th className="px-4 py-3">Ώρα</th>
            <th className="px-4 py-3">Παιδί</th>
            <th className="px-4 py-3">Θεραπευτής</th>
            <th className="px-4 py-3">Κέντρο</th>
            <th className="px-4 py-3">Κατάσταση συνεδρίας</th>
            <th className="px-4 py-3">Παρουσία</th>
            <th className="sticky right-0 z-20 bg-surface-muted/95 px-4 py-3 text-right shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.08)]">
              Ενέργειες
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((row) => (
            <tr
              key={row.id}
              className={row.attendance?.status === "to_makeup" ? "bg-amber-50/40 hover:bg-amber-50/60" : "hover:bg-surface-muted/40"}
            >
              <td className="whitespace-nowrap px-4 py-2 text-ink">
                {new Intl.DateTimeFormat("el-GR", {
                  timeZone: "Europe/Athens",
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }).format(new Date(row.starts_at))}
              </td>
              <td className="whitespace-nowrap px-4 py-2 text-ink-muted">
                {formatAthensTimeEl(row.starts_at)} — {formatAthensTimeEl(row.ends_at)}
              </td>
              <td className="px-4 py-2 font-medium text-ink">{row.child_name}</td>
              <td className="px-4 py-2 text-ink-muted">{row.therapist_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{row.center_name ?? "—"}</td>
              <td className="px-4 py-2 text-ink-muted">{sessionStatusLabelEl(row.status)}</td>
              <td className="px-4 py-2">
                <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${attendancePillClass(row.attendance?.status ?? "expected")}`}>
                  {attendanceStatusLabelEl(row.attendance?.status ?? "expected")}
                </span>
              </td>
              <td className="sticky right-0 z-10 bg-surface-card px-4 py-2 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.06)]">
                <AttendanceRowActions row={row} canRecord={canRecordForSession(row.therapist_user_id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

function AttendanceSummaryStrip({ items }: { items: AttendanceSessionRow[] }) {
  const expected = items.filter((item) => !item.attendance || item.attendance.status === "expected").length;
  const present = items.filter((item) => item.attendance?.status === "present" || item.attendance?.status === "made_up").length;
  const makeup = items.filter((item) => item.attendance?.status === "to_makeup").length;
  const issues = items.filter((item) =>
    ["absent", "cancel_parent", "cancel_therapist", "cancel_center", "to_makeup"].includes(item.attendance?.status ?? "")
  ).length;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <AttendanceSummaryCard label="Αναμένονται" value={expected} helper="Χρειάζονται καταχώρηση ή επιβεβαίωση" />
      <AttendanceSummaryCard label="Παρόντες" value={present} helper="Ολοκληρωμένες παρουσίες" />
      <AttendanceSummaryCard
        label="Αναπληρώσεις"
        value={makeup}
        helper="Προς κλείσιμο με νέα συνεδρία όπου εφαρμόζεται."
        highlight={makeup > 0 ? "amber" : undefined}
      />
      <AttendanceSummaryCard label="Θέλουν χειρισμό" value={issues} helper="Απουσίες, ακυρώσεις ή αναπληρώσεις" />
    </div>
  );
}

function AttendanceSummaryCard({
  label,
  value,
  helper,
  highlight,
}: {
  label: string;
  value: number;
  helper: string;
  highlight?: "amber";
}) {
  const shell =
    highlight === "amber"
      ? "rounded-xl border border-amber-200/90 bg-amber-50/50 p-4 shadow-shell"
      : "rounded-xl border border-border bg-surface-card p-4 shadow-shell";
  return (
    <div className={shell}>
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{helper}</p>
    </div>
  );
}
