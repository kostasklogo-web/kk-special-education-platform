import type { RoleCode } from "@/lib/auth/roles";

const SECRETARY: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"];
const CEO: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const CLINICAL_VIEW: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];

export function canViewReminders(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r) || CLINICAL_VIEW.includes(r));
}

export function canManageReminders(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r));
}

export function canEditReminderTemplates(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r));
}

export function canSendParentReminders(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r));
}

export function canArchiveReminders(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r));
}

export function canExportReminders(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r));
}
