import Link from "next/link";
import type { ChildOption, DisciplineOption, TherapistOption } from "@/lib/data/sessions/queries";
import type { TherapyGoalsPageSearch } from "@/lib/therapy-goals/search-params";
import { THERAPY_GOAL_PRIORITY_LABELS_EL, THERAPY_GOAL_STATUS_LABELS_EL } from "@/lib/ui/therapy-goal-labels";
import type { TherapyGoalPriority, TherapyGoalStatus } from "@/lib/data/therapy-goals/types";

type TherapyGoalsFiltersFormProps = {
  search: TherapyGoalsPageSearch;
  therapists: TherapistOption[];
  childOptions: ChildOption[];
  disciplines: DisciplineOption[];
};

export function TherapyGoalsFiltersForm({
  search,
  therapists,
  childOptions,
  disciplines,
}: TherapyGoalsFiltersFormProps) {
  const f = search.filters;

  return (
    <form method="get" action="/therapy-goals" className="mb-6 rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Φίλτρα</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
          Υπεύθυνος θεραπευτής
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
        <label className="block text-xs font-medium text-ink-muted">
          Κατάσταση
          <select
            name="status"
            defaultValue={f.status ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλες</option>
            {(Object.keys(THERAPY_GOAL_STATUS_LABELS_EL) as TherapyGoalStatus[]).map((s) => (
              <option key={s} value={s}>
                {THERAPY_GOAL_STATUS_LABELS_EL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-ink-muted">
          Προτεραιότητα
          <select
            name="priority"
            defaultValue={f.priority ?? ""}
            className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
          >
            <option value="">Όλες</option>
            {(Object.keys(THERAPY_GOAL_PRIORITY_LABELS_EL) as TherapyGoalPriority[]).map((p) => (
              <option key={p} value={p}>
                {THERAPY_GOAL_PRIORITY_LABELS_EL[p]}
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
        <Link
          href="/therapy-goals"
          className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Καθαρισμός φίλτρων
        </Link>
      </div>
    </form>
  );
}
