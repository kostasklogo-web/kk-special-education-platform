import { formatDateEl } from "@/lib/ui/child-labels";
import type { TherapistChildAssignment } from "@/lib/data/therapist-assignments/types";
import { isAssignmentActive } from "@/lib/data/therapist-assignments/active";

export type ClinicalTeamAssignmentSummary = {
  assignmentId: string;
  therapistUserId: string;
  displayName: string;
  disciplineCode: string | null;
  disciplineLabel: string | null;
  assignmentRole: TherapistChildAssignment["assignmentRole"];
  status: TherapistChildAssignment["status"];
  startsAt: string;
  endsAt: string | null;
  startsAtLabel: string;
  endsAtLabel: string | null;
  isActive: boolean;
  supervisorName: string | null;
  assignmentReason: string | null;
  assignmentSource: TherapistChildAssignment["assignmentSource"];
};

const ROLE_LABELS: Record<TherapistChildAssignment["assignmentRole"], string> = {
  primary_therapist: "Κύριος θεραπευτής",
  co_therapist: "Συν-θεραπευτής",
  supervisor_oversight: "Εποπτεία",
  interdisciplinary: "Διεπιστημονική",
};

const STATUS_LABELS: Record<TherapistChildAssignment["status"], string> = {
  active: "Ενεργή",
  suspended: "Αναστολή",
  ended: "Έληξε",
};

export function mapClinicalTeamAssignments(
  rows: TherapistChildAssignment[]
): ClinicalTeamAssignmentSummary[] {
  return rows.map((r) => ({
    assignmentId: r.id,
    therapistUserId: r.therapistUserId,
    displayName: r.therapistDisplayName ?? "Θεραπευτής",
    disciplineCode: r.disciplineCode,
    disciplineLabel: r.disciplineLabelEl,
    assignmentRole: r.assignmentRole,
    status: r.status,
    startsAt: r.startsAt,
    endsAt: r.endsAt,
    startsAtLabel: formatDateEl(r.startsAt.slice(0, 10)),
    endsAtLabel: r.endsAt ? formatDateEl(r.endsAt.slice(0, 10)) : null,
    isActive: isAssignmentActive(r),
    supervisorName: r.supervisorDisplayName,
    assignmentReason: r.assignmentReason,
    assignmentSource: r.assignmentSource,
  }));
}

export function assignmentRoleLabelEl(role: TherapistChildAssignment["assignmentRole"]): string {
  return ROLE_LABELS[role] ?? role;
}

export function assignmentStatusLabelEl(status: TherapistChildAssignment["status"]): string {
  return STATUS_LABELS[status] ?? status;
}
