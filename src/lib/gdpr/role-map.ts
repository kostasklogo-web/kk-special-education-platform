import type { RoleCode } from "@/lib/auth/roles";
import { primaryRoleCode } from "@/lib/auth/roles";
import type { GdprRole } from "./types";

export function gdprRolesFromCodes(roleCodes: RoleCode[]): GdprRole[] {
  const roles = new Set<GdprRole>();
  if (roleCodes.includes("ORG_OWNER")) roles.add("ceo");
  if (roleCodes.includes("ORG_ADMIN")) {
    roles.add("general_manager");
    roles.add("clinical_director");
  }
  if (roleCodes.includes("RECEPTION")) roles.add("secretary");
  if (roleCodes.includes("SUPERVISOR")) {
    roles.add("supervisor");
    roles.add("clinical_director");
  }
  if (roleCodes.includes("THERAPIST")) roles.add("therapist");
  if (roleCodes.includes("PARENT")) roles.add("parent");
  return [...roles];
}

export function primaryGdprRole(roleCodes: RoleCode[]): GdprRole {
  const code = primaryRoleCode(roleCodes);
  switch (code) {
    case "ORG_OWNER":
      return "ceo";
    case "ORG_ADMIN":
      return "general_manager";
    case "RECEPTION":
      return "secretary";
    case "SUPERVISOR":
      return "supervisor";
    case "THERAPIST":
      return "therapist";
    case "PARENT":
      return "parent";
    default:
      return "secretary";
  }
}

export function roleCodesIncludeManagement(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => ["ORG_OWNER", "ORG_ADMIN"].includes(r));
}

export function roleCodesIncludeClinicalLead(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"].includes(r));
}
