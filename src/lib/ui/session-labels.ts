import type { SessionKind, SessionStatus } from "@/lib/data/sessions/types";

export const SESSION_KIND_LABELS_EL: Record<SessionKind, string> = {
  individual: "Ατομική",
  group: "Ομαδική",
  assessment: "Αξιολόγηση",
  parent_counseling: "Συμβουλευτική γονέων",
  supervision: "Εποπτεία",
};

export const SESSION_STATUS_LABELS_EL: Record<SessionStatus, string> = {
  scheduled: "Προγραμματισμένη",
  completed: "Ολοκληρωμένη",
  cancelled: "Ακυρώθηκε",
  no_show: "Απουσία (παλαιός κωδικός)",
  absence: "Απουσία",
  to_reschedule: "Προς αναπλήρωση",
};

export function sessionKindLabelEl(code: string | null | undefined): string {
  if (!code) return SESSION_KIND_LABELS_EL.individual;
  if (code in SESSION_KIND_LABELS_EL) {
    return SESSION_KIND_LABELS_EL[code as SessionKind];
  }
  return code;
}

export function sessionStatusLabelEl(code: string | null | undefined): string {
  if (!code) return SESSION_STATUS_LABELS_EL.scheduled;
  if (code in SESSION_STATUS_LABELS_EL) {
    return SESSION_STATUS_LABELS_EL[code as SessionStatus];
  }
  return code;
}
