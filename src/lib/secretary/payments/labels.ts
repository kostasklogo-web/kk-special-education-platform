import type {
  PaymentMethod,
  PaymentReceiptStatus,
  PaymentStatus,
} from "@/lib/secretary/types";
import type { AppointmentLocationCode } from "@/lib/secretary/types";
import { LOCATION_LABELS } from "@/lib/secretary/labels";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Μετρητά",
  bank_transfer: "Τραπεζική κατάθεση",
  pos: "POS",
  iris: "IRIS",
  other: "Άλλο",
};

export const RECEIPT_STATUS_LABELS: Record<PaymentReceiptStatus, string> = {
  pending: "Εκκρεμεί",
  issued: "Εκδόθηκε",
  not_required: "Δεν απαιτείται",
  needs_review: "Χρειάζεται έλεγχο",
};

export const PAYMENT_DISPLAY_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Εξοφλημένο",
  partially_paid: "Μερική πληρωμή",
  due_soon: "Προσεχώς λήξη",
  overdue_1_30: "Καθυστέρηση 1–30 ημέρες",
  overdue_30_60: "Καθυστέρηση 30–60 ημέρες",
  overdue_60_plus: "Καθυστέρηση 60+ ημέρες",
  suspended_management: "Αναστολή / διοίκηση",
  overdue: "Καθυστέρηση",
  suspended: "Αναστολή",
};

export const PAYMENT_STATUS_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "bg-emerald-100 text-emerald-900 border-emerald-200",
  partially_paid: "bg-amber-100 text-amber-950 border-amber-200",
  due_soon: "bg-amber-100 text-amber-950 border-amber-200",
  overdue_1_30: "bg-red-100 text-red-900 border-red-200",
  overdue_30_60: "bg-red-100 text-red-950 border-red-300",
  overdue_60_plus: "bg-red-950 text-red-50 border-red-900",
  suspended_management: "bg-red-950 text-red-50 border-red-900",
  overdue: "bg-red-100 text-red-900 border-red-200",
  suspended: "bg-red-950 text-red-50 border-red-900",
};

export function locationLabel(code: AppointmentLocationCode): string {
  if (code === "nikaia" || code === "evosmos") return LOCATION_LABELS[code];
  return LOCATION_LABELS[code];
}

export const OVERDUE_FILTER_OPTIONS = [
  { value: "all", label: "Όλες καθυστερήσεις" },
  { value: "overdue_1_30", label: "1–30 ημέρες" },
  { value: "overdue_30_60", label: "30–60 ημέρες" },
  { value: "overdue_60_plus", label: "60+ ημέρες" },
  { value: "suspended_management", label: "Διοίκηση" },
] as const;

export type OverdueFilter = (typeof OVERDUE_FILTER_OPTIONS)[number]["value"];
