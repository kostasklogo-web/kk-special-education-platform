import type { RoleCode } from "@/lib/auth/roles";

const FULL_FINANCE_ROLES: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const LIMITED_FINANCE_ROLES: RoleCode[] = ["RECEPTION"];

/** Can open /secretary/finances at all. Therapists and supervisors are excluded. */
export function canViewFinancesModule(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => [...FULL_FINANCE_ROLES, ...LIMITED_FINANCE_ROLES].includes(r));
}

/** CEO / admin — full P&L, payroll, cash flow, all expenses. */
export function canViewFullFinances(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => FULL_FINANCE_ROLES.includes(r));
}

/** Secretary desk — collections, balances, transactions; sensitive aggregates masked in UI. */
export function canViewLimitedFinances(roleCodes: RoleCode[]): boolean {
  return (
    !canViewFullFinances(roleCodes) &&
    roleCodes.some((r) => LIMITED_FINANCE_ROLES.includes(r))
  );
}

export function financesAccessLabel(roleCodes: RoleCode[]): string {
  if (canViewFullFinances(roleCodes)) {
    return "Πλήρης πρόσβαση (Διοίκηση / CEO)";
  }
  if (canViewLimitedFinances(roleCodes)) {
    return "Περιορισμένη πρόσβαση (Γραμματεία)";
  }
  return "Χωρίς πρόσβαση";
}
