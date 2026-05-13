export default function ChildProfileLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-12 w-80 rounded-lg bg-surface-muted" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-surface-muted" />
        <div className="h-64 rounded-xl bg-surface-muted" />
      </div>
    </div>
  );
}
