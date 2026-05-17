import type { ReminderStatus } from "@/lib/secretary/reminders/types";
import { REMINDER_STATUS_LABELS_EXT, REMINDER_STATUS_BADGE } from "@/lib/secretary/reminders/labels";

export function ReminderStatusBadge({
  status,
  overdue,
}: {
  status: ReminderStatus | string;
  overdue?: boolean;
}) {
  const key = overdue && status === "pending" ? "overdue" : status;
  const label = REMINDER_STATUS_LABELS_EXT[key as keyof typeof REMINDER_STATUS_LABELS_EXT] ?? status;
  const style = REMINDER_STATUS_BADGE[key] ?? REMINDER_STATUS_BADGE.pending;
  return (
    <span className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${style}`}>
      {label}
    </span>
  );
}
