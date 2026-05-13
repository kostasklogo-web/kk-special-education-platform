export default function ChildrenLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="h-9 w-56 rounded-lg bg-surface-muted sm:w-72" />
          <div className="h-4 w-full max-w-md rounded bg-surface-muted" />
        </div>
        <div className="h-10 w-40 rounded-lg bg-surface-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell">
            <div className="h-3 w-24 rounded bg-surface-muted" />
            <div className="mt-3 h-7 w-12 rounded bg-surface-muted" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-4 rounded-2xl border border-border bg-surface-card p-6 shadow-shell">
          <div className="h-5 w-40 rounded bg-surface-muted" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3 border-l-2 border-surface-muted pl-4">
              <div className="h-12 flex-1 rounded-lg bg-surface-muted" />
            </div>
          ))}
        </div>
        <div className="h-48 rounded-2xl border border-border bg-surface-card shadow-shell lg:h-auto" />
      </div>
    </div>
  );
}
