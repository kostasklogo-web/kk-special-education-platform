import { addDaysAthensCalendar, formatAthensTimeEl, todayAthensYmd } from "@/lib/schedule/athens-civil";
import { LOCATION_LABELS } from "@/lib/secretary/labels";
import type {
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  SecretaryAppointment,
  SecretaryTask,
} from "@/lib/secretary/types";
import { appointmentYmdAthens } from "@/lib/secretary/schedule-utils";
import { SECRETARY_CENTER_EMAIL, SECRETARY_CENTER_NAME, SECRETARY_CENTER_PHONE } from "./config";
import type { AutomationQueueItem, ReminderDashboardStats, ReminderRecord, ReminderTemplateCode } from "./types";
import { getTemplate } from "./templates";
import { diagnosisTemplateForDocument } from "@/lib/secretary/diagnoses/reminder-templates";
import type { ReminderMessageContext } from "./types";

function daysBetweenYmd(from: string, to: string): number {
  const a = Date.parse(`${from}T12:00:00.000Z`);
  const b = Date.parse(`${to}T12:00:00.000Z`);
  return Math.round((b - a) / 86400000);
}

function baseContext(recipientName: string, childName: string): ReminderMessageContext {
  return {
    parent_name: recipientName,
    recipient_name: recipientName,
    child_name: childName,
    center_phone: SECRETARY_CENTER_PHONE,
    center_email: SECRETARY_CENTER_EMAIL,
    center_name: SECRETARY_CENTER_NAME,
  };
}

function apptTemplate(code: SecretaryAppointment): ReminderTemplateCode {
  if (code.appointmentTypeCode === "evaluation" || code.appointmentTypeCode === "reevaluation")
    return "evaluation_reminder";
  if (code.appointmentTypeCode === "parent_info") return "parent_info_reminder";
  if (code.appointmentTypeCode === "history_taking") return "history_taking_reminder";
  if (code.appointmentTypeCode === "therapy_session") return "therapy_session_reminder";
  return "appointment_reminder_24h";
}

