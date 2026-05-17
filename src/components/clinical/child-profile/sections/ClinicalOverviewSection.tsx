import Link from "next/link";
import type { ClinicalChildProfileBundle } from "@/lib/clinical/child-profile/types";
import { buildClinicalGoalsHref, buildClinicalReportsHref } from "@/lib/clinical/child-profile/links";
import { therapyGoalStatusLabelEl } from "@/lib/ui/therapy-goal-labels";
import { progressReportStatusLabelEl } from "@/lib/ui/progress-report-labels";
import { formatDateEl, CHILD_STATUS_LABELS } from "@/lib/ui/child-labels";
import { ClinicalBadge, ClinicalPanel } from "../clinical-ui";

export function ClinicalOverviewSection({
  bundle,
  canViewNoteBodies,
}: {
  bundle: ClinicalChildProfileBundle;
  canViewNoteBodies: boolean;
}) {
  const {
    child,
    assignedTherapists,
    assignedSpecialties,
    goals,
    treatmentPlans,
    programs,
    progressReports,
    sessionNotes,
    evaluationSummary,
    counts,
  } = bundle;

  const activeGoals = goals.filter((g) => ["active", "in_progress", "on_hold"].includes(g.status));
  const latestReport = progressReports[0] ?? null;
  const latestNotes = sessionNotes.slice(0, 3);

  return (
    <div className="space-y-6">
      <ClinicalPanel title="Ταυτότητα & κλινική κατάσταση">
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <dt className="text-xs text-ink-faint">Κατάσταση</dt>
            <dd className="font-semibold">{CHILD_STATUS_LABELS[child.status]}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Κέντρο</dt>
            <dd className="font-medium">{child.center?.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Έναρξη</dt>
            <dd className="font-medium">{formatDateEl(child.enrollment_start_date)}</dd>
          </div>
        </dl>
      </ClinicalPanel>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Ενεργοί στόχοι" value={counts.activeGoals} href={buildClinicalGoalsHref(child.id)} />
        <StatCard label="Σημειώσεις" value={counts.sessionNotes} />
        <StatCard label="Αξιολογήσεις" value={counts.evaluations} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClinicalPanel title="Ανατεθειμένοι θεραπευτές">
          {assignedTherapists.length === 0 ? (
            <p className="text-sm text-ink-muted">—</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {assignedTherapists.map((t) => (
                <li key={t.userId} className="rounded-lg border border-border/60 px-3 py-2">
                  <p className="font-semibold">{t.displayName}</p>
                  <p className="text-xs text-ink-muted">
                    {t.disciplines.join(" · ")} · {t.sessionCount} συνεδρίες
                  </p>
                </li>
              ))}
            </ul>
          )}
        </ClinicalPanel>

        <ClinicalPanel title="Ειδικότητες στην παρέμβαση">
          {assignedSpecialties.length === 0 ? (
            <p className="text-sm text-ink-muted">—</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {assignedSpecialties.map((s) => (
                <li key={s.disciplineCode}>
                  <ClinicalBadge tone="clinical">
                    {s.disciplineLabel} ({s.activeGoalCount} στόχοι)
                  </ClinicalBadge>
                </li>
              ))}
            </ul>
          )}
        </ClinicalPanel>
      </div>

      <ClinicalPanel title="Τρέχον πλάνο παρέμβασης">
        {treatmentPlans.length > 0 ? (
          <ul className="space-y-1 text-sm font-medium">
            {treatmentPlans.map((p) => (
              <li key={p.id}>
                {p.title}
                {p.status ? <span className="text-ink-muted"> · {p.status}</span> : null}
              </li>
            ))}
          </ul>
        ) : programs.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {programs.map((p) => (
              <li key={p.id}>{p.title ?? "Πρόγραμμα"}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">Δεν έχει καταγραφεί πλάνο.</p>
        )}
      </ClinicalPanel>

      <ClinicalPanel
        title="Ενεργοί θεραπευτικοί / εκπαιδευτικοί στόχοι"
        action={
          <Link href={buildClinicalGoalsHref(child.id)} className="text-xs font-bold text-clinical-700">
            Όλοι →
          </Link>
        }
      >
        {activeGoals.length === 0 ? (
          <p className="text-sm text-ink-muted">Χωρίς ενεργούς στόχους.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {activeGoals.slice(0, 8).map((g) => (
              <li key={g.id} className="flex justify-between gap-2 py-2">
                <Link href={buildClinicalGoalsHref(child.id, g.id)} className="font-medium hover:underline">
                  {g.title}
                </Link>
                <span className="shrink-0 text-xs text-ink-muted">
                  {g.discipline_name_el} · {therapyGoalStatusLabelEl(g.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </ClinicalPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <ClinicalPanel title="Τελευταία αξιολόγηση">
          {evaluationSummary.lastEvaluationDate ? (
            <>
              <p className="text-sm font-semibold">
                {formatDateEl(evaluationSummary.lastEvaluationDate)} ·{" "}
                {evaluationSummary.lastEvaluationDiscipline ?? "—"}
              </p>
              {evaluationSummary.clinicalSummary ? (
                <p className="mt-2 text-sm text-ink-muted">{evaluationSummary.clinicalSummary}</p>
              ) : null}
              {evaluationSummary.nextEvaluationDate ? (
                <p className="mt-2 text-xs text-clinical-700">
                  Επόμενη: {formatDateEl(evaluationSummary.nextEvaluationDate)}
                </p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-ink-muted">Δεν έχει καταγραφεί αξιολόγηση.</p>
          )}
        </ClinicalPanel>

        <ClinicalPanel title="Τελευταία αναφορά προόδου">
          {latestReport ? (
            <>
              <Link href={buildClinicalReportsHref(child.id)} className="text-sm font-semibold hover:underline">
                {latestReport.title}
              </Link>
              <p className="mt-1 text-xs text-ink-muted">
                {progressReportStatusLabelEl(latestReport.status)} ·{" "}
                {formatDateEl(latestReport.updated_at.slice(0, 10))}
              </p>
              {latestReport.summary ? (
                <p className="mt-2 text-sm text-ink-muted line-clamp-3">{latestReport.summary}</p>
              ) : null}
            </>
          ) : (
            <p className="text-sm text-ink-muted">Χωρίς αναφορές.</p>
          )}
        </ClinicalPanel>
      </div>

      {canViewNoteBodies && latestNotes.length > 0 ? (
        <ClinicalPanel title="Γρήγορη κλινική σύνοψη">
          <ul className="space-y-2 text-sm text-ink-muted">
            {latestNotes.map((n) => (
              <li key={n.id}>
                <span className="font-medium text-ink">
                  {formatDateEl((n.session_starts_at ?? n.updated_at).slice(0, 10))} · {n.discipline_name_el}
                </span>
                {" — "}
                {(n.observations || n.goals_worked || n.body).slice(0, 120)}…
              </li>
            ))}
          </ul>
        </ClinicalPanel>
      ) : null}
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const inner = (
    <div className="rounded-xl border border-clinical-100 bg-clinical-50/30 p-4 text-center">
      <p className="text-2xl font-bold tabular-nums text-clinical-800">{value}</p>
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
