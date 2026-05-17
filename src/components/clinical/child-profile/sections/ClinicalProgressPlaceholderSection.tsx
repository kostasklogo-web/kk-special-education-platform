import type { ClinicalChildProfileBundle } from "@/lib/clinical/child-profile/types";
import { ClinicalBadge, ClinicalPanel } from "../clinical-ui";

type Props = {
  bundle: ClinicalChildProfileBundle;
};

export function ClinicalProgressPlaceholderSection({ bundle }: Props) {
  const { goalProgress, assignedSpecialties, counts } = bundle;

  return (
    <section className="space-y-6">
      <ClinicalPanel title="Γραφήματα προόδου (πρωτότυπο)">
        <p className="text-sm text-ink-muted">
          Η φάση C6 θα εμφανίζει γραφήματα ανά στόχο (0–5), ειδικότητα και τομέα. Τα παρακάτω
          είναι ενδεικτικά από το τρέχον μοντέλο στόχων.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-clinical-200 bg-clinical-50/40 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-clinical-800">
              Γράφημα ανά στόχο
            </p>
            <p className="mt-2 text-sm text-ink-muted">Σύντομα — γραμμή 0–5 ανά συνεδρία</p>
          </div>
          <div className="rounded-xl border border-dashed border-clinical-200 bg-clinical-50/40 p-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-clinical-800">
              Γράφημα ανά τομέα
            </p>
            <p className="mt-2 text-sm text-ink-muted">Σύντομα — ράβδοι ανά ειδικότητα</p>
          </div>
        </div>
      </ClinicalPanel>

      <ClinicalPanel title="Στιγμιότυπο στόχων (ενδεικτικό)">
        {goalProgress.length === 0 ? (
          <p className="text-sm text-ink-muted">Δεν υπάρχουν στόχοι για γράφημα.</p>
        ) : (
          <ul className="space-y-3">
            {goalProgress.slice(0, 8).map((g) => (
              <li
                key={g.goalId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm"
              >
                <div>
                  <p className="font-semibold text-ink">{g.title}</p>
                  <p className="text-xs text-ink-muted">{g.disciplineLabel}</p>
                </div>
                <ClinicalBadge tone="clinical">{g.progressPercent}%</ClinicalBadge>
              </li>
            ))}
          </ul>
        )}
      </ClinicalPanel>

      <ClinicalPanel title="Ειδικότητες">
        <p className="text-sm text-ink-muted">
          {assignedSpecialties.length} ειδικότητες · {counts.activeGoals} ενεργοί στόχοι ·{" "}
          {counts.sessionNotes} σημειώσεις συνεδριών
        </p>
      </ClinicalPanel>
    </section>
  );
}
