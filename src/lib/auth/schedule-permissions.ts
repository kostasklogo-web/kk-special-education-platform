import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";

export function canEditExistingSession(
  roleCodes: RoleCode[],
  userId: string | null,
  therapistUserId: string
): boolean {
  if (!userId) return false;
  return (
    canMutateSchedule(roleCodes) ||
    (canTherapistEditOwnSessions(roleCodes) && therapistUserId === userId) ||
    isSupervisor(roleCodes)
  );
}

export function canAccessScheduleModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

export function canMutateSchedule(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c)
  );
}

export function canTherapistEditOwnSessions(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("THERAPIST");
}

export function isSupervisor(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("SUPERVISOR");
}
