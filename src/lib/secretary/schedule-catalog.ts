/** Demo lookup options for secretary schedule UI (replace with Supabase loaders). */

import type { AppointmentLocationCode } from "./types";

export type ScheduleSelectOption = { id: string; label: string };

export type ScheduleRoomOption = ScheduleSelectOption & {
  locationCode: AppointmentLocationCode;
};

export const SECRETARY_SCHEDULE_APPOINTMENT_TYPES = [
  { code: "initial_inquiry", nameEl: "Αρχική επικοινωνία", defaultDurationMin: 15 },
  { code: "parent_info", nameEl: "Ενημερωτικό ραντεβού", defaultDurationMin: 45 },
  { code: "history_taking", nameEl: "Λήψη ιστορικού", defaultDurationMin: 60 },
  { code: "evaluation", nameEl: "Αξιολόγηση", defaultDurationMin: 60 },
  { code: "reevaluation", nameEl: "Επαναξιολόγηση", defaultDurationMin: 60 },
  { code: "therapy_session", nameEl: "Θεραπευτική συνεδρία", defaultDurationMin: 45 },
  { code: "group_program", nameEl: "Ομαδικό πρόγραμμα", defaultDurationMin: 90 },
  { code: "study", nameEl: "Μελέτη", defaultDurationMin: 45 },
  { code: "early_intervention", nameEl: "Πρώιμη παρέμβαση", defaultDurationMin: 45 },
  { code: "parent_counseling", nameEl: "Συμβουλευτική γονέων", defaultDurationMin: 50 },
  { code: "parent_education", nameEl: "Εκπαίδευση γονέων", defaultDurationMin: 50 },
  { code: "supervision", nameEl: "Εποπτεία", defaultDurationMin: 60 },
  { code: "internal_meeting", nameEl: "Εσωτερική συνάντηση", defaultDurationMin: 45 },
  { code: "emergency_meeting", nameEl: "Έκτακτη συνάντηση", defaultDurationMin: 30 },
  { code: "school_comm", nameEl: "Επικοινωνία με σχολείο", defaultDurationMin: 30 },
  { code: "doctor_comm", nameEl: "Επικοινωνία με γιατρό", defaultDurationMin: 30 },
  { code: "teacher_comm", nameEl: "Επικοινωνία με δάσκαλο", defaultDurationMin: 30 },
  { code: "parallel_support_comm", nameEl: "Επικοινωνία με παράλληλη στήριξη", defaultDurationMin: 30 },
  { code: "progress_report_delivery", nameEl: "Παράδοση αναφοράς προόδου", defaultDurationMin: 30 },
  { code: "diagnosis_renewal", nameEl: "Ανανέωση γνωμάτευσης", defaultDurationMin: 30 },
] as const;

export type SecretaryScheduleTypeCode = (typeof SECRETARY_SCHEDULE_APPOINTMENT_TYPES)[number]["code"];

export const SECRETARY_DEMO_THERAPISTS: ScheduleSelectOption[] = [
  { id: "staff-demo-1", label: "Δρ. Ανδρέου (ΚΔ)" },
  { id: "staff-demo-2", label: "Γεωργίου Ε. (Ψυχ.)" },
  { id: "staff-demo-3", label: "Βασιλείου Ν. (Λογ.)" },
  { id: "staff-demo-4", label: "Ζωγράφου Σ. (Εργ.)" },
];

export const SECRETARY_DEMO_ROOMS: ScheduleRoomOption[] = [
  { id: "30000000-0000-4000-8000-000000000001", label: "Αίθ. 1", locationCode: "nikaia" },
  { id: "30000000-0000-4000-8000-000000000002", label: "Αίθ. 2", locationCode: "evosmos" },
  { id: "30000000-0000-4000-8000-000000000003", label: "Αίθ. 3", locationCode: "nikaia" },
  { id: "30000000-0000-4000-8000-000000000004", label: "Αίθ. 4", locationCode: "evosmos" },
];

export const SECRETARY_DEMO_CHILDREN: ScheduleSelectOption[] = [
  { id: "20000000-0000-4000-8000-000000000101", label: "Παπαδόπουλος Ν." },
  { id: "20000000-0000-4000-8000-000000000102", label: "Οικονομίδου Ε." },
  { id: "20000000-0000-4000-8000-000000000103", label: "Τσίτσος Μ." },
  { id: "20000000-0000-4000-8000-000000000104", label: "Φωτίου Κ." },
];

/** Demo parent labels keyed by child id. */
export const SECRETARY_DEMO_PARENT_BY_CHILD: Record<string, string> = {
  "20000000-0000-4000-8000-000000000101": "Παπαδόπουλου Μαρία",
  "20000000-0000-4000-8000-000000000102": "Οικονομίδης Γιάννης",
  "20000000-0000-4000-8000-000000000103": "Τσίτσου Ελένη",
  "20000000-0000-4000-8000-000000000104": "Φωτίου Ανδρέας",
};

export type LocationFilter = "omilos" | "nikaia" | "evosmos";

export const LOCATION_FILTER_OPTIONS: { value: LocationFilter; label: string }[] = [
  { value: "omilos", label: "Όμιλος" },
  { value: "nikaia", label: "Νίκαια" },
  { value: "evosmos", label: "Εύοσμος" },
];

export function appointmentTypeByCode(code: string) {
  return SECRETARY_SCHEDULE_APPOINTMENT_TYPES.find((t) => t.code === code);
}

export function parentLabelForChild(childId: string | null): string | null {
  if (!childId) return null;
  return SECRETARY_DEMO_PARENT_BY_CHILD[childId] ?? null;
}

export function matchesLocationFilter(
  locationCode: AppointmentLocationCode,
  filter: LocationFilter
): boolean {
  if (filter === "omilos") return locationCode === "nikaia" || locationCode === "evosmos";
  return locationCode === filter;
}
