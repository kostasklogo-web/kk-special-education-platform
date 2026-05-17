"use client";

import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import {
  MANAGEMENT_REVIEW_LABEL,
  worstChargeForChild,
  requiresManagementReview,
  isOverdueCharge,
} from "@/lib/secretary/payments/payment-warnings";

type Props = {
  childId: string;
};

export function ChildProfilePaymentBadge({ childId }: Props) {
  const charges = usePaymentCharges();
  const charge = worstChargeForChild(charges, childId, todayAthensYmd());
  if (!charge) return null;

  const today = todayAthensYmd();
  const mgmt = requiresManagementReview(charge, today);
  const overdue = isOverdueCharge(charge, today);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${
        mgmt
          ? "border-red-900 bg-red-950 text-red-50"
          : overdue
            ? "border-red-300 bg-red-100 text-red-900"
            : "border-amber-300 bg-amber-100 text-amber-950"
      }`}
      title={`Υπόλοιπο ${charge.balance}€`}
    >
      {mgmt ? MANAGEMENT_REVIEW_LABEL : overdue ? "Καθυστέρηση πληρωμής" : "Εκκρεμής πληρωμή"}
    </span>
  );
}
