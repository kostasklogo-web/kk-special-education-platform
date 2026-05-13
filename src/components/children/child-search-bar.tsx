type ChildSearchBarProps = {
  defaultQuery?: string;
};

/** Απλή αναζήτηση (όνομα / επώνυμο). Φίλτρα ανά κέντρο: σύντομα. */
export function ChildSearchBar({ defaultQuery = "" }: ChildSearchBarProps) {
  return (
    <div className="rounded-2xl border border-border bg-gradient-to-b from-surface-card to-surface-muted/20 p-4 shadow-shell sm:flex sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-5">
      <form method="get" className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="child-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-faint">
            Αναζήτηση ωφελούμενων
          </label>
          <input
            id="child-search"
            name="q"
            type="search"
            placeholder="Όνομα ή επώνυμο…"
            defaultValue={defaultQuery}
            className="w-full min-w-0 rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50/50"
        >
          Αναζήτηση
        </button>
      </form>
      <div className="flex shrink-0 items-center gap-2">
        <label className="text-xs font-medium text-ink-faint">
          Φίλτρο κέντρου
          <select
            disabled
            className="ml-2 cursor-not-allowed rounded-lg border border-dashed border-border bg-surface-muted px-2 py-1.5 text-xs text-ink-faint"
            title="Θα ενεργοποιηθεί σε επόμενη έκδοση"
          >
            <option>Όλα τα κέντρα</option>
          </select>
        </label>
      </div>
    </div>
  );
}
