import type {
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  SecretaryAppointment,
} from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import { apptContext, apptTemplate, baseContext } from "@/lib/secretary/reminders/automation-queue";
import type { ReminderTemplateCode } from "@/lib/secretary/reminders/types";
import type { OpenReminderPayload } from "./reminder-payload";
import { diagnosisTemplateForDocument } from "@/lib/secretary/diagnoses/reminder-templates";
import { reportTemplateForRequest } from "@/lib/secretary/reports/reminder-templates";

function contactForChild(childId: string | null, consents: CommunicationConsent[]) {
  const c = consents.find((x) => x.childId === childId);
  return {
    name: c?.recipientName ?? "Γονέας",
    phone: c?.phone ?? null,
    email: c?.email ?? null,
  };
}

export function buildAppointmentReminderPayload(
  appointment: SecretaryAppointment,
  consents: CommunicationConsent[],
  templateCode?: ReminderTemplateCode
): OpenReminderPayload {
  const contact = contactForChild(appointment.childId, consents);
  const code = templateCode ?? apptTemplate(appointment);
  return {
    templateCode: code,
    entityType: "appointment",
    entityId: appointment.id,
    childId: appointment.childId,
    childLabel: appointment.childLabel,
    recipientName: contact.name,
    recipientPhone: contact.phone,
    recipientEmail: contact.email,
    context: apptContext(appointment, contact.name),
    suggestedChannel: "sms",
  };
}

export function buildPaymentReminderPayload(
  payment: PaymentObligation,
  consents: CommunicationConsent[],
  templateCode: ReminderTemplateCode
): OpenReminderPayload {
  const contact = contactForChild(payment.childId, consents);
  return {
    templateCode,
    entityType: "payment",
    entityId: payment.id,
    childId: payment.childId,
    childLabel: payment.childLabel,
    recipientName: payment.parentLabel ?? contact.name,
    recipientPhone: contact.phone,
    recipientEmail: contact.email,
    context: {
      ...baseContext(payment.parentLabel ?? contact.name, payment.childLabel),
      amount_due: String(payment.balance),
      due_date: new Intl.DateTimeFormat("el-GR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(payment.dueDate)),
    },
    suggestedChannel: "sms",
  };
}

export function buildDiagnosisReminderPayload(
  doc: DiagnosisDocument,
  consents: CommunicationConsent[],
  templateCode?: ReminderTemplateCode
): OpenReminderPayload {
  const contact = contactForChild(doc.childId, consents);
  const expiryFormatted = new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(doc.expiryDate));
  const code = templateCode ?? diagnosisTemplateForDocument(doc);
  return {
    templateCode: code,
    entityType: "diagnosis",
    entityId: doc.id,
    childId: doc.childId,
    childLabel: doc.childLabel,
    recipientName: contact.name,
    recipientPhone: contact.phone,
    recipientEmail: contact.email,
    context: {
      ...baseContext(contact.name, doc.childLabel),
      due_date: expiryFormatted,
      expiry_date: expiryFormatted,
      document_type: doc.documentType,
    },
    suggestedChannel: "sms",
  };
}

export function paymentTemplateForStatus(
  payment: PaymentObligation,
  todayYmd: string
): ReminderTemplateCode {
  if (
    payment.paymentStatus === "suspended_management" ||
    payment.paymentStatus === "overdue_60_plus" ||
    payment.escalatedToManagement
  ) {
    return "payment_management_review";
  }
  if (payment.paymentStatus === "overdue_30_60") return "payment_overdue_second";
  if (
    payment.paymentStatus === "overdue_1_30" ||
    payment.paymentStatus === "overdue"
  ) {
    return "payment_overdue_polite";
  }
  const due = payment.dueDate;
  const days = Math.round(
    (Date.parse(`${todayYmd}T12:00:00.000Z`) - Date.parse(`${due}T12:00:00.000Z`)) / 86400000
  );
  if (days > 60) return "payment_management_review";
  if (days > 30) return "payment_overdue_second";
  if (days >= 1) return "payment_overdue_polite";
  return "payment_due_soon";
}

export function buildReportReminderPayload(
  report: ReportRequest,
  consents: CommunicationConsent[],
  templateCode?: ReminderTemplateCode
): OpenReminderPayload {
  const contact = contactForChild(report.childId, consents);
  const code = templateCode ?? reportTemplateForRequest(report);
  const dueFormatted = report.dueDate
    ? new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(report.dueDate)
      )
    : "";
  return {
    templateCode: code,
    entityType: "report",
    entityId: report.id,
    childId: report.childId,
    childLabel: report.childLabel,
    recipientName: contact.name,
    recipientPhone: contact.phone,
    recipientEmail: contact.email,
    context: {
      ...baseContext(contact.name, report.childLabel),
      appointment_type: report.reportTypeLabel,
      due_date: dueFormatted,
    },
    suggestedChannel: code === "progress_report_ready" ? "email" : "email",
  };
}
