import Link from "next/link";
import type { ChildOption } from "@/lib/data/sessions/queries";
import type { ReportsPageSearch } from "@/lib/progress-reports/search-params";
import { buildReportsHref } from "@/lib/progress-reports/search-params";

type ProgressReportsFiltersFormProps = {
  search: ReportsPageSearch;
  childOptions: ChildOption[];
};

export function ProgressReportsFiltersForm({ search, childOptions }: ProgressReportsFiltersFormProps) {
  const f = search.filters;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildReportsHref({ ...f, status: "open" })}
          className="rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-sm hover:bg-amber-100"
        >
          Ουρά εκκρεμοτήτων
        </Link>
        <Link
          href={buildReportsHref({ ...f, status: "draft" })}
          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Πρόχειρα
        </Link>
        <Link
          href={buildReportsHref({ ...f, status: null })}
          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Όλες
        </Link>
      </div>

      <form method="get" action="/reports" className="rounded-xl border border-border bg-surface-card p-4 shadow-shell">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-muted">Φίλτρα</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
            Κατάσταση
            <select
              name="status"
              defaultValue={f.status ?? ""}
              className="mt-1 w-full rounded-lg border border-border bg-white px-2 py-1.5 text-sm"
            >
              <option value="">Όλες</option>
              <option value="open">Εκκρεμότητες (ουρά)</option>
              <option value="draft">Πρόχειρο</option>
              <option value="pending_review">Προς έλεγχο</option>
              <option value="pending">Σε αναμονή</option>
              <option value="approved">Εγκεκριμένο</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Εφαρμογή
            </button>
            <Link
              href="/reports"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Καθαρισμός
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
