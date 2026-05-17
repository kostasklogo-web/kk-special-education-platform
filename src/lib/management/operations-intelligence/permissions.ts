import type { RoleCode } from "@/lib/auth/roles";

/** CEO + Management + Clinical leadership */
const FULL_OPS_INTEL_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];

/** Supervisors — clinical/scheduling/supervision; limited financial */
const LIMITED_OPS_INTEL_ROLES: RoleCode[] = ["SUPERVISOR"];

export function canViewOperationsIntelligence(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => [...FULL_OPS_INTEL_ROLES, ...LIMITED_OPS_INTEL_ROLES].includes(r));
}

export function canViewFullOperationsIntelligence(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => FULL_OPS_INTEL_ROLES.includes(r));
}

export function canViewFinancialOpsIntelligence(roleCodes: RoleCode[]): boolean {
  return canViewFullOperationsIntelligence(roleCodes);
}

export function opsIntelAccessLabel(roleCodes: RoleCode[]): string {
  if (canViewFullOperationsIntelligence(roleCodes)) {
    return "Πλήρης πρόσβαση (CEO / Διοίκηση / ΚΔ)";
  }
  if (roleCodes.some((r) => LIMITED_OPS_INTEL_ROLES.includes(r))) {
    return "Περιορισμένη πρόσβαση (Επόπτης — κλινικά & εποπτεία)";
  }
  return "Χωρίς πρόσβαση";
}
