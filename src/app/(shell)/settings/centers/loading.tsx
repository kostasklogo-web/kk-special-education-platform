export default function CentersSettingsLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-10 w-64 rounded bg-surface-muted" />
      <div className="h-40 rounded-xl bg-surface-muted" />
      <p className="text-sm text-ink-muted">Φόρτωση κέντρων…</p>
    </div>
  );
}
