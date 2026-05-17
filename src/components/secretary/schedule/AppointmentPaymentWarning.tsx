"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import {
  MANAGEMENT_REVIEW_LABEL,
  worstChargeForChild,
  paymentWarningSummary,
} from "@/lib/secretary/payments/payment-warnings";

type Props = {
  childId: string;
};

export function AppointmentPaymentWarning({ childId }: Props) {
  const today = todayAthensYmd();
  const charges = usePaymentCharges();
  const charge = worstChargeForChild(charges, childId, today);

  if (!charge) return null;

  const summary = paymentWarningSummary(charge, today);

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-sm ${
        summary.managementReview
          ? "border-red-900/50 bg-red-950/10 text-red-950"
          : "border-amber-300 bg-amber-50 text-amber-950"
      }`}
      role="alert"
    >
      <div className="flex gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p className="font-bold">
            {summary.managementReview ? MANAGEMENT_REVIEW_LABEL : "Προειδοποίηση πληρωμής"}
          </p>
          <p className="mt-0.5">{summary.detail}</p>
          <p className="mt-1 text-xs opacity-90">
            Γονέας: <strong>{charge.parentLabel ?? "—"}</strong>
          </p>
          <Link
            href={`/secretary/payments?child=${encodeURIComponent(charge.childLabel)}`}
            className="mt-2 inline-block text-xs font-semibold underline"
          >
            Άνοιγμα πληρωμών →
          </Link>
        </div>
      </div>
    </div>
  );
}
