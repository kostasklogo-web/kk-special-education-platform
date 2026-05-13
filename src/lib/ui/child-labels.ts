import type { ChildGender, ChildStatus, PreferredLanguage } from "@/lib/data/children/types";

export const CHILD_STATUS_LABELS: Record<ChildStatus, string> = {
  active: "Ενεργό",
  on_hold: "Σε αναμονή",
  discharged: "Αποχώρηση",
};

export const CHILD_GENDER_LABELS: Record<ChildGender, string> = {
  male: "Αγόρι",
  female: "Κορίτσι",
  other: "Άλλο",
  unspecified: "Δεν δηλώθηκε",
};

export const PREFERRED_LANGUAGE_LABELS: Record<PreferredLanguage, string> = {
  el: "Ελληνικά",
  en: "English",
};

export function formatDateEl(isoDate: string | null): string {
  if (!isoDate) return "—";
  try {
    const d = new Date(isoDate + (isoDate.length <= 10 ? "T12:00:00" : ""));
    return new Intl.DateTimeFormat("el-GR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return isoDate;
  }
}

/** Ηλικία σε έτη (κοπή προς τα κάτω) για λίστες ρεσεψιόν και γρήγορη ταυτοποίηση. */
export function formatApproximateAgeYearsEl(dateOfBirth: string | null, reference = new Date()): string {
  if (!dateOfBirth) return "—";
  try {
    const birth = new Date(dateOfBirth + (dateOfBirth.length <= 10 ? "T12:00:00" : ""));
    if (Number.isNaN(birth.getTime())) return "—";
    let age = reference.getFullYear() - birth.getFullYear();
    const m = reference.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && reference.getDate() < birth.getDate())) {
      age -= 1;
    }
    if (age < 0) return "—";
    if (age === 0) return "<1 έτους";
    return `${age} ετών`;
  } catch {
    return "—";
  }
}
