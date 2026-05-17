import type { TaskPriority } from "@/lib/secretary/types";
import { TASK_PRIORITY_LABELS, TASK_PRIORITY_BADGE_CLASS } from "@/lib/secretary/tasks/labels";

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${TASK_PRIORITY_BADGE_CLASS[priority]}`}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
