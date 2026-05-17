import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

export function DashboardLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface-card px-6 py-16 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-clinical-600" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-ink">Φόρτωση κέντρου ελέγχου…</p>
      <p className="mt-1 text-xs text-ink-muted">Συγκεντρώνουμε ραντεβού, πληρωμές και εργασίες.</p>
    </div>
  );
}

export function DashboardErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/50 px-6 py-16 text-center">
      <AlertCircle className="h-8 w-8 text-red-600" aria-hidden />
      <p className="mt-3 text-sm font-bold text-ink">Δεν ήταν δυνατή η φόρτωση</p>
      <p className="mt-1 text-xs text-ink-muted">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-surface-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Δοκιμή ξανά
        </button>
      ) : null}
    </div>
  );
}

