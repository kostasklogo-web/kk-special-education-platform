import type { LeadStatus } from "@/lib/secretary/types";
import { LEAD_STATUS_BADGE_CLASS, LEAD_STATUS_LABELS } from "@/lib/secretary/intake/labels";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${LEAD_STATUS_BADGE_CLASS[status]}`}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
