import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";
import {
  canEditClinicalNoteField,
  canViewClinicalNoteField,
} from "@/lib/gdpr/permissions";

export function canViewClinicalChildProfile(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

export function canViewSupervisionSection(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"].includes(c)
  );
}

export function canViewInterdisciplinarySection(roleCodes: RoleCode[]): boolean {
  return canViewClinicalChildProfile(roleCodes);
}

/** Secretary may open identity only — not clinical note bodies (GDPR). */
export function canViewSessionNoteClinicalBody(roleCodes: RoleCode[]): boolean {
  if (isParentOnly(roleCodes)) return false;
  if (roleCodes.includes("RECEPTION") && !roleCodes.some((c) => ["THERAPIST", "SUPERVISOR", "ORG_OWNER", "ORG_ADMIN"].includes(c))) {
    return false;
  }
  return canViewClinicalNoteField("session_notes", roleCodes);
}

export function canViewSupervisionNotes(roleCodes: RoleCode[]): boolean {
  return canViewClinicalNoteField("supervision_notes", roleCodes);
}

export function canSeeSecretaryOperationalLink(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

/** Management-level clinical comments on child record. */
export function canViewClinicalDirectorComments(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN"].includes(c));
}

export function clinicalRoleLabel(roleCodes: RoleCode[]): string {
  if (roleCodes.includes("ORG_OWNER") || roleCodes.includes("ORG_ADMIN")) return "Διοίκηση";
  if (roleCodes.includes("SUPERVISOR")) return "Επόπτης";
  if (roleCodes.includes("THERAPIST")) return "Θεραπευτής";
  if (roleCodes.includes("RECEPTION")) return "Γραμματεία (περιορισμένα)";
  return "Χρήστης";
}

export { canViewClinicalNoteField, canEditClinicalNoteField };
