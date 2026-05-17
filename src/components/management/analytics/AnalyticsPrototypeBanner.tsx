export function AnalyticsPrototypeBanner() {
  return (
    <div
      role="status"
      className="rounded-lg border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950"
    >
      <p className="font-semibold">Πρωτότυπο αναλυτικών στοιχείων διοίκησης</p>
      <p className="mt-1 text-violet-900/90">
        Όλα τα νούμερα είναι στατικά demo δεδομένα — χωρίς Supabase. Σκοπός: ημερήσιες, εβδομαδιαίες, μηνιαίες
        και ετήσιες αναφορές με συγκρίσεις περιόδων.
      </p>
    </div>
  );
}
