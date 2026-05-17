"use client";

import { AlertTriangle } from "lucide-react";

type Props = { visible: boolean };

export function FinancesScheduleFallbackBanner({ visible }: Props) {
  if (!visible) return null;

  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
      <p>
        <strong>Ενδεικτικά δεδομένα προγράμματος:</strong> η σύνδεση με το demo πρόγραμμα δεν ολοκληρώθηκε·
        εμφανίζονται ασφαλή στατικά νούμερα πρωτοτύπου. Τα οικονομικά παραμένουν λειτουργικά για επίδειξη.
      </p>
    </div>
  );
}
