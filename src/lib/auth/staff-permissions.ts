import { isParentOnly } from "@/lib/auth/children-permissions";
import { isManagement } from "@/lib/auth/roles";
import type { RoleCode } from "@/lib/auth/roles";

export function canAccessStaffModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

/** Διοίκηση ή γραμματεία — δημιουργία/επεξεργασία εγγραφής προσωπικού (όχι ρόλου για γραμματεία). */
export function canWriteStaffRecord(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

export function canManageStaffRoles(roleCodes: RoleCode[]): boolean {
  return isManagement(roleCodes);
}

export function isSupervisorStaffReadOnly(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("SUPERVISOR") && !canWriteStaffRecord(roleCodes);
}

export function isTherapistStaffSelfOnly(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("THERAPIST") && !canWriteStaffRecord(roleCodes) && !roleCodes.includes("SUPERVISOR");
}
