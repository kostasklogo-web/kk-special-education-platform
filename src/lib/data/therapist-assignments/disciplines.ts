/** Specialty codes for clinical assignments (Greek labels). */

export const DISCIPLINE_LABELS_EL: Record<string, string> = {
  speech_therapy: "Λογοθεραπεία",
  occupational_therapy: "Εργοθεραπεία",
  psychotherapy: "Ψυχοθεραπεία",
  special_education: "Ειδική Διαπαιδαγώγηση",
  executive_functions: "Επιτελικές Λειτουργίες",
  social_skills: "Κοινωνικές Δεξιότητες",
  parent_counseling: "Συμβουλευτική Γονέων",
  psychology: "Ψυχολογία",
  social_work: "Κοινωνική Εργασία",
};

export function disciplineLabelEl(code: string | null | undefined): string | null {
  if (!code) return null;
  return DISCIPLINE_LABELS_EL[code] ?? code;
}
