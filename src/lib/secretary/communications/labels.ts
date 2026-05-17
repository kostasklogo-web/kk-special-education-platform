import type { CommunicationStatus, TaskPriority } from "@/lib/secretary/types";
import { TASK_PRIORITY_LABELS } from "@/lib/secretary/labels";

export { TASK_PRIORITY_LABELS as COMMUNICATION_PRIORITY_LABELS };

export const COMMUNICATION_STATUS_LABELS: Record<CommunicationStatus, string> = {
  completed: "Ολοκληρώθηκε",
  waiting_response: "Αναμονή απάντησης",
  needs_followup: "Χρειάζεται follow-up",
  overdue_followup: "Εκπρόθεσμο follow-up",
  cancelled: "Ακυρώθηκε",
};

export const COMMUNICATION_STATUS_BADGE_CLASS: Record<CommunicationStatus, string> = {
  completed: "bg-emerald-100 text-emerald-900 border-emerald-200",
  waiting_response: "bg-amber-100 text-amber-950 border-amber-200",
  needs_followup: "bg-sky-100 text-sky-900 border-sky-200",
  overdue_followup: "bg-red-100 text-red-900 border-red-200",
  cancelled: "bg-zinc-200 text-zinc-600 border-zinc-300",
};

export const COMMUNICATION_PRIORITY_BADGE_CLASS: Record<TaskPriority, string> = {
  low: "bg-zinc-100 text-zinc-700 border-zinc-200",
  normal: "bg-slate-100 text-slate-800 border-slate-200",
  high: "bg-amber-100 text-amber-950 border-amber-200",
  urgent: "bg-red-950 text-red-50 border-red-900",
};
