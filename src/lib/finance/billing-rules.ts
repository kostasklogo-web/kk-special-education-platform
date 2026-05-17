/**
 * Session billing rules — prototype tariffs for schedule-linked revenue.
 */

import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import type { SessionBillingType } from "./types";

/** Base tariffs (€) — indicative multidisciplinary center rates. */
export const BILLING_TARIFFS = {
  individual_45: 45,
  clinical_50: 55,
  group_90: 90,
  evaluation: 75,
  parent_counseling: 50,
  makeup: 45,
} as const;

const NON_BILLABLE_DISCIPLINES = new Set(["brk", "sup"]);
const CLINICAL_50_DISCIPLINES = new Set(["lead", "psy"]);

export function durationMinutesFromBlock(b: ControlBoardBlock): number {
  const ms = Date.parse(b.ends_at) - Date.parse(b.starts_at);
  return Math.max(1, Math.round(ms / 60_000));
}

export function classifyBillingType(b: ControlBoardBlock): SessionBillingType {
  if (b.disciplineCode === "brk" || NON_BILLABLE_DISCIPLINES.has(b.disciplineCode)) {
    return b.sessionKind === "supervision" ? "supervision" : "non_billable";
  }
  if (b.sessionKind === "supervision") return "supervision";
  if (b.status === "cancelled") return "cancelled";
  if (b.status === "absence") return "absence";
  if (b.sessionKind === "group") return "group_90";
  if (b.sessionKind === "assessment") return "evaluation";
  if (b.sessionKind === "parent_counseling" || b.disciplineCode === "par") return "parent_counseling";
  const dur = durationMinutesFromBlock(b);
  if (CLINICAL_50_DISCIPLINES.has(b.disciplineCode) && dur >= 48) return "clinical_50";
  if (b.status === "to_reschedule") return "makeup";
  if (dur >= 85) return "group_90";
  return "individual_45";
}

export function isBlockBillable(b: ControlBoardBlock, billingType: SessionBillingType): boolean {
  if (billingType === "non_billable" || billingType === "supervision") return false;
  if (b.disciplineCode === "brk") return false;
  if (billingType === "cancelled") return false;
  return true;
}

/** Expected charge before payment allocation. */
export function expectedChargeForBlock(b: ControlBoardBlock, billingType: SessionBillingType): number {
  if (!isBlockBillable(b, billingType)) return 0;
  switch (billingType) {
    case "absence":
      return Math.round(BILLING_TARIFFS.individual_45 * 0.5);
    case "cancelled":
      return 0;
    case "individual_45":
      return BILLING_TARIFFS.individual_45;
    case "clinical_50":
      return BILLING_TARIFFS.clinical_50;
    case "group_90":
      return BILLING_TARIFFS.group_90;
    case "evaluation":
      return BILLING_TARIFFS.evaluation;
    case "parent_counseling":
      return BILLING_TARIFFS.parent_counseling;
    case "makeup":
      return BILLING_TARIFFS.makeup;
    default:
      return BILLING_TARIFFS.individual_45;
  }
}

/** Turnover / invoiced amount for the session (policy layer). */
export function invoicedAmountForBlock(
  b: ControlBoardBlock,
  billingType: SessionBillingType,
  expected: number
): number {
  if (billingType === "cancelled" || billingType === "non_billable" || billingType === "supervision") {
    return 0;
  }
  if (billingType === "absence") return expected;
  if (b.status === "no_show") return expected;
  return expected;
}

export const BILLING_TYPE_LABELS: Record<SessionBillingType, string> = {
  individual_45: "Ατομική 45′",
  clinical_50: "Κλινική / Ψυχ. 50′",
  group_90: "Ομαδική 90′",
  evaluation: "Αξιολόγηση",
  parent_counseling: "Συμβουλευτική γονέων",
  makeup: "Αναπληρωματική",
  cancelled: "Ακυρωμένη",
  absence: "Απουσία",
  supervision: "Εποπτεία (μη χρεώσιμη)",
  non_billable: "Μη χρεώσιμη",
};
