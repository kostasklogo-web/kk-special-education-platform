import type { PaymentStatus } from "@/lib/secretary/types";
import {
  PAYMENT_DISPLAY_STATUS_LABELS,
  PAYMENT_STATUS_BADGE_CLASS,
} from "@/lib/secretary/payments/labels";
import { isManagementReviewStatus } from "@/lib/secretary/payments/calculations";

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const dark = isManagementReviewStatus(status) || status === "overdue_60_plus";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${PAYMENT_STATUS_BADGE_CLASS[status]} ${dark ? "ring-1 ring-red-900/30" : ""}`}
    >
      {PAYMENT_DISPLAY_STATUS_LABELS[status]}
    </span>
  );
}
