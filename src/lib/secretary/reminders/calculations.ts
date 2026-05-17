import { addDaysAthensCalendar, todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { AutomationQueueItem, ReminderRecord } from "./types";
import { normalizeReminder, type EnrichedReminder } from "./normalize";
import { renderReminderMessage } from "./render-message";
import { REMINDER_PRIORITY_LABELS } from "./labels";
import { REMINDER_STATUS_LABELS_EXT } from "./labels";

export type ReminderDashboardMetrics = {
  dueToday: number;
  appointment: number;
  payment: number;
  paymentOverdue: number;
  diagnosis: number;
  report: number;
  evaluation: number;
  taskFollowup: number;
  failed: number;
  completedThisWeek: number;
};

export type UnifiedReminderRow = {
  rowId: string;
  source: "queue" | "record";
  queueItem?: AutomationQueueItem;
  record?: EnrichedReminder;
  childLabel: string;
  parentLabel: string;
  reminderTypeLabel: string;
  channel: string;
  status: string;
  priority: string;
  dueDate: string | null;
  dueTime: string | null;
  relatedLabel: string;
  isOverdue: boolean;
  isUrgent: boolean;
  payload?: import("@/components/secretary/reminders/reminder-payload").OpenReminderPayload;
};

export function enrichReminders(records: ReminderRecord[], todayYmd: string): EnrichedReminder[] {
  return records.map((r) => normalizeReminder(r as EnrichedReminder, todayYmd));
}

export function computeReminderMetrics(
  queue: AutomationQueueItem[],
  records: EnrichedReminder[],
  todayYmd: string
): ReminderDashboardMetrics {
  const weekStart = addDaysAthensCalendar(todayYmd, -7);
  const completed = records.filter(
    (r) =>
      ["sent", "copied", "completed"].includes(r.status as string) ||
      (r.status === "sent" || r.status === "copied")
  );
  const completedThisWeek = completed.filter((r) => {
    const d = (r.sentAt ?? r.copiedAt ?? r.completedAt ?? r.createdAt).slice(0, 10);
    return d >= weekStart && d <= todayYmd;
  }).length;

  return {
    dueToday: queue.length + records.filter((r) => r.isDueToday && ["pending", "scheduled"].includes(r.status)).length,
    appointment: queue.filter((q) => q.entityType === "appointment").length,
    payment: queue.filter((q) => q.entityType === "payment" && !q.templateCode.includes("overdue")).length,
    paymentOverdue: queue.filter((q) => q.entityType === "payment" && q.templateCode.includes("overdue")).length,
    diagnosis: queue.filter((q) => q.entityType === "diagnosis").length,
    report: queue.filter((q) => q.entityType === "report").length,
    evaluation: queue.filter((q) =>
      ["evaluation_reminder", "history_taking_reminder", "parent_info_reminder"].includes(q.templateCode)
    ).length,
    taskFollowup: queue.filter((q) => q.entityType === "task").length,
    failed: records.filter((r) => r.status === "failed").length,
    completedThisWeek,
  };
}

export function buildUnifiedRows(
  queue: AutomationQueueItem[],
  records: EnrichedReminder[],
  todayYmd: string
): UnifiedReminderRow[] {
  const rows: UnifiedReminderRow[] = [];

  for (const q of queue) {
    const body = renderReminderMessage(q.templateCode, q.context, q.suggestedChannel);
    rows.push({
      rowId: q.id,
      source: "queue",
      queueItem: q,
      childLabel: q.childLabel ?? "—",
      parentLabel: q.recipientName,
      reminderTypeLabel: q.templateLabel,
      channel: q.suggestedChannel,
      status: REMINDER_STATUS_LABELS_EXT.pending,
      priority: q.priority === "high" ? REMINDER_PRIORITY_LABELS.high : REMINDER_PRIORITY_LABELS.normal,
      dueDate: todayYmd,
      dueTime: null,
      relatedLabel: q.reason,
      isOverdue: false,
      isUrgent: q.priority === "high",
      payload: {
        templateCode: q.templateCode,
        entityType: q.entityType,
        entityId: q.entityId,
        childId: q.childId,
        childLabel: q.childLabel,
        recipientName: q.recipientName,
        recipientPhone: null,
        recipientEmail: null,
        context: q.context,
        suggestedChannel: q.suggestedChannel,
      },
    });
  }

  for (const r of records) {
    rows.push({
      rowId: r.id,
      source: "record",
      record: r,
      childLabel: r.childLabel ?? "—",
      parentLabel: r.parentLabel ?? r.recipientName,
      reminderTypeLabel: r.templateLabel,
      channel: r.channel,
      status:
        REMINDER_STATUS_LABELS_EXT[r.isOverdue && r.status === "pending" ? "overdue" : r.status] ?? r.status,
      priority: REMINDER_PRIORITY_LABELS[r.priority] ?? r.priority,
      dueDate: r.scheduledDate ?? r.createdAt.slice(0, 10),
      dueTime: r.scheduledTime,
      relatedLabel: r.templateLabel,
      isOverdue: r.isOverdue || r.status === "failed",
      isUrgent: r.priority === "urgent" || r.priority === "high",
    });
  }

  return rows.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    if (a.isUrgent !== b.isUrgent) return a.isUrgent ? -1 : 1;
    const da = a.dueDate ?? "9999";
    const db = b.dueDate ?? "9999";
    return da.localeCompare(db);
  });
}

export function isActiveReminderStatus(status: string): boolean {
  return ["pending", "scheduled", "failed"].includes(status);
}

export function isCompletedReminderStatus(status: string): boolean {
  return ["sent", "copied", "completed"].includes(status);
}
