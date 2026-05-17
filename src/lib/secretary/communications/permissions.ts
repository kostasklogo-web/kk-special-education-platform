import type { RoleCode } from "@/lib/auth/roles";

export function canManageCommunications(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

export function canViewAllCommunications(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"].includes(c)
  );
}

export function canExportCommunicationReports(roleCodes: RoleCode[]): boolean {
  return canViewAllCommunications(roleCodes);
}
