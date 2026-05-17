import type { ReportRequestPriority, ReportRequestStatus } from "@/lib/secretary/types";

export const REPORT_STATUS_LABELS: Record<ReportRequestStatus, string> = {
  requested: "Ζητήθηκε",
  assigned_therapist: "Ανατέθηκε σε θεραπευτή",
  draft_in_progress: "Σε σύνταξη",
  draft_completed: "Ολοκληρώθηκε draft",
  supervisor_review: "Σε έλεγχο επόπτη",
  corrections_requested: "Επιστροφή για διορθώσεις",
  clinical_director_review: "Σε έγκριση κλινικού διευθυντή",
  approved: "Εγκρίθηκε",
  ready_for_delivery: "Έτοιμη προς παράδοση",
  delivered: "Παραδόθηκε",
  cancelled: "Ακυρώθηκε",
  archived: "Αρχειοθετήθηκε",
};

export const REPORT_PRIORITY_LABELS: Record<ReportRequestPriority, string> = {
  low: "Χαμηλή",
  normal: "Κανονική",
  high: "Υψηλή",
  urgent: "Επείγουσα",
};

export const REPORT_STATUS_BADGE_CLASS: Record<ReportRequestStatus, string> = {
  requested: "bg-slate-100 text-slate-800 border-slate-200",
  assigned_therapist: "bg-blue-50 text-blue-900 border-blue-200",
  draft_in_progress: "bg-amber-50 text-amber-950 border-amber-200",
  draft_completed: "bg-amber-100 text-amber-950 border-amber-300",
  supervisor_review: "bg-orange-50 text-orange-950 border-orange-200",
  corrections_requested: "bg-red-50 text-red-900 border-red-200",
  clinical_director_review: "bg-orange-100 text-orange-950 border-orange-300",
  approved: "bg-emerald-50 text-emerald-900 border-emerald-200",
  ready_for_delivery: "bg-clinical-50 text-clinical-900 border-clinical-200",
  delivered: "bg-emerald-100 text-emerald-950 border-emerald-300",
  cancelled: "bg-surface-muted text-ink-muted border-border",
  archived: "bg-surface-muted text-ink-faint border-border",
};

export const REPORT_PRIORITY_BADGE_CLASS: Record<ReportRequestPriority, string> = {
  low: "bg-slate-50 text-slate-700 border-slate-200",
  normal: "bg-surface-muted text-ink border-border",
  high: "bg-amber-50 text-amber-950 border-amber-200",
  urgent: "bg-red-100 text-red-950 border-red-300",
};
