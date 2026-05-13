export default function SessionNotesLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-10 w-80 rounded bg-surface-muted" />
      <div className="h-24 rounded-xl bg-surface-muted" />
      <div className="h-56 rounded-xl bg-surface-muted" />
      <p className="text-sm text-ink-muted">Φόρτωση σημειώσεων…</p>
    </div>
  );
}
