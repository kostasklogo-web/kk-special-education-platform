export type ReminderChannel = "sms" | "email" | "whatsapp" | "viber" | "phone_call";

export type ReminderStatus =
  | "pending"
  | "scheduled"
  | "copied"
  | "sent"
  | "completed"
  | "failed"
  | "cancelled";

export type ReminderEntityType =
  | "appointment"
  | "payment"
  | "diagnosis"
  | "report"
  | "meeting"
  | "child"
  | "task";

export type ReminderTemplateCode =
  | "appointment_confirmation"
  | "appointment_reminder_24h"
  | "appointment_reminder_same_day"
  | "evaluation_reminder"
  | "history_taking_reminder"
  | "parent_info_reminder"
  | "therapy_session_reminder"
  | "payment_due_soon"
  | "payment_overdue_polite"
  | "payment_overdue_second"
  | "payment_management_review"
  | "diagnosis_renewal"
  | "diagnosis_expires_60"
  | "diagnosis_expires_30"
  | "diagnosis_expires_7"
  | "diagnosis_expired"
  | "diagnosis_renewal_followup"
  | "no_show_followup"
  | "progress_report_ready"
  | "report_due_7"
  | "report_due_3"
  | "report_overdue"
  /** @deprecated Use payment_overdue_polite */
  | "payment_overdue_1_30"
  /** @deprecated Use payment_overdue_second */
  | "payment_overdue_30_60"
  /** @deprecated Use progress_report_ready */
  | "pending_report_reminder"
  | "meeting_supervision_reminder"
  | "meeting_internal_reminder"
  | "meeting_emergency_reminder"
  | "meeting_reminder_24h"
  | "meeting_reminder_same_day"
  | "meeting_minutes_missing"
  | "meeting_decision_followup";

export type CommunicationConsent = {
  id: string;
  organizationId: string;
  childId: string | null;
  parentId: string | null;
  recipientName: string;
  phone: string | null;
  email: string | null;
  smsConsent: boolean;
  emailConsent: boolean;
  whatsappConsent: boolean;
  viberConsent: boolean;
};

export type ReminderRecord = {
  id: string;
  organizationId: string;
  templateCode: ReminderTemplateCode;
  templateLabel: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  recipientName: string;
  recipientPhone: string | null;
  recipientEmail: string | null;
  childId: string | null;
  childLabel: string | null;
  parentId: string | null;
  entityType: ReminderEntityType;
  entityId: string;
  messageBody: string;
  scheduledFor: string | null;
  sentAt: string | null;
  copiedAt: string | null;
  createdAt: string;
};

export type ReminderLogEntry = {
  id: string;
  reminderId: string;
  action: "created" | "copied" | "sent" | "scheduled" | "failed" | "cancelled" | "phone_logged";
  channel: ReminderChannel | null;
  statusAfter: ReminderStatus;
  messageSnapshot: string;
  communicationLogId: string | null;
  createdAt: string;
};

export type ReminderMessageContext = {
  parent_name: string;
  child_name: string;
  appointment_type?: string;
  appointment_date?: string;
  appointment_time?: string;
  location?: string;
  amount_due?: string;
  due_date?: string;
  document_type?: string;
  expiry_date?: string;
  center_phone: string;
  center_email: string;
  center_name: string;
  /** @deprecated Use parent_name */
  recipient_name?: string;
};

export type ReminderDashboardStats = {
  toSendToday: number;
  appointmentPending: number;
  paymentPending: number;
  overduePending: number;
  diagnosisPending: number;
  reportPending: number;
  taskPending: number;
  evaluationPending: number;
  completedThisWeek: number;
  failedOrNotSent: number;
};

export type AutomationQueueItem = {
  id: string;
  templateCode: ReminderTemplateCode;
  templateLabel: string;
  suggestedChannel: ReminderChannel;
  reason: string;
  childId: string | null;
  childLabel: string | null;
  recipientName: string;
  entityType: ReminderEntityType;
  entityId: string;
  priority: "high" | "normal";
  context: ReminderMessageContext;
};
