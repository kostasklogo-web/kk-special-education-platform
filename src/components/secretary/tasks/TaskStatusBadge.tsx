import type { TaskStatus } from "@/lib/secretary/types";
import { TASK_STATUS_LABELS } from "@/lib/secretary/tasks/labels";
import { TASK_STATUS_BADGE_CLASS } from "@/lib/secretary/tasks/labels";

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${TASK_STATUS_BADGE_CLASS[status]}`}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
