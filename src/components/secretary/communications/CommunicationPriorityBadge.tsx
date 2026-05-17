import type { TaskPriority } from "@/lib/secretary/types";
import {
  COMMUNICATION_PRIORITY_BADGE_CLASS,
  COMMUNICATION_PRIORITY_LABELS,
} from "@/lib/secretary/communications/labels";

export function CommunicationPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${COMMUNICATION_PRIORITY_BADGE_CLASS[priority]}`}
    >
      {COMMUNICATION_PRIORITY_LABELS[priority]}
    </span>
  );
}
