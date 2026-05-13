export default function StaffLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-10 w-48 rounded bg-surface-muted" />
      <div className="h-24 rounded-xl bg-surface-muted" />
      <div className="h-48 rounded-xl bg-surface-muted" />
      <p className="text-sm text-ink-muted">Φόρτωση προσωπικού…</p>
    </div>
  );
}
