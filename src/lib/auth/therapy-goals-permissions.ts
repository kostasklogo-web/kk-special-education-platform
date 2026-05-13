import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";

export function canAccessTherapyGoalsModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

/** Διοίκηση, επόπτης ή θεραπευτής — κλινική εγγραφή/επεξεργασία στόχων. Όχι γραμματεία. */
export function canWriteTherapyGoals(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR", "THERAPIST"].includes(c)
  );
}

/** Γραμματεία χωρίς κλινικό ρόλο: μόνο προβολή. */
export function isReceptionTherapyGoalsReadOnly(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("RECEPTION") && !canWriteTherapyGoals(roleCodes);
}
