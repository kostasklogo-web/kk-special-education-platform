import type { LeadStatus } from "@/lib/secretary/types";
import type { IntakeUrgency } from "./types";

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new_interest: "Νέο ενδιαφέρον",
  awaiting_contact: "Αναμονή επικοινωνίας",
  contact_made: "Έγινε επικοινωνία",
  parent_info_scheduled: "Προγραμματίστηκε ενημερωτικό",
  history_scheduled: "Προγραμματίστηκε λήψη ιστορικού",
  evaluation_scheduled: "Προγραμματίστηκε αξιολόγηση",
  awaiting_parent: "Σε αναμονή από γονέα",
  active_case: "Ενεργό περιστατικό",
  closed_unsuitable: "Μη κατάλληλο / έκλεισε",
  incomplete_inquiry: "Ατελές αίτημα",
  draft: "Πρόχειρο",
  new_inquiry: "Νέο ενδιαφέρον",
  intake_submitted: "Φόρμα υποβλήθηκε",
  active_client: "Ενεργό περιστατικό",
  closed: "Κλειστό",
};

export const LEAD_STATUS_BADGE_CLASS: Record<LeadStatus, string> = {
  new_interest: "bg-sky-100 text-sky-900 border-sky-200",
  awaiting_contact: "bg-amber-100 text-amber-950 border-amber-200",
  contact_made: "bg-indigo-100 text-indigo-900 border-indigo-200",
  parent_info_scheduled: "bg-violet-100 text-violet-900 border-violet-200",
  history_scheduled: "bg-violet-100 text-violet-900 border-violet-200",
  evaluation_scheduled: "bg-clinical-100 text-clinical-900 border-clinical-200",
  awaiting_parent: "bg-amber-100 text-amber-950 border-amber-200",
  active_case: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed_unsuitable: "bg-zinc-200 text-zinc-700 border-zinc-300",
  incomplete_inquiry: "bg-orange-100 text-orange-950 border-orange-200",
  draft: "bg-zinc-100 text-zinc-600 border-zinc-200",
  new_inquiry: "bg-sky-100 text-sky-900 border-sky-200",
  intake_submitted: "bg-clinical-100 text-clinical-900 border-clinical-200",
  active_client: "bg-emerald-100 text-emerald-900 border-emerald-200",
  closed: "bg-zinc-200 text-zinc-700 border-zinc-300",
};

export const URGENCY_LABELS: Record<IntakeUrgency, string> = {
  low: "Χαμηλή",
  normal: "Κανονική",
  high: "Υψηλή",
  urgent: "Επείγουσα",
};

export const LEAD_STATUS_OPTIONS: LeadStatus[] = [
  "new_interest",
  "awaiting_contact",
  "contact_made",
  "parent_info_scheduled",
  "history_scheduled",
  "evaluation_scheduled",
  "awaiting_parent",
  "active_case",
  "closed_unsuitable",
];
