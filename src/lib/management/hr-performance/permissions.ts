import type { RoleCode } from "@/lib/auth/roles";

const MANAGEMENT: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const SUPERVISOR: RoleCode[] = ["SUPERVISOR"];
const THERAPIST: RoleCode[] = ["THERAPIST"];

export function canViewHrPerformance(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => [...MANAGEMENT, ...SUPERVISOR, ...THERAPIST].includes(r));
}

export function canViewFullHrPerformance(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => MANAGEMENT.includes(r));
}

export function canViewSupervisorHrPerformance(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => [...MANAGEMENT, ...SUPERVISOR].includes(r));
}

export function canViewTherapistSelfHr(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => THERAPIST.includes(r));
}

export function canManageIncentives(roleCodes: RoleCode[]): boolean {
  return canViewFullHrPerformance(roleCodes);
}

export function canViewFinancialIncentives(roleCodes: RoleCode[]): boolean {
  return canViewFullHrPerformance(roleCodes);
}

export function hrPerformanceAccessLabel(roleCodes: RoleCode[]): string {
  if (canViewFullHrPerformance(roleCodes)) return "Διοίκηση — πλήρης πρόσβαση HR";
  if (roleCodes.some((r) => SUPERVISOR.includes(r))) return "Επόπτης — αξιολόγηση ομάδας";
  if (roleCodes.some((r) => THERAPIST.includes(r))) return "Θεραπευτής — προσωπικά KPIs μόνο";
  return "Χωρίς πρόσβαση";
}

export function resolveViewerTherapistId(
  roleCodes: RoleCode[],
  userId: string | null,
  demoTherapistMap: Record<string, string>
): string | null {
  if (canViewFullHrPerformance(roleCodes) || canViewSupervisorHrPerformance(roleCodes)) {
    return null;
  }
  if (userId && demoTherapistMap[userId]) return demoTherapistMap[userId];
  return "t1";
}
