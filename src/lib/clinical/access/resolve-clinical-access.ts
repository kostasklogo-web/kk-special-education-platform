import "server-only";

import type { RoleCode } from "@/lib/auth/roles";
import { isParentOnly } from "@/lib/auth/children-permissions";
import {
  getActiveAssignmentForTherapistChild,
  listAssignmentsForChild,
} from "@/lib/data/therapist-assignments/queries";
import { isAssignmentActive } from "@/lib/data/therapist-assignments/active";
import { logClinicalAccessAttempt } from "./clinical-access-audit";
import type {
  ClinicalAccessAction,
  ClinicalAccessDenialReason,
  ClinicalAccessResult,
  ClinicalAccessScope,
} from "./types";

const MGMT: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const SUP: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];

function isClinicalDirector(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => MGMT.includes(r));
}

function isSupervisor(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SUP.includes(r));
}

function isTherapist(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("THERAPIST");
}

function isSecretaryOnly(roleCodes: RoleCode[]): boolean {
  return (
    roleCodes.includes("RECEPTION") &&
    !roleCodes.some((r) => [...MGMT, ...SUP, "THERAPIST"].includes(r))
  );
}

const DENIAL_MESSAGES: Record<string, string> = {
  no_assignment:
    "Δεν έχετε ενεργή ανάθεση για αυτό το παιδί. Επικοινωνήστε με τον επόπτη ή τη διοίκηση.",
  assignment_ended: "Η ανάθεσή σας για αυτό το παιδί έχει λήξει.",
  assignment_suspended: "Η ανάθεση είναι σε αναστολή.",
  role: "Ο ρόλος σας δεν επιτρέπει πρόσβαση σε αυτό το κλινικό περιεχόμενο.",
  secretary_clinical:
    "Η γραμματεία δεν έχει πρόσβαση σε κλινικά σημειώματα ή κλινικό φάκελο.",
  parent_not_linked: "Δεν έχετε σύνδεση με αυτό το παιδί στο γονικό portal.",
  unauthenticated: "Απαιτείται σύνδεση.",
};

function denied(
  reason: ClinicalAccessDenialReason,
  audit?: {
    scope: ClinicalAccessScope;
    childId: string;
    action: ClinicalAccessAction;
  }
): ClinicalAccessResult {
  if (audit) {
    logClinicalAccessAttempt({
      organizationId: audit.scope.organizationId,
      userId: audit.scope.userId,
      childId: audit.childId,
      resourceType: "child_profile",
      action: "denied",
      denialReason: reason,
    });
  }
  return {
    allowed: false,
    reason,
    messageEl: DENIAL_MESSAGES[reason] ?? DENIAL_MESSAGES.role,
  };
}

/**
 * Authoritative clinical access check — assignments only for therapists (not sessions).
 */
export async function assertClinicalChildAccess(
  scope: ClinicalAccessScope,
  childId: string,
  action: ClinicalAccessAction
): Promise<ClinicalAccessResult> {
  const { roleCodes, userId, assignedChildIds, supervisorScopedChildIds, parentChildIds } =
    scope;

  if (!userId && roleCodes.length === 0) {
    return denied("unauthenticated");
  }

  if (isParentOnly(roleCodes)) {
    if (action === "read" && parentChildIds.includes(childId)) {
      return { allowed: true, mode: "parent", canViewConfidential: false };
    }
    return denied("parent_not_linked", { scope, childId, action });
  }

  if (isSecretaryOnly(roleCodes)) {
    if (action === "read" || action === "write" || action === "confidential_read") {
      return denied("secretary_clinical", { scope, childId, action });
    }
    return denied("role", { scope, childId, action });
  }

  if (isClinicalDirector(roleCodes)) {
    return {
      allowed: true,
      mode: "clinical_director",
      canViewConfidential: true,
    };
  }

  if (isSupervisor(roleCodes) && !isTherapist(roleCodes)) {
    if (supervisorScopedChildIds.includes(childId)) {
      return {
        allowed: true,
        mode: "supervisor",
        canViewConfidential: true,
      };
    }
    const allOnChild = await listAssignmentsForChild({
      organizationId: scope.organizationId,
      childId,
      includeEnded: false,
    });
    if (allOnChild.some((a) => a.supervisorUserId === userId)) {
      return {
        allowed: true,
        mode: "supervisor",
        canViewConfidential: true,
      };
    }
    if (action === "assign") {
      return { allowed: true, mode: "supervisor", canViewConfidential: true };
    }
    return denied("role", { scope, childId, action });
  }

  if (isSupervisor(roleCodes) && supervisorScopedChildIds.includes(childId)) {
    return {
      allowed: true,
      mode: "supervisor",
      canViewConfidential: true,
    };
  }

  if (isTherapist(roleCodes) && userId) {
    const assignment = await getActiveAssignmentForTherapistChild({
      organizationId: scope.organizationId,
      therapistUserId: userId,
      childId,
    });

    if (!assignment) {
      const historical = await listAssignmentsForChild({
        organizationId: scope.organizationId,
        childId,
        includeEnded: true,
      });
      const mine = historical.find((a) => a.therapistUserId === userId);
      if (mine && mine.status === "ended") {
        return denied("assignment_ended", { scope, childId, action });
      }
      if (mine && mine.status === "suspended") {
        return denied("assignment_suspended", { scope, childId, action });
      }
      if (!assignedChildIds.includes(childId)) {
        return denied("no_assignment", { scope, childId, action });
      }
      return denied("no_assignment", { scope, childId, action });
    }

    if (!isAssignmentActive(assignment)) {
      return denied("assignment_ended", { scope, childId, action });
    }

    if (assignment.assignmentRole === "supervisor_oversight" && action === "write") {
      return denied("role", { scope, childId, action });
    }

    const canViewConfidential =
      assignment.canViewConfidential || isSupervisor(roleCodes) || isClinicalDirector(roleCodes);

    if (action === "confidential_read" && !canViewConfidential) {
      return denied("role", { scope, childId, action });
    }

    return {
      allowed: true,
      mode: isSupervisor(roleCodes) ? "supervisor" : "therapist",
      assignmentId: assignment.id,
      assignment,
      canViewConfidential,
    };
  }

  return denied("role", { scope, childId, action });
}

export async function assertClinicalChildAccessOrThrow(
  scope: ClinicalAccessScope,
  childId: string,
  action: ClinicalAccessAction
): Promise<Extract<ClinicalAccessResult, { allowed: true }>> {
  const result = await assertClinicalChildAccess(scope, childId, action);
  if (!result.allowed) {
    throw new Error(result.messageEl);
  }
  return result;
}

export function clinicalAccessDeniedMessage(result: ClinicalAccessResult): string {
  if (result.allowed) return "";
  return result.messageEl;
}
