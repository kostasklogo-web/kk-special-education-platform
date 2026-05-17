import type { MeetingDecisionStatus, MeetingStatus } from "@/lib/secretary/types";
import type { TaskPriority } from "@/lib/secretary/types";

export const MEETING_STATUS_LABELS: Record<MeetingStatus, string> = {
  scheduled: "Προγραμματισμένη",
  confirmed: "Επιβεβαιωμένη",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
  postponed: "Αναβλήθηκε",
  needs_minutes: "Χρειάζεται πρακτικά",
  needs_followup: "Χρειάζεται follow-up",
  pending_decision: "Εκκρεμεί απόφαση",
  closed: "Κλειστή",
};

export const MEETING_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Χαμηλή",
  normal: "Κανονική",
  high: "Υψηλή",
  urgent: "Επείγουσα",
};

export const MEETING_DECISION_STATUS_LABELS: Record<MeetingDecisionStatus, string> = {
  open: "Ανοιχτή",
  in_progress: "Σε εξέλιξη",
  completed: "Ολοκληρώθηκε",
  cancelled: "Ακυρώθηκε",
  overdue: "Εκπρόθεσμη",
};

export const MEETING_STATUS_BADGE: Record<MeetingStatus, string> = {
  scheduled: "bg-amber-50 text-amber-950 border-amber-200",
  confirmed: "bg-blue-50 text-blue-900 border-blue-200",
  completed: "bg-emerald-100 text-emerald-950 border-emerald-300",
  cancelled: "bg-zinc-100 text-zinc-500 border-zinc-200",
  postponed: "bg-violet-50 text-violet-900 border-violet-200",
  needs_minutes: "bg-yellow-50 text-yellow-950 border-yellow-300",
  needs_followup: "bg-orange-50 text-orange-950 border-orange-300",
  pending_decision: "bg-red-100 text-red-950 border-red-300",
  closed: "bg-zinc-200 text-zinc-800 border-zinc-300",
};

export const MEETING_FOLLOWUP_LABELS = {
  none: "—",
  pending: "Εκκρεμεί follow-up",
  overdue: "Εκπρόθεσμο follow-up",
  complete: "Ολοκληρωμένο",
} as const;
