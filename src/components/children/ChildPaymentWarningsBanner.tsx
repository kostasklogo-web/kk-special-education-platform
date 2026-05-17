"use client";

import Link from "next/link";
import { AlertTriangle, Wallet } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import {
  MANAGEMENT_REVIEW_LABEL,
  worstChargeForChild,
  paymentWarningSummary,
  isOverdueCharge,
} from "@/lib/secretary/payments/payment-warnings";

type Props = {
  childId: string;
};

export function ChildPaymentWarningsBanner({ childId }: Props) {
  const today = todayAthensYmd();
  const charges = usePaymentCharges();
  const charge = worstChargeForChild(charges, childId, today);

  if (!charge) return null;

  const summary = paymentWarningSummary(charge, today);
  const overdue = isOverdueCharge(charge, today);

  return (
    <div
      className={`flex flex-wrap items-start gap-3 rounded-xl border px-4 py-3 ${
        summary.managementReview
          ? "border-red-900/40 bg-red-950/10"
          : overdue
            ? "border-red-200 bg-red-50"
            : "border-amber-200 bg-amber-50"
      }`}
      role="alert"
    >
      <AlertTriangle
        className={`h-5 w-5 shrink-0 ${summary.managementReview ? "text-red-900" : overdue ? "text-red-700" : "text-amber-700"}`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">
          {summary.managementReview ? MANAGEMENT_REVIEW_LABEL : overdue ? "Καθυστερημένο υπόλοιπο" : "Εκκρεμής πληρωμή"}
        </p>
        <p className="text-sm text-ink-muted">{summary.detail}</p>
      </div>
      <Link
        href={`/secretary/payments?child=${encodeURIComponent(charge.childLabel)}`}
        className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-border bg-white px-3 text-sm font-semibold text-clinical-700 shadow-sm hover:bg-clinical-50"
      >
        <Wallet className="h-4 w-4" />
        Πληρωμές
      </Link>
    </div>
  );
}
