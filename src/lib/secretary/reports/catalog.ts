import type {
  ReportDeliveryMethod,
  ReportRequestSource,
} from "@/lib/secretary/types";

export type ReportTypeDef = { code: string; labelEl: string };

export const REPORT_TYPES: ReportTypeDef[] = [
  { code: "progress", labelEl: "Αναφορά προόδου" },
  { code: "evaluation", labelEl: "Αξιολογητική έκθεση" },
  { code: "reevaluation", labelEl: "Επαναξιολογητική έκθεση" },
  { code: "school", labelEl: "Αναφορά προς σχολείο" },
  { code: "doctor", labelEl: "Αναφορά προς γιατρό" },
  { code: "kedasy", labelEl: "Αναφορά προς ΚΕΔΑΣΥ" },
  { code: "public_authority", labelEl: "Αναφορά προς δημόσιο φορέα" },
  { code: "parent_brief", labelEl: "Σύντομη ενημερωτική αναφορά γονέα" },
  { code: "interdisciplinary", labelEl: "Διεπιστημονική αναφορά" },
  { code: "other", labelEl: "Άλλο" },
];

export const REPORT_SOURCES: { code: ReportRequestSource; labelEl: string }[] = [
  { code: "parent", labelEl: "Γονέας" },
  { code: "school", labelEl: "Σχολείο" },
  { code: "doctor", labelEl: "Γιατρός" },
  { code: "therapist", labelEl: "Θεραπευτής" },
  { code: "supervisor", labelEl: "Επόπτης" },
  { code: "clinical_director", labelEl: "Κλινικός διευθυντής" },
  { code: "management", labelEl: "Διοίκηση" },
  { code: "other", labelEl: "Άλλο" },
];

export const REPORT_DELIVERY_METHODS: { code: ReportDeliveryMethod; labelEl: string }[] = [
  { code: "email", labelEl: "Email" },
  { code: "print", labelEl: "Εκτύπωση" },
  { code: "in_person", labelEl: "Δια ζώσης" },
  { code: "parent_portal", labelEl: "Parent portal" },
  { code: "other", labelEl: "Άλλο" },
];

export const REPORT_THERAPIST_OPTIONS = [
  "Βασιλείου Ν.",
  "Ζωγράφου Σ.",
  "Παπαδάκη Μ.",
  "Κωνσταντίνου Ε.",
] as const;

export const REPORT_SUPERVISOR_OPTIONS = ["Επόπτης Λογ.", "Επόπτης Εργ.", "Επόπτης Ψυχ."] as const;

export function reportTypeLabel(code: string): string {
  return REPORT_TYPES.find((t) => t.code === code)?.labelEl ?? code;
}

export function reportSourceLabel(code: ReportRequestSource): string {
  return REPORT_SOURCES.find((s) => s.code === code)?.labelEl ?? code;
}

export function deliveryMethodLabel(code: ReportDeliveryMethod): string {
  return REPORT_DELIVERY_METHODS.find((m) => m.code === code)?.labelEl ?? code;
}
