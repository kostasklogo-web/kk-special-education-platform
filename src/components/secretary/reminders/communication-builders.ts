import type { ChildListItem, ParentLinkRow } from "@/lib/data/children/types";
import type {
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  SecretaryAppointment,
  SecretaryTask,
} from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import {
  buildAppointmentReminderPayload,
  buildDiagnosisReminderPayload,
  buildPaymentReminderPayload,
  buildReportReminderPayload,
  paymentTemplateForStatus,
} from "./reminder-builders";
import { defaultTemplateForEntity } from "@/lib/secretary/reminders/template-filters";
import type { CommunicationLog } from "@/lib/secretary/types";
import type { OpenReminderPayload } from "./reminder-payload";
import type { ReminderTemplateCode } from "@/lib/secretary/reminders/types";
import { withDefaultCenterFields } from "@/lib/secretary/reminders/normalize-context";

function contactForChild(childId: string | null, consents: CommunicationConsent[]) {
  const c = consents.find((x) => x.childId === childId);
  return {
    name: c?.recipientName ?? "Γονέας",
    phone: c?.phone ?? null,
    email: c?.email ?? null,
  };
}

function primaryParentFromLinks(links: ParentLinkRow[]): {
  name: string;
  phone: string | null;
  email: string | null;
} {
  const primary = links.find((l) => l.is_primary) ?? links[0];
  if (!primary) return { name: "Γονέας", phone: null, email: null };
  const p = primary.parent;
  return {
    name: `${p.first_name} ${p.last_name}`.trim(),
    phone: p.phone,
    email: p.email,
  };
}

export function buildChildCommunicationPayload(
  child: Pick<ChildListItem, "id" | "first_name" | "last_name">,
  parentLinks: ParentLinkRow[],
  consents: CommunicationConsent[],
  templateCode?: ReminderTemplateCode
): OpenReminderPayload {
  const demoContact = contactForChild(child.id, consents);
  const linkContact = primaryParentFromLinks(parentLinks);
  const name = linkContact.name !== "Γονέας" ? linkContact.name : demoContact.name;
  const childLabel = `${child.first_name} ${child.last_name}`.trim();
  const code = templateCode ?? defaultTemplateForEntity("child");

  return {
    templateCode: code,
    entityType: "child",
    entityId: child.id,
    childId: child.id,
    childLabel,
    recipientName: name,
    recipientPhone: linkContact.phone ?? demoContact.phone,
    recipientEmail: linkContact.email ?? demoContact.email,
    context: withDefaultCenterFields({
      parent_name: name,
      child_name: childLabel,
      appointment_type: "Επικοινωνία κέντρου",
    }),
    suggestedChannel: "sms",
  };
}

export function buildCommunicationLogReminderPayload(
  log: CommunicationLog,
  consents: CommunicationConsent[]
): OpenReminderPayload | null {
  if (!log.childId) return null;
  const contact = contactForChild(log.childId, consents);
  const recipientName = log.parentLabel ?? log.contactPerson ?? contact.name;
  return {
    templateCode: defaultTemplateForEntity("task"),
    entityType: "task",
    entityId: log.id,
    childId: log.childId,
    childLabel: log.childLabel,
    recipientName,
    recipientPhone: log.contactPhone ?? contact.phone,
    recipientEmail: log.contactEmail ?? contact.email,
    context: withDefaultCenterFields({
      parent_name: recipientName,
      child_name: log.childLabel ?? "—",
      appointment_type: `${log.communicationTypeLabel}: ${log.summary.slice(0, 120)}`,
    }),
    suggestedChannel: log.communicationTypeCode === "email" ? "email" : "sms",
  };
}

export function buildTaskReminderPayload(
  task: SecretaryTask,
  consents: CommunicationConsent[]
): OpenReminderPayload {
  const contact = contactForChild(task.childId, consents);
  const childLabel = task.childLabel ?? "—";
  const dueFormatted = task.dueDate
    ? new Intl.DateTimeFormat("el-GR", { day: "numeric", month: "long", year: "numeric" }).format(
        new Date(task.dueDate)
      )
    : "";
  return {
    templateCode: "no_show_followup",
    entityType: "task",
    entityId: task.id,
    childId: task.childId,
    childLabel: task.childLabel,
    recipientName: contact.name,
    recipientPhone: contact.phone,
    recipientEmail: contact.email,
    context: withDefaultCenterFields({
      parent_name: task.parentLabel ?? contact.name,
      child_name: childLabel,
      appointment_type: task.taskTypeLabel,
      due_date: dueFormatted,
    }),
    suggestedChannel: "sms",
  };
}

/** @deprecated Use buildTaskReminderPayload */
export const buildTaskCommunicationPayload = buildTaskReminderPayload;

export function buildReportCommunicationPayload(
  report: ReportRequest,
  consents: CommunicationConsent[]
): OpenReminderPayload {
  return buildReportReminderPayload(report, consents);
}

export {
  buildAppointmentReminderPayload,
  buildPaymentReminderPayload,
  buildDiagnosisReminderPayload,
  buildReportReminderPayload,
  paymentTemplateForStatus,
};
