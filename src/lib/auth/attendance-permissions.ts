import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";
import { canMutateSchedule } from "@/lib/auth/schedule-permissions";

export function canAccessAttendanceModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

/** Γραμματεία / διοίκηση ή θεραπευτής μόνο για τη δική του συνεδρία (συμπίπτει με RLS). */
export function canRecordAttendanceForSession(
  roleCodes: RoleCode[],
  userId: string | null,
  sessionTherapistUserId: string
): boolean {
  if (!userId) return false;
  if (canMutateSchedule(roleCodes)) return true;
  if (roleCodes.includes("THERAPIST") && sessionTherapistUserId === userId) return true;
  return false;
}
