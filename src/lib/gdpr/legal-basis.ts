import type { GdprModule, ModuleLegalInfo } from "./types";

export const MODULE_LEGAL_INFO: ModuleLegalInfo[] = [
  {
    module: "children",
    labelEl: "Παιδιά",
    legalBasis: "contract",
    requiresConsent: true,
    sensitiveCategory: "child",
    descriptionEl: "Δεδομένα ταυτοποίησης και επικοινωνίας παιδιού· βάση: εκτέλεση σύμβασης θεραπείας.",
  },
  {
    module: "diagnoses",
    labelEl: "Γνωματεύσεις",
    legalBasis: "legal_obligation",
    requiresConsent: false,
    sensitiveCategory: "health",
    descriptionEl: "Ειδική κατηγορία δεδομένων υγείας· νομική υποχρέωση & θεραπευτική αναγκαιότητα.",
  },
  {
    module: "reports",
    labelEl: "Αναφορές",
    legalBasis: "consent",
    requiresConsent: true,
    sensitiveCategory: "health",
    descriptionEl: "Κλινικές αναφορές· κοινοποίηση σε γονείς μόνο με συγκατάθεση/έγκριση.",
  },
  {
    module: "meetings",
    labelEl: "Συναντήσεις / Εποπτεία",
    legalBasis: "legitimate_interests",
    requiresConsent: false,
    sensitiveCategory: "health",
    descriptionEl: "Εσωτερικές & κλινικές συναντήσεις· περιορισμένη πρόσβαση ανά ρόλο.",
  },
  {
    module: "communications",
    labelEl: "Επικοινωνίες",
    legalBasis: "consent",
    requiresConsent: true,
    sensitiveCategory: "none",
    descriptionEl: "Καταγραφή επικοινωνίας· απαιτείται συγκατάθεση ανά κανάλι.",
  },
  {
    module: "reminders",
    labelEl: "Υπενθυμίσεις",
    legalBasis: "consent",
    requiresConsent: true,
    sensitiveCategory: "none",
    descriptionEl: "Αποστολή SMS/email/WhatsApp· μόνο με έγκριτο κανάλι.",
  },
  {
    module: "payments",
    labelEl: "Πληρωμές",
    legalBasis: "contract",
    requiresConsent: false,
    sensitiveCategory: "financial",
    descriptionEl: "Οικονομικά στοιχεία· σύμβαση & νομικές υποχρεώσεις λογιστικής.",
  },
  {
    module: "hr",
    labelEl: "Ανθρώπινο δυναμικό",
    legalBasis: "contract",
    requiresConsent: false,
    sensitiveCategory: "hr",
    descriptionEl: "Στοιχεία προσωπικού & αξιολογήσεις· πρόσβαση μόνο HR/διοίκηση.",
  },
  {
    module: "payroll",
    labelEl: "Μισθοδοσία",
    legalBasis: "legal_obligation",
    requiresConsent: false,
    sensitiveCategory: "financial",
    descriptionEl: "Μισθολογικά δεδομένα· αυστηρά περιορισμένη πρόσβαση.",
  },
  {
    module: "session_notes",
    labelEl: "Σημειώσεις συνεδρίας",
    legalBasis: "legitimate_interests",
    requiresConsent: false,
    sensitiveCategory: "health",
    descriptionEl: "Κλινικές σημειώσεις θεραπευτή· όχι προσβολή από γονέα.",
  },
  {
    module: "parent_portal",
    labelEl: "Πύλη γονέα",
    legalBasis: "consent",
    requiresConsent: true,
    sensitiveCategory: "child",
    descriptionEl: "Πρόσβαση γονέα μόνο στο δικό του παιδί & εγκεκριμένα έγγραφα.",
  },
];

export function legalInfoForModule(module: GdprModule): ModuleLegalInfo {
  return (
    MODULE_LEGAL_INFO.find((m) => m.module === module) ?? {
      module,
      labelEl: module,
      legalBasis: "legitimate_interests",
      requiresConsent: false,
      sensitiveCategory: "none",
      descriptionEl: "Επεξεργασία δεδομένων σύμφωνα με πολιτική οργανισμού.",
    }
  );
}
