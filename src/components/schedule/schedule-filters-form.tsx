import type { ChildOption, DisciplineOption, RoomOption, TherapistOption } from "@/lib/data/sessions/queries";
import type { CenterSummary } from "@/lib/data/children/types";
import type { SchedulePageSearch } from "@/lib/schedule/search-params";
import { buildScheduleHref } from "@/lib/schedule/search-params";

type ScheduleFiltersFormProps = {
  search: SchedulePageSearch;
  centers: CenterSummary[];
  therapists: TherapistOption[];
  childOptions: ChildOption[];
  rooms: RoomOption[];
  disciplines: DisciplineOption[];
};

export function ScheduleFiltersForm({
  search,
  centers,
  therapists,
  childOptions,
  rooms,
  disciplines,
}: ScheduleFiltersFormProps) {
  const f = search.filters;

  return (
    <form method="get" action="/schedule" className="mb-6 rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <input type="hidden" name="view" value={search.view} />
      <input type="hidden" name="date" value={search.dateYmd} />
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Φίλτρα</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
          Ειδικότητα
          <select
            name="discipline"
            defaultValue={f.disciplineCode ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλες</option>
            {disciplines.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name_el}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Αίθουσα
          <select
            name="room"
            defaultValue={f.roomId ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλες</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Κατάσταση
          <select
            name="status"
            defaultValue={f.status ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλες</option>
            <option value="scheduled">Προγραμματισμένη</option>
            <option value="completed">Ολοκληρωμένη</option>
            <option value="cancelled">Ακυρώθηκε</option>
            <option value="absence">Απουσία</option>
            <option value="to_reschedule">Προς αναπλήρωση</option>
            <option value="no_show">Απουσία (παλαιός κωδικός)</option>
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
          href={buildScheduleHref({ view: search.view, dateYmd: search.dateYmd })}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Καθαρισμός φίλτρων
        </a>
      </div>
    </form>
  );
}
