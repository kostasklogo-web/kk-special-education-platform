import { isParentOnly } from "@/lib/auth/children-permissions";
import type { RoleCode } from "@/lib/auth/roles";

export function canAccessRoomsModule(roleCodes: RoleCode[]): boolean {
  if (roleCodes.length === 0) return false;
  return !isParentOnly(roleCodes);
}

/** Διοίκηση ή γραμματεία — πλήρης διαχείριση αιθουσών (RLS περιορίζει κέντρα γραμματείας). */
export function canWriteRooms(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

/** Επόπτης ή θεραπευτής — μόνο προβολή. */
export function isRoomsClinicalReadOnly(roleCodes: RoleCode[]): boolean {
  return (
    (roleCodes.includes("SUPERVISOR") || roleCodes.includes("THERAPIST")) && !canWriteRooms(roleCodes)
  );
}
