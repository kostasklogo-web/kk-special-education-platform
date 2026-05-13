import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";

/** Ρυθμίσεις & κέντρα: μόνο διοίκηση και γραμματεία (MVP). */
export function canAccessSettingsAndCentersModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  if (isParentOnly(roleCodes)) return false;
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

/** Πλήρης διαχείριση κέντρων (δημιουργία / επεξεργασία). */
export function canManageCenters(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => c === "ORG_OWNER" || c === "ORG_ADMIN");
}

/** Γραμματεία: μόνο προβολή κέντρων στο module ρυθμίσεων. */
export function isReceptionCentersReadOnly(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("RECEPTION") && !canManageCenters(roleCodes);
}
