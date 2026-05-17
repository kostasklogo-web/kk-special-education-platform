import type { RoleCode } from "@/lib/auth/roles";
import {
  secretaryNavItemByHref,
  secretaryNavItemsForRoles,
  secretaryRouteIdFromPathname,
  type SecretaryRouteId,
} from "@/lib/auth/secretary-nav";

/** Any sidebar item visible for this user. */
export function canAccessSecretaryModule(roleCodes: RoleCode[]): boolean {
  return secretaryNavItemsForRoles(roleCodes).length > 0;
}

export function canAccessSecretaryRoute(routeId: SecretaryRouteId, roleCodes: RoleCode[]): boolean {
  const item = secretaryNavItemsForRoles(roleCodes).find((i) => i.id === routeId);
  return !!item;
}

export function canAccessSecretaryPath(pathname: string, roleCodes: RoleCode[]): boolean {
  const routeId = secretaryRouteIdFromPathname(pathname);
  if (!routeId) return canAccessSecretaryModule(roleCodes);
  return canAccessSecretaryRoute(routeId, roleCodes);
}

export function canMutateSecretaryRoute(routeId: SecretaryRouteId, roleCodes: RoleCode[]): boolean {
  const item = secretaryNavItemsForRoles(roleCodes).find((i) => i.id === routeId);
  if (!item) return false;
  return item.mutateRoles.some((r) => roleCodes.includes(r));
}

export function canMutateSecretaryPath(pathname: string, roleCodes: RoleCode[]): boolean {
  const routeId = secretaryRouteIdFromPathname(pathname);
  if (!routeId) return canMutateSecretaryOperations(roleCodes);
  return canMutateSecretaryRoute(routeId, roleCodes);
}

/** Secretary desk operations (create/edit/delete). */
export function canMutateSecretaryOperations(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

export function secretaryReadOnlyForPath(pathname: string, roleCodes: RoleCode[]): boolean {
  return canAccessSecretaryPath(pathname, roleCodes) && !canMutateSecretaryPath(pathname, roleCodes);
}

export function secretaryPageAccess(pathname: string, roleCodes: RoleCode[]) {
  const item = secretaryNavItemByHref(pathname);
  const routeId = secretaryRouteIdFromPathname(pathname);
  return {
    canView: routeId ? canAccessSecretaryRoute(routeId, roleCodes) : canAccessSecretaryModule(roleCodes),
    canMutate: routeId ? canMutateSecretaryRoute(routeId, roleCodes) : canMutateSecretaryOperations(roleCodes),
    item,
  };
}

/** Clinical notes / report approval — not secretary. */
export function canAccessClinicalNotes(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR", "THERAPIST"].includes(c)
  );
}

export function canApproveClinicalReports(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"].includes(c));
}
