import type { RoleCode } from "@/lib/auth/roles";
import { canPerformGdprAction } from "@/lib/gdpr/permissions";

const SECRETARY: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"];
const THERAPIST: RoleCode[] = ["THERAPIST"];
const SUPERVISOR: RoleCode[] = ["SUPERVISOR"];
const CLINICAL: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const CEO: RoleCode[] = ["ORG_OWNER"];

export function canViewReports(roleCodes: RoleCode[]): boolean {
  return roleCodes.some(
    (r) => SECRETARY.includes(r) || THERAPIST.includes(r) || SUPERVISOR.includes(r)
  );
}

export function canManageReports(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r));
}

export function canAssignTherapist(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r) || SUPERVISOR.includes(r));
}

export function canSubmitDraft(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => THERAPIST.includes(r) || SECRETARY.includes(r));
}

export function canSupervisorReview(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SUPERVISOR.includes(r) || SECRETARY.includes(r));
}

export function canClinicalDirectorApprove(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CLINICAL.includes(r));
}

export function canMarkDelivered(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r));
}

export function canExportReports(roleCodes: RoleCode[]): boolean {
  return canPerformGdprAction("export", "reports", { roleCodes, userId: null });
}

export function canArchiveReport(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r));
}

export function canOverrideWorkflow(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r));
}
