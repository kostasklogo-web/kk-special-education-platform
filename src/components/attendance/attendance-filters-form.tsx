import type { ChildOption, TherapistOption } from "@/lib/data/sessions/queries";
import type { CenterSummary } from "@/lib/data/children/types";
import type { AttendancePageSearch } from "@/lib/attendance/search-params";
import { buildAttendanceHref } from "@/lib/attendance/search-params";
import { ATTENDANCE_STATUS_LABELS_EL } from "@/lib/ui/attendance-labels";
import type { AttendanceStatus } from "@/lib/data/attendance/types";

type AttendanceFiltersFormProps = {
  search: AttendancePageSearch;
  centers: CenterSummary[];
  therapists: TherapistOption[];
  childOptions: ChildOption[];
};

export function AttendanceFiltersForm({
  search,
  centers,
  therapists,
  childOptions,
}: AttendanceFiltersFormProps) {
  const f = search.filters;

  return (
    <form method="get" action="/attendance" className="mb-6 rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <input type="hidden" name="view" value={search.view} />
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Φίλτρα</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <label className="block text-xs font-medium text-ink-muted">
          Ημερομηνία
          <input
            type="date"
            name="date"
            defaultValue={search.dateYmd}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Κέντρο
          <select
            name="center"
            defaultValue={f.centerId ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλα</option>
            {centers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Θεραπευτής
          <select
            name="therapist"
            defaultValue={f.therapistId ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλοι</option>
            {therapists.map((t) => (
              <option key={t.user_id} value={t.user_id}>
                {t.display_name ?? t.user_id}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Παιδί
          <select
            name="child"
            defaultValue={f.childId ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλα</option>
            {childOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.last_name} {c.first_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Κατάσταση παρουσίας
          <select
            name="att_status"
            defaultValue={f.attendanceStatus ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλες</option>
            {(Object.keys(ATTENDANCE_STATUS_LABELS_EL) as AttendanceStatus[]).map((s) => (
              <option key={s} value={s}>
                {ATTENDANCE_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
        >
          Εφαρμογή
        </button>
        <a
          href={buildAttendanceHref({ view: search.view, dateYmd: search.dateYmd })}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Καθαρισμός φίλτρων
        </a>
      </div>
    </form>
  );
}
