import type { RoleCode } from "@/lib/auth/roles";

/** Διοίκηση / Ιδιοκτήτης + Γραμματεία: full CRUD on children (per RLS). */
export function canMutateChildren(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c)
  );
}

/** Επόπτης, Θεραπευτής, Διοίκηση, Γραμματεία: read access where RLS allows. */
export function canViewChildrenModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

export function isParentOnly(roleCodes: RoleCode[]): boolean {
  return roleCodes.length === 1 && roleCodes[0] === "PARENT";
}

export function canAccessChildForms(roleCodes: RoleCode[]): boolean {
  return canMutateChildren(roleCodes);
}
