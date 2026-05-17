import type { RoleCode } from "@/lib/auth/roles";
import type { ChildListItem } from "@/lib/data/children/types";
import type { ClinicalAccessScope } from "./types";

const MGMT: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const SUP: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];

function isTherapistScoped(roleCodes: RoleCode[]): boolean {
  return (
    roleCodes.includes("THERAPIST") &&
    !roleCodes.some((r) => [...MGMT, ...SUP].includes(r))
  );
}

function isSupervisorScoped(roleCodes: RoleCode[]): boolean {
  return (
    roleCodes.includes("SUPERVISOR") &&
    !roleCodes.some((r) => MGMT.includes(r))
  );
}

/** Restrict children list to assignment-based scope (never session-derived). */
export function filterChildrenForClinicalScope(
  items: ChildListItem[],
  scope: ClinicalAccessScope
): ChildListItem[] {
  const { roleCodes, assignedChildIds, supervisorScopedChildIds } = scope;

  if (roleCodes.some((r) => MGMT.includes(r))) {
    return items;
  }

  if (isSupervisorScoped(roleCodes) && supervisorScopedChildIds.length > 0) {
    const allowed = new Set(supervisorScopedChildIds);
    return items.filter((c) => allowed.has(c.id));
  }

  if (isTherapistScoped(roleCodes)) {
    const allowed = new Set(assignedChildIds);
    return items.filter((c) => allowed.has(c.id));
  }

  if (roleCodes.includes("SUPERVISOR") && supervisorScopedChildIds.length > 0) {
    const allowed = new Set(supervisorScopedChildIds);
    return items.filter((c) => allowed.has(c.id));
  }

  return items;
}