function buildApptContext(a: SecretaryAppointment, recipientName: string): ReminderMessageContext {
  return {
    ...baseContext(recipientName, a.childLabel ?? "—"),
    appointment_type: a.appointmentTypeLabel,
    appointment_date: new Intl.DateTimeFormat("el-GR", {
      timeZone: "Europe/Athens",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(a.startsAt)),
    appointment_time: formatAthensTimeEl(a.startsAt),
    location: LOCATION_LABELS[a.locationCode],
  };
}

export function buildAutomationQueue(input: {
  appointments: SecretaryAppointment[];
  payments: PaymentObligation[];
  diagnoses: DiagnosisDocument[];
  reports: ReportRequest[];
  tasks?: SecretaryTask[];
  recipientByChildId: Map<string, { name: string }>;
  existingReminders: ReminderRecord[];
}): AutomationQueueItem[] {
  const today = todayAthensYmd();
  const tomorrow = addDaysAthensCalendar(today, 1);
  const sentKeys = new Set(
    input.existingReminders
      .filter((r) => ["sent", "copied", "scheduled"].includes(r.status))
      .map((r) => `${r.entityType}:${r.entityId}:${r.templateCode}`)
  );

  const queue: AutomationQueueItem[] = [];

  const push = (item: Omit<AutomationQueueItem, "id">) => {
    const key = `${item.entityType}:${item.entityId}:${item.templateCode}`;
    if (sentKeys.has(key)) return;
    queue.push({ ...item, id: `auto-${key}` });
  };

  for (const a of input.appointments) {
    if (["cancelled", "completed"].includes(a.status)) continue;
    const ymd = appointmentYmdAthens(a);
    const recipient = input.recipientByChildId.get(a.childId ?? "")?.name ?? "Γονέας";
    const ctx = buildApptContext(a, recipient);

    if (ymd === tomorrow) {
      push({
        templateCode: "appointment_reminder_24h",
        templateLabel: getTemplate("appointment_reminder_24h").nameEl,
        suggestedChannel: "sms",
        reason: "Αύριο — υπενθύμιση 24 ώρες",
        childId: a.childId,
        childLabel: a.childLabel,
        recipientName: recipient,
        entityType: "appointment",
        entityId: a.id,
        priority: "high",
        context: ctx,
      });
    }
    if (ymd === today) {
      push({
        templateCode: "appointment_reminder_same_day",
        templateLabel: getTemplate("appointment_reminder_same_day").nameEl,
        suggestedChannel: "sms",
        reason: "Σήμερα — υπενθύμιση ημέρας",
        childId: a.childId,
        childLabel: a.childLabel,
        recipientName: recipient,
        entityType: "appointment",
        entityId: a.id,
        priority: "high",
        context: ctx,
      });
    }
    if (a.status === "no_show") {
      push({
        templateCode: "no_show_followup",
        templateLabel: getTemplate("no_show_followup").nameEl,
        suggestedChannel: "sms",
        reason: "Δεν προσήλθε",
        childId: a.childId,
        childLabel: a.childLabel,
        recipientName: recipient,
        entityType: "appointment",
        entityId: a.id,
        priority: "high",
        context: ctx,
      });
    }
  }

  for (const p of input.payments) {
    if (p.balance <= 0) continue;
    const recipient = p.parentLabel ?? input.recipientByChildId.get(p.childId)?.name ?? "Γονέας";
    const ctx: ReminderMessageContext = {
      ...baseContext(recipient, p.childLabel),
      amount_due: String(p.balance),
      due_date: new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(p.dueDate)
      ),
    };
    const overdueDays = -daysBetweenYmd(today, p.dueDate);
    const daysUntil = daysBetweenYmd(today, p.dueDate);

    if (daysUntil > 0 && daysUntil <= 7) {
      push({
        templateCode: "payment_due_soon",
        templateLabel: getTemplate("payment_due_soon").nameEl,
        suggestedChannel: "sms",
        reason: `Πληρωμή σε ${daysUntil} ημέρες`,
        childId: p.childId,
        childLabel: p.childLabel,
        recipientName: recipient,
        entityType: "payment",
        entityId: p.id,
        priority: "normal",
        context: ctx,
      });
    }
    if (overdueDays >= 1 && overdueDays <= 30) {
      push({
        templateCode: "payment_overdue_polite",
        templateLabel: getTemplate("payment_overdue_polite").nameEl,
        suggestedChannel: "sms",
        reason: `Καθυστέρηση ${overdueDays} ημέρες`,
        childId: p.childId,
        childLabel: p.childLabel,
        recipientName: recipient,
        entityType: "payment",
        entityId: p.id,
        priority: "high",
        context: ctx,
      });
    }
    if (overdueDays > 30 && overdueDays <= 60) {
      push({
        templateCode: "payment_overdue_second",
        templateLabel: getTemplate("payment_overdue_second").nameEl,
        suggestedChannel: "sms",
        reason: `Καθυστέρηση ${overdueDays} ημέρες`,
        childId: p.childId,
        childLabel: p.childLabel,
        recipientName: recipient,
        entityType: "payment",
        entityId: p.id,
        priority: "high",
        context: ctx,
      });
    }
    if (overdueDays > 60 || p.escalatedToManagement) {
      push({
        templateCode: "payment_management_review",
        templateLabel: getTemplate("payment_management_review").nameEl,
        suggestedChannel: "sms",
        reason: "Διοικητική παρακολούθηση οφειλής",
        childId: p.childId,
        childLabel: p.childLabel,
        recipientName: recipient,
        entityType: "payment",
        entityId: p.id,
        priority: "high",
        context: ctx,
      });
    }
  }

  for (const d of input.diagnoses) {
    if (!d.renewalRequired && d.daysUntilExpiry > 60) continue;
    const recipient = input.recipientByChildId.get(d.childId)?.name ?? "Γονέας";
    const expiryFormatted = new Intl.DateTimeFormat("el-GR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(d.expiryDate));
    const ctx: ReminderMessageContext = {
      ...baseContext(recipient, d.childLabel),
      due_date: expiryFormatted,
      expiry_date: expiryFormatted,
      document_type: d.documentType,
    };
    const days = d.daysUntilExpiry;
    const tpl = diagnosisTemplateForDocument(d);
    if (days <= 60 && days > 30) {
      push({
        templateCode: tpl === "diagnosis_renewal" ? "diagnosis_expires_60" : tpl,
        templateLabel: getTemplate("diagnosis_expires_60").nameEl,
        suggestedChannel: "sms",
        reason: "Λήγει σε 60 ημέρες",
        childId: d.childId,
        childLabel: d.childLabel,
        recipientName: recipient,
        entityType: "diagnosis",
        entityId: d.id,
        priority: "normal",
        context: ctx,
      });
    } else if (days <= 30 && days > 7) {
      push({
        templateCode: "diagnosis_expires_30",
        templateLabel: getTemplate("diagnosis_expires_30").nameEl,
        suggestedChannel: "sms",
        reason: "Λήγει σε 30 ημέρες",
        childId: d.childId,
        childLabel: d.childLabel,
        recipientName: recipient,
        entityType: "diagnosis",
        entityId: d.id,
        priority: "normal",
        context: ctx,
      });
    } else if (days <= 7) {
      push({
        templateCode: days < 0 ? "diagnosis_expired" : "diagnosis_expires_7",
        templateLabel: getTemplate(days < 0 ? "diagnosis_expired" : "diagnosis_expires_7").nameEl,
        suggestedChannel: "sms",
        reason: days < 0 ? "Ληγμένο έγγραφο" : `Λήγει σε ${days} ημέρες`,
        childId: d.childId,
        childLabel: d.childLabel,
        recipientName: recipient,
        entityType: "diagnosis",
        entityId: d.id,
        priority: "high",
        context: ctx,
      });
    }
  }

  for (const r of input.reports) {
    if (["delivered", "archived", "cancelled"].includes(r.status) || r.archived) continue;
    const recipient = input.recipientByChildId.get(r.childId)?.name ?? "Γονέας";
    const days = r.daysUntilDue;
    let tpl: import("./types").ReminderTemplateCode = "progress_report_ready";
    let reason = "Εκκρεμής αναφορά";
    let priority: "high" | "normal" = r.priority === "urgent" ? "high" : "normal";

    if (["approved", "ready_for_delivery"].includes(r.status)) {
      tpl = "progress_report_ready";
      reason = "Έτοιμη προς παράδοση / ενημέρωση γονέα";
    } else if (r.isOverdue) {
      tpl = "report_overdue";
      reason = "Εκπρόθεσμη αναφορά";
      priority = "high";
    } else if (days !== null && days <= 3) {
      tpl = "report_due_3";
      reason = `Προθεσμία σε ${days} ημέρες`;
      priority = "high";
    } else if (r.isDueSoon) {
      tpl = "report_due_7";
      reason = "Προθεσμία εντός 7 ημερών";
    }

    push({
      templateCode: tpl,
      templateLabel: getTemplate(tpl).nameEl,
      suggestedChannel: tpl === "progress_report_ready" ? "email" : "email",
      reason,
      childId: r.childId,
      childLabel: r.childLabel,
      recipientName: recipient,
      entityType: "report",
      entityId: r.id,
      priority,
      context: {
        ...baseContext(recipient, r.childLabel),
        appointment_type: r.reportTypeLabel,
        due_date: r.dueDate ?? "",
      },
    });
  }

  for (const t of input.tasks ?? []) {
    if (!t.childId || ["completed", "cancelled"].includes(t.status)) continue;
    if (!t.dueDate || t.dueDate > addDaysAthensCalendar(today, 7)) continue;
    const recipient = t.parentLabel ?? input.recipientByChildId.get(t.childId)?.name ?? "Γονέας";
    if (daysBetweenYmd(today, t.dueDate) > 0 && daysBetweenYmd(today, t.dueDate) <= 7) {
      push({
        templateCode: "no_show_followup",
        templateLabel: "Follow-up εργασίας",
        suggestedChannel: "sms",
        reason: `Εργασία: ${t.title}`,
        childId: t.childId,
        childLabel: t.childLabel,
        recipientName: recipient,
        entityType: "task",
        entityId: t.id,
        priority: t.priority === "urgent" ? "high" : "normal",
        context: {
          ...baseContext(recipient, t.childLabel ?? "—"),
          appointment_type: t.taskTypeLabel,
          due_date: t.dueDate,
        },
      });
    }
  }

  return queue.sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1));
}

