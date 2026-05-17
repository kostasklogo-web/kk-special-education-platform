/** Explicit therapist–child clinical assignment (system of record for access). */

export type TherapistAssignmentStatus = "active" | "suspended" | "ended";

export type TherapistAssignmentSource =
  | "manual"
  | "schedule_rule"
  | "program_enrollment"
  | "temporary";

export type TherapistAssignmentRole =
  | "primary_therapist"
  | "co_therapist"
  | "supervisor_oversight"
  | "interdisciplinary";

export type TherapistChildAssignment = {
  id: string;
  organizationId: string;
  childId: string;
  therapistUserId: string;
  therapistDisplayName: string | null;
  disciplineCode: string | null;
  disciplineLabelEl: string | null;
  assignmentRole: TherapistAssignmentRole;
  status: TherapistAssignmentStatus;
  startsAt: string;
  endsAt: string | null;
  assignmentSource: TherapistAssignmentSource;
  assignedByUserId: string | null;
  assignedByDisplayName: string | null;
  assignmentReason: string | null;
  endedReason: string | null;
  notes: string | null;
  supervisorUserId: string | null;
  supervisorDisplayName: string | null;
  canViewConfidential: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateTherapistAssignmentInput = {
  organizationId: string;
  childId: string;
  therapistUserId: string;
  therapistDisplayName?: string | null;
  disciplineCode?: string | null;
  disciplineLabelEl?: string | null;
  assignmentRole?: TherapistAssignmentRole;
  startsAt?: string;
  endsAt?: string | null;
  assignmentSource?: TherapistAssignmentSource;
  assignedByUserId?: string | null;
  assignedByDisplayName?: string | null;
  assignmentReason?: string | null;
  notes?: string | null;
  supervisorUserId?: string | null;
  supervisorDisplayName?: string | null;
  canViewConfidential?: boolean;
};

export type EndTherapistAssignmentInput = {
  assignmentId: string;
  endedReason?: string | null;
  endsAt?: string;
};

export type ListAssignmentsFilters = {
  childId?: string;
  therapistUserId?: string;
  status?: TherapistAssignmentStatus | "active_only" | "all";
  includeEnded?: boolean;
};
