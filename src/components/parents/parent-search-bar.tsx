type ParentSearchBarProps = {
  defaultQuery?: string;
};

export function ParentSearchBar({ defaultQuery = "" }: ParentSearchBarProps) {
  return (
    <div className="rounded-xl border border-border bg-surface-card p-4 shadow-shell">
      <form method="get" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="parent-search" className="mb-1 block text-xs font-medium text-ink-muted">
            Αναζήτηση
          </label>
          <input
            id="parent-search"
            name="q"
            type="search"
            placeholder="Όνομα, επώνυμο, email ή τηλέφωνο…"
            defaultValue={defaultQuery}
            className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none ring-clinical-500 focus:ring-2"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Εφαρμογή
        </button>
      </form>
    </div>
  );
}
