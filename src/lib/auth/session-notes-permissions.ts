import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";

export function canAccessSessionNotesModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

/** Διοίκηση (χωρίς γραμματεία) — κλινική εγγραφή σημειώσεων. */
export function canManagementSessionNotes(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => c === "ORG_OWNER" || c === "ORG_ADMIN");
}

/** Κλινική εγγραφή: διοίκηση ή θεραπευτής (συμβατό με RLS μετά τη μετάβαση). Όχι γραμματεία. */
export function canWriteSessionNotes(roleCodes: RoleCode[]): boolean {
  if (canManagementSessionNotes(roleCodes)) return true;
  return roleCodes.includes("THERAPIST");
}

export function isSupervisorReadOnlySessionNotes(roleCodes: RoleCode[]): boolean {
  return roleCodes.includes("SUPERVISOR") && !canWriteSessionNotes(roleCodes);
}

export function canEditSessionNote(
  roleCodes: RoleCode[],
  userId: string | null,
  sessionTherapistUserId: string,
  authorUserId: string
): boolean {
  if (!userId) return false;
  if (canManagementSessionNotes(roleCodes)) return true;
  if (!roleCodes.includes("THERAPIST")) return false;
  return sessionTherapistUserId === userId && authorUserId === userId;
}
