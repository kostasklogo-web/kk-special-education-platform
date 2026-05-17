"use client";

import Link from "next/link";
import type { ReportsRoleView } from "@/lib/secretary/reports/report-queries";
import { REPORT_THERAPIST_OPTIONS } from "@/lib/secretary/reports/catalog";

const VIEW_LABELS: Record<ReportsRoleView, string> = {
  secretary: "Γραμματεία — όλα τα αιτήματα",
  therapist: "Πύλη θεραπευτή — ανατεθειμένες αναφορές",
  supervisor: "Επόπτης — έλεγχος & έγκριση draft",
  clinical_director: "Κλινικός διευθυντής — τελική έγκριση",
};

type Props = {
  view: ReportsRoleView;
  therapistLabel: string;
  onTherapistLabelChange: (label: string) => void;
};

export function ReportsRoleBanner({ view, therapistLabel, onTherapistLabelChange }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-clinical-200 bg-clinical-50/50 px-4 py-3">
      <p className="text-sm font-semibold text-clinical-900">{VIEW_LABELS[view]}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {view === "therapist" ? (
          <select
            className="rounded border border-border bg-white px-2 py-1.5 font-medium"
            value={therapistLabel}
            onChange={(e) => onTherapistLabelChange(e.target.value)}
          >
            <option value="">Όλοι οι ανατεθειμένοι</option>
            {REPORT_THERAPIST_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        ) : null}
        <Link href="/secretary/reports" className="font-semibold text-clinical-700 hover:underline">
          Πλήρης λίστα
        </Link>
        <Link
          href="/secretary/reports?view=therapist"
          className={view === "therapist" ? "font-bold text-clinical-900" : "text-ink-muted hover:underline"}
        >
          Θεραπευτής
        </Link>
        <Link
          href="/secretary/reports?view=supervisor"
          className={view === "supervisor" ? "font-bold text-clinical-900" : "text-ink-muted hover:underline"}
        >
          Επόπτης
        </Link>
        <Link
          href="/secretary/reports?view=clinical_director"
          className={
            view === "clinical_director" ? "font-bold text-clinical-900" : "text-ink-muted hover:underline"
          }
        >
          Κ.Δ.
        </Link>
      </div>
    </div>
  );
}
