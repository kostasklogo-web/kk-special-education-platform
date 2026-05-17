import Link from "next/link";
import type { EvaluationSummary } from "@/lib/clinical/child-profile/types";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { ClinicalAlert } from "@/lib/clinical/child-profile/types";
import { buildClinicalScheduleHref } from "@/lib/clinical/child-profile/links";
import { SESSION_KIND_LABELS_EL } from "@/lib/clinical/child-profile/labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ClinicalBadge, ClinicalEmpty, ClinicalPanel } from "../clinical-ui";

export function ClinicalEvaluationsSection({
  childId,
  sessions,
  evaluationSummary,
  alerts,
}: {
  childId: string;
  sessions: SessionListItem[];
  evaluationSummary: EvaluationSummary;
  alerts: ClinicalAlert[];
}) {
  const evaluations = sessions
    .filter((s) => s.session_kind === "assessment")
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at));

  const scheduled = evaluations.filter((s) => s.status === "scheduled");
  const completed = evaluations.filter((s) => s.status === "completed");
  const reassessmentAlerts = alerts.filter((a) => a.kind === "pending_reassessment");

  return (
    <section id="evaluations" className="space-y-6">
      <ClinicalPanel title="Κλινική σύνοψη αξιολόγησης">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-xs text-ink-faint">Τελευταία αξιολόγηση</dt>
            <dd className="font-semibold">
              {evaluationSummary.lastEvaluationDate
                ? formatDateEl(evaluationSummary.lastEvaluationDate)
                : "—"}
              {evaluationSummary.lastEvaluationDiscipline
                ? ` · ${evaluationSummary.lastEvaluationDiscipline}`
                : ""}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Επόμενη προγραμματισμένη</dt>
            <dd className="font-semibold">
              {evaluationSummary.nextEvaluationDate
                ? formatDateEl(evaluationSummary.nextEvaluationDate)
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Σύνολο αξιολογήσεων</dt>
            <dd className="font-semibold tabular-nums">{evaluationSummary.totalAssessments}</dd>
          </div>
          <div>
            <dt className="text-xs text-ink-faint">Αναφορές αξιολόγησης</dt>
            <dd className="font-semibold tabular-nums">{evaluationSummary.evaluationReportCount}</dd>
          </div>
        </dl>
        {evaluationSummary.clinicalSummary ? (
          <p className="mt-4 rounded-lg bg-clinical-50/50 p-3 text-sm text-ink-muted">
            {evaluationSummary.clinicalSummary}
          </p>
        ) : null}
        <Link
          href={buildClinicalScheduleHref(childId)}
          className="mt-3 inline-block text-xs font-bold text-clinical-700"
        >
          Προγραμματισμός αξιολόγησης →
        </Link>
      </ClinicalPanel>

      {reassessmentAlerts.length > 0 ? (
        <ClinicalPanel title="Ανάγκες επαναξιολόγησης (κλινικά)">
          <ul className="space-y-2 text-sm">
            {reassessmentAlerts.map((a) => (
              <li key={a.id} className="flex items-start gap-2">
                <ClinicalBadge tone="warning">Υπενθύμιση</ClinicalBadge>
                <span>{a.detail}</span>
              </li>
            ))}
          </ul>
        </ClinicalPanel>
      ) : null}

      <EvalBlock title="Προγραμματισμένες" items={scheduled} empty="Καμία." />
      <EvalBlock title="Ιστορικό αξιολογήσεων" items={completed} empty="Δεν έχουν ολοκληρωθεί αξιολογήσεις." />
    </section>
  );
}

function EvalBlock({
  title,
  items,
  empty,
}: {
  title: string;
  items: SessionListItem[];
  empty: string;
}) {
  return (
    <ClinicalPanel title={title}>
      {items.length === 0 ? (
        <ClinicalEmpty>{empty}</ClinicalEmpty>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
              <div>
                <p className="font-medium">{SESSION_KIND_LABELS_EL[s.session_kind] ?? "Αξιολόγηση"}</p>
                <p className="text-xs text-ink-muted">
                  {s.discipline_name_el} · {s.therapist_name ?? "—"}
                </p>
                {s.internal_notes?.trim() ? (
                  <p className="mt-1 text-xs text-ink-muted line-clamp-2">{s.internal_notes}</p>
                ) : null}
              </div>
              <div className="text-right text-xs text-ink-muted">
                <p>{formatDateEl(s.starts_at.slice(0, 10))}</p>
                <p>{s.status}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ClinicalPanel>
  );
}
