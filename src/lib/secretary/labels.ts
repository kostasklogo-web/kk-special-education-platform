import type {
  AppointmentLocationCode,
  AppointmentPriority,
  AppointmentReminderStatus,
  CommunicationTypeCode,
  LeadStatus,
  PaymentStatus,
  SecretaryAppointmentStatus,
  TaskPriority,
  TaskStatus,
} from "./types";

export { LEAD_STATUS_LABELS, LEAD_STATUS_BADGE_CLASS, URGENCY_LABELS } from "@/lib/secretary/intake/labels";

export const LOCATION_LABELS: Record<AppointmentLocationCode, string> = {
  nikaia: "Νίκαια",
  evosmos: "Εύοσμος",
  online: "Διαδικτυακά",
  phone: "Τηλέφωνο",
};

export const APPOINTMENT_STATUS_LABELS: Record<SecretaryAppointmentStatus, string> = {
  scheduled: "Προγραμματισμένο",
  confirmed: "Επιβεβαιωμένο",
  completed: "Ολοκληρωμένο",
  cancelled: "Ακυρωμένο",
  no_show: "Μη προσέλευση",
  rescheduled: "Αναπρογραμματισμένο",
  pending_followup: "Εκκρεμεί follow-up",
};

export const REMINDER_STATUS_LABELS: Record<AppointmentReminderStatus, string> = {
  none: "—",
  pending: "Εκκρεμεί",
  scheduled: "Προγραμματισμένη",
  sent: "Απεστάλη",
};

export { PAYMENT_DISPLAY_STATUS_LABELS as PAYMENT_STATUS_LABELS } from "@/lib/secretary/payments/labels";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Ανοιχτή",
  in_progress: "Σε εξέλιξη",
  waiting_response: "Αναμονή απάντησης",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
  overdue: "Εκπρόθεσμη",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Χαμηλή",
  normal: "Κανονική",
  high: "Υψηλή",
  urgent: "Επείγον",
};

export const APPOINTMENT_PRIORITY_LABELS: Record<AppointmentPriority, string> = {
  low: "Χαμηλή",
  normal: "Κανονική",
  high: "Υψηλή",
  urgent: "Επείγον",
};

export { REPORT_STATUS_LABELS, REPORT_PRIORITY_LABELS } from "@/lib/secretary/reports/labels";

export const COMMUNICATION_TYPE_LABELS: Record<CommunicationTypeCode, string> = {
  parent_call: "Τηλεφωνική επικοινωνία με γονέα",
  school_call: "Τηλεφωνική επικοινωνία με σχολείο",
  doctor_call: "Τηλεφωνική επικοινωνία με γιατρό",
  teacher_call: "Τηλεφωνική επικοινωνία με δάσκαλο",
  parallel_support_call: "Τηλεφωνική επικοινωνία με παράλληλη στήριξη",
  therapist_call: "Τηλεφωνική επικοινωνία με θεραπευτή",
  supervisor_call: "Τηλεφωνική επικοινωνία με επόπτη",
  partner_call: "Τηλεφωνική επικοινωνία με εξωτερικό συνεργάτη",
  email: "Email",
  sms: "SMS",
  viber: "Viber",
  whatsapp: "WhatsApp",
  in_person: "Δια ζώσης συνάντηση",
  internal_staff: "Εσωτερική ενημέρωση",
  other: "Άλλο",
};

export const TASK_TYPE_LABELS: Record<string, string> = {
  call_school: "Κλήση σχολείου",
  call_doctor: "Κλήση γιατρού",
  call_teacher: "Κλήση εκπαιδευτικού",
  call_parallel: "Κλήση παράλληλης στήριξης",
  call_parent: "Κλήση γονέα",
  call_colleague: "Κλήση συναδέλφου",
  progress_report: "Αίτημα αναφοράς προόδου",
  schedule_parent_meeting: "Προγραμματισμός συνάντησης γονέων",
  schedule_evaluation: "Προγραμματισμός αξιολόγησης",
  schedule_reevaluation: "Προγραμματισμός επαναξιολόγησης",
  diagnosis_renewal: "Ανανέωση διάγνωσης",
  unpaid_followup: "Υπόλοιπο πληρωμής",
  prepare_document: "Προετοιμασία εγγράφου",
  send_email: "Αποστολή email",
  internal_meeting: "Εσωτερική συνάντηση",
  supervisor_appointment: "Ραντεβού επόπτη",
  emergency: "Επείγον",
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  progress: "Αναφορά προόδου",
  evaluation: "Αναφορά αξιολόγησης",
  reevaluation: "Αναφορά επαναξιολόγησης",
  school: "Αναφορά για σχολείο",
  doctor_update: "Ενημέρωση γιατρού",
  parent_summary: "Σύνοψη για γονείς",
};

export const ALERT_LEVEL_LABELS = {
  red: "Επείγον",
  yellow: "Προσοχή",
  green: "Εντάξει",
} as const;
