export default function ScheduleLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-10 w-64 rounded bg-surface-muted" />
      <div className="h-32 rounded-xl bg-surface-muted" />
      <div className="grid gap-3 lg:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-surface-muted" />
        ))}
      </div>
      <p className="text-sm text-ink-muted">Φόρτωση προγράμματος…</p>
    </div>
  );
}
