import type { ReminderEntityType, ReminderTemplateCode } from "./types";

export type ReminderTypeCode =
  | "appointment"
  | "evaluation"
  | "history_taking"
  | "parent_info"
  | "therapy_session"
  | "payment_due"
  | "payment_overdue"
  | "diagnosis_renewal"
  | "report"
  | "followup"
  | "supervision"
  | "internal_meeting"
  | "other";

export const REMINDER_TYPES: { code: ReminderTypeCode; labelEl: string; module: ReminderEntityType | "other" }[] = [
  { code: "appointment", labelEl: "Υπενθύμιση ραντεβού", module: "appointment" },
  { code: "evaluation", labelEl: "Υπενθύμιση αξιολόγησης", module: "appointment" },
  { code: "history_taking", labelEl: "Υπενθύμιση λήψης ιστορικού", module: "appointment" },
  { code: "parent_info", labelEl: "Υπενθύμιση ενημερωτικού ραντεβού", module: "appointment" },
  { code: "therapy_session", labelEl: "Υπενθύμιση θεραπευτικής συνεδρίας", module: "appointment" },
  { code: "payment_due", labelEl: "Υπενθύμιση πληρωμής", module: "payment" },
  { code: "payment_overdue", labelEl: "Υπενθύμιση καθυστερημένης οφειλής", module: "payment" },
  { code: "diagnosis_renewal", labelEl: "Υπενθύμιση γνωμάτευσης", module: "diagnosis" },
  { code: "report", labelEl: "Υπενθύμιση αναφοράς", module: "report" },
  { code: "followup", labelEl: "Υπενθύμιση follow-up", module: "task" },
  { code: "supervision", labelEl: "Υπενθύμιση εποπτείας", module: "meeting" },
  { code: "internal_meeting", labelEl: "Υπενθύμιση εσωτερικής συνάντησης", module: "meeting" },
  { code: "other", labelEl: "Άλλο", module: "other" },
];

const TEMPLATE_TO_TYPE: Partial<Record<ReminderTemplateCode, ReminderTypeCode>> = {
  appointment_confirmation: "appointment",
  appointment_reminder_24h: "appointment",
  appointment_reminder_same_day: "appointment",
  evaluation_reminder: "evaluation",
  history_taking_reminder: "history_taking",
  parent_info_reminder: "parent_info",
  therapy_session_reminder: "therapy_session",
  payment_due_soon: "payment_due",
  payment_overdue_polite: "payment_overdue",
  payment_overdue_second: "payment_overdue",
  payment_management_review: "payment_overdue",
  diagnosis_renewal: "diagnosis_renewal",
  diagnosis_expires_60: "diagnosis_renewal",
  diagnosis_expires_30: "diagnosis_renewal",
  diagnosis_expires_7: "diagnosis_renewal",
  diagnosis_expired: "diagnosis_renewal",
  diagnosis_renewal_followup: "diagnosis_renewal",
  progress_report_ready: "report",
  report_due_7: "report",
  report_due_3: "report",
  report_overdue: "report",
  no_show_followup: "followup",
  meeting_supervision_reminder: "supervision",
  meeting_internal_reminder: "internal_meeting",
  meeting_emergency_reminder: "internal_meeting",
  meeting_reminder_24h: "internal_meeting",
  meeting_reminder_same_day: "internal_meeting",
  meeting_minutes_missing: "internal_meeting",
  meeting_decision_followup: "followup",
};

export function reminderTypeForTemplate(code: ReminderTemplateCode): ReminderTypeCode {
  return TEMPLATE_TO_TYPE[code] ?? "other";
}

export function reminderTypeLabel(code: ReminderTypeCode): string {
  return REMINDER_TYPES.find((t) => t.code === code)?.labelEl ?? code;
}
