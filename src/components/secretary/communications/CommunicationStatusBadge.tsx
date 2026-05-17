import type { CommunicationStatus } from "@/lib/secretary/types";
import {
  COMMUNICATION_STATUS_BADGE_CLASS,
  COMMUNICATION_STATUS_LABELS,
} from "@/lib/secretary/communications/labels";

export function CommunicationStatusBadge({ status }: { status: CommunicationStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${COMMUNICATION_STATUS_BADGE_CLASS[status]}`}
    >
      {COMMUNICATION_STATUS_LABELS[status]}
    </span>
  );
}
