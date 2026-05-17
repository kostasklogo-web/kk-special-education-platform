import type { ClinicalProfileTab, ClinicalTimelineEventKind } from "./types";

export const CLINICAL_PROFILE_TAB_LABELS: Record<ClinicalProfileTab, string> = {
  overview: "Επισκόπηση",
  alerts: "Ειδοποιήσεις",
  timeline: "Χρονολόγιο",
  goals: "Στόχοι",
  notes: "Σημειώσεις",
  reports: "Αναφορές",
  evaluations: "Αξιολογήσεις",
  interdisciplinary: "Διεπιπέδουση",
  supervision: "Εποπτεία",
};

export const TIMELINE_KIND_LABELS: Record<ClinicalTimelineEventKind, string> = {
  evaluation: "Αξιολόγηση",
  session: "Συνεδρία",
  session_note: "Σημείωση συνεδρίας",
  goal: "Στόχος",
  report: "Αναφορά προόδου",
  supervision: "Εποπτεία",
  parent_guidance: "Καθοδήγηση γονέων",
  school_collaboration: "Συνεργασία σχολείου",
  therapeutic_change: "Θεραπευτική προσαρμογή",
  interdisciplinary: "Διεπιπληρωματική παρατήρηση",
};

export const SESSION_KIND_LABELS_EL: Record<string, string> = {
  individual: "Ατομική συνεδρία",
  group: "Ομαδική",
  assessment: "Αξιολόγηση",
  parent_counseling: "Συνεδρία γονέων (κλινική)",
  supervision: "Εποπτεία",
};
