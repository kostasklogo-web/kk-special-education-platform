import Link from "next/link";
import type { ClinicalAlert } from "@/lib/clinical/child-profile/types";
import { ClinicalAlertsStrip } from "../ClinicalAlertsStrip";
import { ClinicalEmpty, ClinicalPanel } from "../clinical-ui";

const KIND_LABELS: Record<string, string> = {
  no_active_goals: "Στόχοι",
  missing_session_notes: "Σημειώσεις",
  pending_reassessment: "Αξιολόγηση",
  regression_concern: "Παλινδρόμηση",
  attendance_impact: "Παρουσία (κλινικά)",
  supervision_urgent: "Εποπτεία",
  interdisciplinary_review: "Διεπιστημονική",
  stale_goal: "Ληγμένοι στόχοι",
  draft_report_overdue: "Αναφορές",
};

export function ClinicalAlertsSection({ alerts }: { alerts: ClinicalAlert[] }) {
  const urgent = alerts.filter((a) => a.severity === "urgent");
  const warning = alerts.filter((a) => a.severity === "warning");
  const info = alerts.filter((a) => a.severity === "info");

  return (
    <section className="space-y-6">
      <p className="text-sm text-ink-muted">
        Μόνο κλινικές ειδοποιήσεις — όχι πληρωμές, υπενθυμίσεις γραμματείας ή GDPR.
      </p>

      {alerts.length === 0 ? (
        <ClinicalEmpty>Δεν υπάρχουν ενεργές κλινικές ειδοποιήσεις.</ClinicalEmpty>
      ) : (
        <>
          <ClinicalAlertsStrip alerts={alerts} />
          <AlertGroup title="Επείγον" items={urgent} />
          <AlertGroup title="Προσοχή" items={warning} />
          <AlertGroup title="Ενημέρωση" items={info} />
        </>
      )}
    </section>
  );
}

function AlertGroup({ title, items }: { title: string; items: ClinicalAlert[] }) {
  if (items.length === 0) return null;
  return (
    <ClinicalPanel title={title}>
      <ul className="space-y-2">
        {items.map((a) => (
          <li
            key={a.id}
            className="rounded-lg border border-border/70 bg-surface-muted/20 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {KIND_LABELS[a.kind] ?? a.kind}
              </span>
            </div>
            <p className="font-semibold text-ink">{a.title}</p>
            <p className="text-xs text-ink-muted">{a.detail}</p>
            {a.href ? (
              <Link href={a.href} className="mt-1 inline-block text-xs font-bold text-clinical-700">
                Μετάβαση →
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </ClinicalPanel>
  );
}
