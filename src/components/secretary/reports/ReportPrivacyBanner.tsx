"use client";

import { ShieldAlert } from "lucide-react";

export function ReportPrivacyBanner() {
  return (
    <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
      <div>
        <p className="font-semibold">Ευαίσθητα κλινικά δεδομένα (GDPR)</p>
        <p className="mt-0.5 text-xs text-amber-900/90">
          Οι αναφορές περιέχουν κλινικές πληροφορίες. Πρόσβαση βάσει ρόλου. Τα πρόχειρα δεν είναι
          ορατά σε γονείς. Μόνο τελικές εγκεκριμένες αναφορές μπορούν να παραδοθούν ή να
          εμφανιστούν στο parent portal.
        </p>
      </div>
    </div>
  );
}
