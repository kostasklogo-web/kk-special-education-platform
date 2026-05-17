import type { ReminderChannel, ReminderStatus } from "./types";
import type { TaskPriority } from "@/lib/secretary/types";

export const REMINDER_STATUS_LABELS_EXT: Record<ReminderStatus | "completed" | "overdue", string> = {
  pending: "Εκκρεμεί",
  scheduled: "Προγραμματισμένη",
  copied: "Αντιγράφηκε",
  sent: "Στάλθηκε",
  completed: "Ολοκληρώθηκε",
  failed: "Απέτυχε",
  cancelled: "Ακυρώθηκε",
  overdue: "Εκπρόθεσμη",
};

export const REMINDER_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Χαμηλή",
  normal: "Κανονική",
  high: "Υψηλή",
  urgent: "Επείγουσα",
};

export const REMINDER_STATUS_BADGE: Record<string, string> = {
  pending: "bg-slate-100 text-slate-800 border-slate-200",
  scheduled: "bg-amber-50 text-amber-950 border-amber-200",
  copied: "bg-blue-50 text-blue-900 border-blue-200",
  sent: "bg-emerald-100 text-emerald-950 border-emerald-300",
  completed: "bg-emerald-100 text-emerald-950 border-emerald-300",
  failed: "bg-red-950 text-red-50 border-red-900",
  cancelled: "bg-surface-muted text-ink-muted border-border",
  overdue: "bg-red-100 text-red-950 border-red-300",
};

export const REMINDER_CHANNEL_LABELS_EXT: Record<ReminderChannel | "copy_only", string> = {
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  viber: "Viber",
  phone_call: "Τηλεφωνική κλήση",
  copy_only: "Αντιγραφή μηνύματος",
};
