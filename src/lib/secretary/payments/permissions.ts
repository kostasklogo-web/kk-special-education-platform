import type { RoleCode } from "@/lib/auth/roles";

export function canRegisterPayments(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"].includes(c));
}

export function canEditPaymentNotes(roleCodes: RoleCode[]): boolean {
  return canRegisterPayments(roleCodes);
}

export function canSendPaymentReminders(roleCodes: RoleCode[]): boolean {
  return canRegisterPayments(roleCodes);
}

export function canExportPaymentReports(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) =>
    ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"].includes(c)
  );
}

/** CEO / General Manager — expected amount & debt adjustments */
export function canManagePaymentCharges(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((c) => ["ORG_OWNER", "ORG_ADMIN"].includes(c));
}

export function canDeletePaymentHistory(_roleCodes: RoleCode[]): boolean {
  return false;
}

export function canForgiveDebt(_roleCodes: RoleCode[]): boolean {
  return false;
}
