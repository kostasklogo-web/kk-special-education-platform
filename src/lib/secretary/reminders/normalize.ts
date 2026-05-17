import type { ReminderRecord } from "./types";
import type { TaskPriority } from "@/lib/secretary/types";
import type { ReminderTypeCode } from "./catalog";
import { reminderTypeForTemplate } from "./catalog";

export type EnrichedReminder = ReminderRecord & {
  reminderTypeCode: ReminderTypeCode;
  priority: TaskPriority;
  parentLabel: string | null;
  locationCode: string | null;
  linkedAppointmentId: string | null;
  linkedPaymentId: string | null;
  linkedDiagnosisId: string | null;
  linkedReportId: string | null;
  linkedTaskId: string | null;
  createdByLabel: string;
  completedByLabel: string | null;
  completedAt: string | null;
  scheduledDate: string | null;
  scheduledTime: string | null;
  isOverdue: boolean;
  isDueToday: boolean;
};

export function normalizeReminder(
  partial: Partial<EnrichedReminder> & Pick<ReminderRecord, "id" | "templateCode">,
  todayYmd: string
): EnrichedReminder {
  const scheduledFor = partial.scheduledFor ?? null;
  const scheduledDate = scheduledFor?.slice(0, 10) ?? partial.scheduledDate ?? null;
  const scheduledTime =
    scheduledFor && scheduledFor.length > 10
      ? scheduledFor.slice(11, 16)
      : partial.scheduledTime ?? null;

  const status = partial.status ?? "pending";
  const isOverdue =
    partial.isOverdue ??
    (["pending", "scheduled"].includes(status) &&
      scheduledDate !== null &&
      scheduledDate < todayYmd);
  const isDueToday =
    partial.isDueToday ?? (scheduledDate === todayYmd || (!scheduledDate && status === "pending"));

  const entityType = partial.entityType ?? "child";
  const linked = entityLinksFromEntity(entityType, partial.entityId ?? "");

  return {
    id: partial.id,
    organizationId: partial.organizationId ?? "",
    templateCode: partial.templateCode,
    templateLabel: partial.templateLabel ?? partial.templateCode,
    channel: partial.channel ?? "sms",
    status,
    recipientName: partial.recipientName ?? "Γονέας",
    recipientPhone: partial.recipientPhone ?? null,
    recipientEmail: partial.recipientEmail ?? null,
    childId: partial.childId ?? null,
    childLabel: partial.childLabel ?? null,
    parentId: partial.parentId ?? null,
    messageBody: partial.messageBody ?? "",
    scheduledFor,
    sentAt: partial.sentAt ?? null,
    copiedAt: partial.copiedAt ?? null,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    reminderTypeCode: partial.reminderTypeCode ?? reminderTypeForTemplate(partial.templateCode),
    priority: partial.priority ?? "normal",
    parentLabel: partial.parentLabel ?? partial.recipientName ?? null,
    locationCode: partial.locationCode ?? null,
    linkedAppointmentId: partial.linkedAppointmentId ?? linked.linkedAppointmentId,
    linkedPaymentId: partial.linkedPaymentId ?? linked.linkedPaymentId,
    linkedDiagnosisId: partial.linkedDiagnosisId ?? linked.linkedDiagnosisId,
    linkedReportId: partial.linkedReportId ?? linked.linkedReportId,
    linkedTaskId: partial.linkedTaskId ?? linked.linkedTaskId,
    createdByLabel: partial.createdByLabel ?? "Γραμματεία",
    completedByLabel: partial.completedByLabel ?? null,
    completedAt: partial.completedAt ?? null,
    scheduledDate,
    scheduledTime,
    isOverdue,
    isDueToday,
    entityType,
    entityId: partial.entityId ?? partial.id,
  };
}

function entityLinksFromEntity(
  entityType: ReminderRecord["entityType"],
  entityId: string
): {
  linkedAppointmentId: string | null;
  linkedPaymentId: string | null;
  linkedDiagnosisId: string | null;
  linkedReportId: string | null;
  linkedTaskId: string | null;
} {
  switch (entityType) {
    case "appointment":
      return { linkedAppointmentId: entityId, linkedPaymentId: null, linkedDiagnosisId: null, linkedReportId: null, linkedTaskId: null };
    case "payment":
      return { linkedAppointmentId: null, linkedPaymentId: entityId, linkedDiagnosisId: null, linkedReportId: null, linkedTaskId: null };
    case "diagnosis":
      return { linkedAppointmentId: null, linkedPaymentId: null, linkedDiagnosisId: entityId, linkedReportId: null, linkedTaskId: null };
    case "report":
      return { linkedAppointmentId: null, linkedPaymentId: null, linkedDiagnosisId: null, linkedReportId: entityId, linkedTaskId: null };
    case "task":
      return { linkedAppointmentId: null, linkedPaymentId: null, linkedDiagnosisId: null, linkedReportId: null, linkedTaskId: entityId };
    default:
      return { linkedAppointmentId: null, linkedPaymentId: null, linkedDiagnosisId: null, linkedReportId: null, linkedTaskId: null };
  }
}