export function computeReminderDashboardStats(
  queue: AutomationQueueItem[],
  reminders: ReminderRecord[]
): ReminderDashboardStats {
  const pending = reminders.filter((r) => r.status === "pending" || r.status === "scheduled");
  const failed = reminders.filter((r) => r.status === "failed");
  return {
    toSendToday: queue.length + pending.length,
    appointmentPending: queue.filter((q) => q.entityType === "appointment").length,
    paymentPending: queue.filter((q) => q.entityType === "payment" && q.templateCode === "payment_due_soon").length,
    overduePending: queue.filter((q) => q.entityType === "payment" && q.templateCode.includes("overdue")).length,
    diagnosisPending: queue.filter((q) => q.entityType === "diagnosis").length,
    reportPending: queue.filter((q) => q.entityType === "report").length,
    taskPending: queue.filter((q) => q.entityType === "task").length,
    evaluationPending: queue.filter((q) =>
      ["evaluation_reminder", "history_taking_reminder", "parent_info_reminder"].includes(q.templateCode)
    ).length,
    completedThisWeek: reminders.filter((r) => {
      const weekStart = addDaysAthensCalendar(todayAthensYmd(), -7);
      const d = (r.sentAt ?? r.copiedAt ?? r.createdAt).slice(0, 10);
      return (r.status === "sent" || r.status === "copied" || r.status === "completed") && d >= weekStart;
    }).length,
    failedOrNotSent: failed.length + pending.filter((r) => {
      const age = Date.now() - Date.parse(r.createdAt);
      return age > 2 * 86400000;
    }).length,
  };
}

export { apptTemplate, buildApptContext as apptContext, baseContext };
