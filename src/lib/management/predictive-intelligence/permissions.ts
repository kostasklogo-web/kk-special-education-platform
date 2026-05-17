import type { RoleCode } from "@/lib/auth/roles";

/** CEO, Management, Clinical Director (ORG_ADMIN) */
const PREDICTIVE_INTEL_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];

export function canViewPredictiveIntelligence(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => PREDICTIVE_INTEL_ROLES.includes(r));
}

export function predictiveIntelAccessLabel(roleCodes: RoleCode[]): string {
  if (canViewPredictiveIntelligence(roleCodes)) {
    return "Πλήρης πρόσβαση (CEO / Διοίκηση / Κλινική Διεύθυνση)";
  }
  return "Χωρίς πρόσβαση — εμπιστευτική πρόβλεψη";
}
