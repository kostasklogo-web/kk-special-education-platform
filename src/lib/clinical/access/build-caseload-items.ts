import "server-only";

import { isAssignmentActive } from "@/lib/data/therapist-assignments/active";
import type { TherapistChildAssignment } from "@/lib/data/therapist-assignments/types";
import type { ChildListItem } from "@/lib/data/children/types";
import {
  DEMO_CLINICAL_CHILD_B_ID,
  DEMO_CLINICAL_CHILD_ID,
} from "@/lib/demo/clinical-demo-ids";
import { formatDateEl } from "@/lib/ui/child-labels";
import type { TherapistCaseloadItem } from "./caseload-types";

export type { TherapistCaseloadItem };

const DEMO_CHILD_LABELS: Record<string, string> = {
  [DEMO_CLINICAL_CHILD_ID]: "Νίκος Παπαδόπουλος",
  [DEMO_CLINICAL_CHILD_B_ID]: "Παιδί demo B",
};

function childLabel(childId: string, children: ChildListItem[]): string {
  const c = children.find((x) => x.id === childId);
  if (c) {
    return [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || childId;
  }
  return DEMO_CHILD_LABELS[childId] ?? `Παιδί ${childId.slice(0, 8)}…`;
}

export function buildTherapistCaseloadItems(
  assignments: TherapistChildAssignment[],
  children: ChildListItem[]
): TherapistCaseloadItem[] {
  return assignments
    .filter(
      (a) =>
        isAssignmentActive(a) &&
        a.assignmentRole !== "supervisor_oversight"
    )
    .map((a) => ({
      assignmentId: a.id,
      childId: a.childId,
      childLabel: childLabel(a.childId, children),
      disciplineLabel: a.disciplineLabelEl,
      startsAtLabel: formatDateEl(a.startsAt.slice(0, 10)),
    }));
}
