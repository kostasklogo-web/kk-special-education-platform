import type { PaymentObligation } from "@/lib/secretary/types";
import { isManagementReviewStatus, overdueDays } from "./calculations";
import { PAYMENT_DISPLAY_STATUS_LABELS } from "./labels";

export const MANAGEMENT_REVIEW_LABEL = "Απαιτείται έλεγχος διοίκησης";

export function isOverdueCharge(charge: PaymentObligation, todayYmd: string): boolean {
  if (charge.balance <= 0) return false;
  return overdueDays(charge.dueDate, todayYmd) >= 1 || charge.paymentStatus.startsWith("overdue");
}

export function requiresManagementReview(charge: PaymentObligation, todayYmd: string): boolean {
  if (charge.balance <= 0) return false;
  return (
    charge.escalatedToManagement ||
    isManagementReviewStatus(charge.paymentStatus) ||
    overdueDays(charge.dueDate, todayYmd) > 60
  );
}

export function chargesForChild(charges: PaymentObligation[], childId: string): PaymentObligation[] {
  return charges.filter((c) => c.childId === childId && c.balance > 0);
}

export function worstChargeForChild(
  charges: PaymentObligation[],
  childId: string,
  todayYmd: string
): PaymentObligation | null {
  const list = chargesForChild(charges, childId);
  if (list.length === 0) return null;
  return list.sort((a, b) => {
    const mgmt = Number(requiresManagementReview(b, todayYmd)) - Number(requiresManagementReview(a, todayYmd));
    if (mgmt !== 0) return mgmt;
    return b.balance - a.balance;
  })[0];
}

export function paymentWarningSummary(
  charge: PaymentObligation,
  todayYmd: string
): { title: string; detail: string; managementReview: boolean } {
  if (requiresManagementReview(charge, todayYmd)) {
    return {
      title: MANAGEMENT_REVIEW_LABEL,
      detail: `${charge.childLabel}: υπόλοιπο ${charge.balance}€ · ${PAYMENT_DISPLAY_STATUS_LABELS[charge.paymentStatus]}`,
      managementReview: true,
    };
  }
  if (isOverdueCharge(charge, todayYmd)) {
    return {
      title: "Καθυστερημένη πληρωμή",
      detail: `${charge.childLabel}: ${charge.balance}€ · λήξη ${charge.dueDate}`,
      managementReview: false,
    };
  }
  return {
    title: "Εκκρεμής πληρωμή",
    detail: `${charge.childLabel}: ${charge.balance}€`,
    managementReview: false,
  };
}

export function paymentAlertsFromCharges(
  charges: PaymentObligation[],
  todayYmd: string
): { id: string; title: string; detail: string; alertLevel: "red" | "yellow"; href: string }[] {
  const seen = new Set<string>();
  const alerts: { id: string; title: string; detail: string; alertLevel: "red" | "yellow"; href: string }[] = [];

  for (const c of charges) {
    if (c.balance <= 0 || seen.has(c.childId)) continue;
    seen.add(c.childId);
    const w = paymentWarningSummary(c, todayYmd);
    if (!isOverdueCharge(c, todayYmd) && c.paymentStatus !== "due_soon" && c.paymentStatus !== "partially_paid") {
      continue;
    }
    alerts.push({
      id: `pay-alert-${c.id}`,
      title: w.title,
      detail: w.detail,
      alertLevel: w.managementReview || isOverdueCharge(c, todayYmd) ? "red" : "yellow",
      href: `/secretary/payments?child=${encodeURIComponent(c.childLabel)}`,
    });
  }
  return alerts.slice(0, 8);
}
