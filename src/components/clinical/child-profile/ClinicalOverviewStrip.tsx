import type { ClinicalChildProfileBundle } from "@/lib/clinical/child-profile/types";
import { ClinicalBadge } from "./clinical-ui";

/** Compact clinical strip below main identity header (prototype / review). */
export function ClinicalOverviewStrip({ bundle }: { bundle: ClinicalChildProfileBundle }) {
  const { assignedTherapists, assignedSpecialties, treatmentPlans, counts } = bundle;
  const plan = treatmentPlans[0];

  return (
    <section className="rounded-xl border border-clinical-200/80 bg-clinical-50/50 p-4 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-clinical-800">
            Θεραπευτική ομάδα
          </p>
          {assignedTherapists.length === 0 ? (
            <p className="mt-1 text-sm text-ink-muted">—</p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              {assignedTherapists.map((t) => (
                <li
                  key={t.userId}
                  className="rounded-lg border border-white bg-white px-2.5 py-1.5 text-xs shadow-sm"
                >
                  <span className="font-semibold text-ink">{t.displayName}</span>
                  <span className="mt-0.5 block text-ink-muted">{t.disciplines.join(" · ")}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-clinical-800">Ειδικότητες</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {assignedSpecialties.map((s) => (
              <ClinicalBadge key={s.disciplineCode} tone="clinical">
                {s.disciplineLabel}
              </ClinicalBadge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-clinical-800">
            Παρέμβαση & στόχοι
          </p>
          <p className="mt-2 text-sm font-medium text-ink">{plan?.title ?? "—"}</p>
          <p className="mt-1 text-xs text-ink-muted">
            {counts.activeGoals} ενεργοί · {counts.completedGoals} ολοκληρωμένοι · {counts.evaluations}{" "}
            αξιολογήσεις
          </p>
        </div>
      </div>
    </section>
  );
}
