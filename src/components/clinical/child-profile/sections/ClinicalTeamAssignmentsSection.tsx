import type { ClinicalChildProfileBundle } from "@/lib/clinical/child-profile/types";
import {
  assignmentRoleLabelEl,
  assignmentStatusLabelEl,
} from "@/lib/clinical/child-profile/map-clinical-team";
import { ClinicalBadge, ClinicalPanel } from "../clinical-ui";

export function ClinicalTeamAssignmentsSection({
  bundle,
}: {
  bundle: ClinicalChildProfileBundle;
}) {
  const { clinicalTeamAssignments } = bundle;
  const active = clinicalTeamAssignments.filter((a) => a.isActive);
  const historical = clinicalTeamAssignments.filter((a) => !a.isActive);

  return (
    <div className="space-y-4">
      <ClinicalPanel title="Ενεργή διεπιστημονική ομάδα (αναθέσεις)">
        <p className="mb-3 text-xs text-ink-muted">
          Πρόσβαση στον κλινικό φάκελο παρέχεται μόνο μέσω ενεργών αναθέσεων — όχι από ιστορικό συνεδριών.
        </p>
        {active.length === 0 ? (
          <p className="text-sm text-ink-muted">Δεν υπάρχουν ενεργές αναθέσεις.</p>
        ) : (
          <ul className="space-y-2">
            {active.map((a) => (
              <AssignmentRow key={a.assignmentId} {...a} />
            ))}
          </ul>
        )}
      </ClinicalPanel>

      {historical.length > 0 ? (
        <ClinicalPanel title="Ιστορικές αναθέσεις">
          <ul className="space-y-2 opacity-90">
            {historical.map((a) => (
              <AssignmentRow key={a.assignmentId} {...a} />
            ))}
          </ul>
        </ClinicalPanel>
      ) : null}
    </div>
  );
}

function AssignmentRow(
  props: ClinicalChildProfileBundle["clinicalTeamAssignments"][number]
) {
  return (
    <li className="rounded-lg border border-border/60 px-3 py-2.5 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{props.displayName}</p>
          <p className="text-xs text-ink-muted">
            {props.disciplineLabel ?? "—"} · {assignmentRoleLabelEl(props.assignmentRole)}
          </p>
        </div>
        <ClinicalBadge tone={props.isActive ? "clinical" : "neutral"}>
          {assignmentStatusLabelEl(props.status)}
        </ClinicalBadge>
      </div>
      <dl className="mt-2 grid gap-1 text-xs text-ink-muted sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint">Έναρξη</dt>
          <dd>{props.startsAtLabel}</dd>
        </div>
        {props.endsAtLabel ? (
          <div>
            <dt className="text-ink-faint">Λήξη</dt>
            <dd>{props.endsAtLabel}</dd>
          </div>
        ) : null}
        {props.supervisorName ? (
          <div>
            <dt className="text-ink-faint">Επόπτης</dt>
            <dd>{props.supervisorName}</dd>
          </div>
        ) : null}
        {props.assignmentReason ? (
          <div className="sm:col-span-2">
            <dt className="text-ink-faint">Λόγος</dt>
            <dd>{props.assignmentReason}</dd>
          </div>
        ) : null}
      </dl>
    </li>
  );
}
