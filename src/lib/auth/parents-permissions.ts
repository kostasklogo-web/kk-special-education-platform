import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";

export function canAccessParentsModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

/** Διοίκηση + Γραμματεία: πλήρης CRUD γονέων και σχέσεων (σύμφωνα με RLS). */
export function canMutateParents(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c)
  );
}

/** Επόπτης / Θεραπευτής: προβολή (RLS περιορίζει εγγραφές). */
export function canViewParentsReadOnly(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["SUPERVISOR", "THERAPIST"].includes(c));
}
