import type { DiagnosisDocumentStatus } from "@/lib/secretary/types";

export const DIAGNOSIS_STATUS_LABELS: Record<DiagnosisDocumentStatus, string> = {
  active: "Ενεργή",
  expiring_60: "Λήγει σε 60 ημέρες",
  expiring_30: "Λήγει σε 30 ημέρες",
  expiring_7: "Λήγει σε 7 ημέρες",
  expired: "Έληξε",
  renewal_in_progress: "Σε διαδικασία ανανέωσης",
  renewed: "Ανανεώθηκε",
  no_renewal_required: "Δεν απαιτείται ανανέωση",
  needs_review: "Χρειάζεται έλεγχος",
  archived: "Αρχειοθετημένο",
};

export const DIAGNOSIS_STATUS_STYLES: Record<DiagnosisDocumentStatus, string> = {
  active: "bg-emerald-50 text-emerald-900 border-emerald-200",
  expiring_60: "bg-amber-50 text-amber-950 border-amber-200",
  expiring_30: "bg-amber-50 text-amber-950 border-amber-300",
  expiring_7: "bg-orange-50 text-orange-950 border-orange-300",
  expired: "bg-red-50 text-red-900 border-red-200",
  renewal_in_progress: "bg-sky-50 text-sky-900 border-sky-200",
  renewed: "bg-emerald-50 text-emerald-900 border-emerald-200",
  no_renewal_required: "bg-slate-50 text-slate-700 border-slate-200",
  needs_review: "bg-violet-50 text-violet-900 border-violet-200",
  archived: "bg-slate-100 text-slate-600 border-slate-200",
};
