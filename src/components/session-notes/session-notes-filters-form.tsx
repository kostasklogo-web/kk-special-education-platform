import type { ChildOption, DisciplineOption, TherapistOption } from "@/lib/data/sessions/queries";
import type { SessionNotesPageSearch } from "@/lib/session-notes/search-params";
import { buildSessionNotesHref } from "@/lib/session-notes/search-params";

type SessionNotesFiltersFormProps = {
  search: SessionNotesPageSearch;
  therapists: TherapistOption[];
  childOptions: ChildOption[];
  disciplines: DisciplineOption[];
};

export function SessionNotesFiltersForm({
  search,
  therapists,
  childOptions,
  disciplines,
}: SessionNotesFiltersFormProps) {
  const f = search.filters;

  return (
    <form method="get" action="/session-notes" className="mb-6 rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Φίλτρα</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs font-medium text-ink-muted">
          Ημερομηνία (εβδομάδα που περιέχει)
          <input
            type="date"
            name="date"
            defaultValue={search.dateYmd}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          />
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
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
        >
          Εφαρμογή
        </button>
        <a
          href={buildSessionNotesHref({ dateYmd: search.dateYmd })}
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Καθαρισμός φίλτρων
        </a>
      </div>
    </form>
  );
}
