export default function ShellLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <div className="h-8 w-64 rounded-lg bg-surface-muted" />
          <div className="h-4 w-full max-w-xl rounded bg-surface-muted" />
        </div>
        <div className="h-10 w-32 rounded-lg bg-surface-muted" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
            <div className="h-3 w-28 rounded bg-surface-muted" />
            <div className="mt-4 h-8 w-16 rounded bg-surface-muted" />
            <div className="mt-3 h-4 w-36 rounded bg-surface-muted" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
          <div className="h-5 w-48 rounded bg-surface-muted" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[7rem_1fr_auto]">
                <div className="h-10 rounded bg-surface-muted" />
                <div className="h-10 rounded bg-surface-muted" />
                <div className="h-8 w-28 rounded bg-surface-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-64 rounded-2xl border border-border bg-surface-card shadow-shell" />
          <div className="h-48 rounded-2xl border border-border bg-surface-card shadow-shell" />
        </div>
      </div>
    </div>
  );
}
