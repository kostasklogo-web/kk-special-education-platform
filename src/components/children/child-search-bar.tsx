type ChildSearchBarProps = {
  defaultQuery?: string;
};

/** Απλή αναζήτηση (όνομα / επώνυμο). Φίλτρα ανά κέντρο: σύντομα. */
export function ChildSearchBar({ defaultQuery = "" }: ChildSearchBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-card p-4 shadow-shell sm:flex-row sm:items-end sm:justify-between">
      <form method="get" className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="child-search" className="mb-1 block text-xs font-medium text-ink-muted">
            Αναζήτηση
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
          className="shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Εφαρμογή
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
