import type { DiagnosisDocumentTypeCode } from "@/lib/secretary/types";

export const DIAGNOSIS_DOCUMENT_TYPES: {
  code: DiagnosisDocumentTypeCode;
  labelEl: string;
}[] = [
  { code: "kedasy", labelEl: "Γνωμάτευση ΚΕΔΑΣΥ" },
  { code: "public_hospital", labelEl: "Γνωμάτευση Δημόσιου Νοσοκομείου" },
  { code: "child_psychiatrist", labelEl: "Γνωμάτευση Παιδοψυχιάτρου" },
  { code: "developmental", labelEl: "Γνωμάτευση Αναπτυξιολόγου" },
  { code: "neurologist", labelEl: "Γνωμάτευση Νευρολόγου" },
  { code: "private_doctor", labelEl: "Γνωμάτευση Ιδιώτη Ιατρού" },
  { code: "therapy_referral", labelEl: "Παραπομπή θεραπείας" },
  { code: "school_certificate", labelEl: "Βεβαίωση σχολείου" },
  { code: "parallel_support_approval", labelEl: "Έγκριση παράλληλης στήριξης" },
  { code: "other", labelEl: "Άλλο" },
];

export const DIAGNOSIS_RESPONSIBLE_OPTIONS = [
  "Γραμματεία",
  "Υποδοχή Νίκαια",
  "Υποδοχή Εύοσμος",
  "Επόπτης",
  "Διοίκηση",
] as const;

export function documentTypeLabel(code: DiagnosisDocumentTypeCode): string {
  return DIAGNOSIS_DOCUMENT_TYPES.find((t) => t.code === code)?.labelEl ?? code;
}
