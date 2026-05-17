import type { RoleCode } from "@/lib/auth/roles";
import { canPerformGdprAction } from "@/lib/gdpr/permissions";

const SECRETARY_MUTATE: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"];
const VIEW_ALL: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"];
const EXPORT_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"];
const ARCHIVE_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];

export function canViewDiagnoses(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => VIEW_ALL.includes(r) || r === "THERAPIST");
}

export function canManageDiagnoses(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY_MUTATE.includes(r));
}

export function canExportDiagnosisReports(roleCodes: RoleCode[]): boolean {
  return canPerformGdprAction("export", "diagnoses", { roleCodes, userId: null });
}

export function canArchiveDiagnosis(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => ARCHIVE_ROLES.includes(r));
}
