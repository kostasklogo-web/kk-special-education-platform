import type { SessionBillingType, SessionPaymentStatus } from "./types";

export const SESSION_PAYMENT_STATUS_LABELS: Record<SessionPaymentStatus, string> = {
  paid: "Εξοφλημένη",
  partial: "Μερική πληρωμή",
  outstanding: "Ανεξόφλητη",
  not_due: "Μελλοντική",
  waived: "Δεν χρεώνεται",
};

export const SESSION_BILLING_STATUS_LABELS: Record<string, string> = {
  billable: "Χρεώσιμη",
  non_billable: "Μη χρεώσιμη",
  cancelled: "Ακυρωμένη",
  absence: "Απουσία",
  invoiced: "Τιμολογημένη",
};

export const BILLING_TYPE_LABELS_EL: Record<SessionBillingType, string> = {
  individual_45: "Ατομική 45′",
  clinical_50: "Κλινική / Ψυχ. 50′",
  group_90: "Ομαδική 90′",
  evaluation: "Αξιολόγηση",
  parent_counseling: "Συμβουλευτική γονέων",
  makeup: "Αναπληρωματική",
  cancelled: "Ακυρωμένη",
  absence: "Απουσία",
  supervision: "Εποπτεία",
  non_billable: "Μη χρεώσιμη",
};
