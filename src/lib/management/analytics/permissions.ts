import type { RoleCode } from "@/lib/auth/roles";

const FULL_ANALYTICS_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const LIMITED_ANALYTICS_ROLES: RoleCode[] = ["RECEPTION"];

export function canViewManagementAnalytics(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => [...FULL_ANALYTICS_ROLES, ...LIMITED_ANALYTICS_ROLES].includes(r));
}

export function canViewFullManagementAnalytics(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => FULL_ANALYTICS_ROLES.includes(r));
}

export function canViewFinancialAnalytics(roleCodes: RoleCode[]): boolean {
  return canViewFullManagementAnalytics(roleCodes);
}

export function analyticsAccessLabel(roleCodes: RoleCode[]): string {
  if (canViewFullManagementAnalytics(roleCodes)) {
    return "Πλήρης πρόσβαση (Διοίκηση / CEO)";
  }
  if (roleCodes.some((r) => LIMITED_ANALYTICS_ROLES.includes(r))) {
    return "Περιορισμένη πρόσβαση (Γραμματεία — λειτουργικά)";
  }
  return "Χωρίς πρόσβαση";
}
