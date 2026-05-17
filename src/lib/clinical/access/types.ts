import type { RoleCode } from "@/lib/auth/roles";
import type { TherapistChildAssignment } from "@/lib/data/therapist-assignments/types";

export type ClinicalAccessAction =
  | "read"
  | "write"
  | "confidential_read"
  | "assign"
  | "export";

export type ClinicalAccessMode =
  | "therapist"
  | "supervisor"
  | "clinical_director"
  | "parent"
  | "denied";

export type ClinicalAccessDenialReason =
  | "no_assignment"
  | "assignment_ended"
  | "assignment_suspended"
  | "role"
  | "secretary_clinical"
  | "parent_not_linked"
  | "unauthenticated";

export type ClinicalAccessResult =
  | {
      allowed: true;
      mode: ClinicalAccessMode;
      assignmentId?: string;
      assignment?: TherapistChildAssignment;
      canViewConfidential: boolean;
    }
  | {
      allowed: false;
      reason: ClinicalAccessDenialReason;
      messageEl: string;
    };

export type ClinicalAccessScope = {
  organizationId: string;
  userId: string | null;
  roleCodes: RoleCode[];
  assignedChildIds: string[];
  supervisorScopedChildIds: string[];
  parentChildIds: string[];
};
