import type {
  BudgetCategoryCode,
  ExpenseCategoryCode,
  FinanceCenterCode,
  FinanceTransactionRow,
  ParentBalanceStatus,
  ParentPaymentRisk,
} from "./types";

export const FINANCE_CENTER_LABELS: Record<FinanceCenterCode, string> = {
  nikaia: "Νίκαια",
  evosmos: "Εύοσμος",
  omilos: "Όμιλος",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategoryCode, string> = {
  rent: "Ενοίκιο",
  payroll: "Μισθοδοσία",
  freelancers: "Συνεργάτες με μπλοκάκι",
  utilities: "ΔΕΚΟ",
  materials: "Υλικά / Προμήθειες",
  software: "Software",
  marketing: "Marketing",
  maintenance: "Συντήρηση",
  other: "Λοιπά λειτουργικά",
};

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategoryCode, string> = {
  payroll: "Μισθοδοσία",
  freelancers: "Συνεργάτες",
  rent: "Ενοίκιο",
  utilities: "ΔΕΚΟ",
  marketing: "Marketing",
  software: "Software",
  supplies: "Προμήθειες",
  maintenance: "Συντήρηση",
  other: "Λοιπά",
};

export const PARENT_BALANCE_STATUS_LABELS: Record<ParentBalanceStatus, string> = {
  current: "Ενήμερο",
  due_soon: "Λήγει σύντομα",
  overdue: "Καθυστέρηση",
  partial: "Μερική πληρωμή",
  management_review: "Έλεγχος διοίκησης",
};

export const PARENT_RISK_LABELS: Record<ParentPaymentRisk, string> = {
  low: "Χαμηλός",
  medium: "Μέτριος",
  high: "Υψηλός",
  critical: "Κρίσιμος",
};

export const PAYMENT_METHOD_LABELS: Record<FinanceTransactionRow["paymentMethod"], string> = {
  cash: "Μετρητά",
  bank_transfer: "Τραπεζική",
  pos: "POS",
  iris: "IRIS",
  other: "Άλλο",
};

export const RECEIPT_STATUS_LABELS: Record<FinanceTransactionRow["receiptStatus"], string> = {
  issued: "Εκδόθηκε",
  pending: "Εκκρεμεί",
  not_required: "Δεν απαιτείται",
  needs_review: "Έλεγχος",
};

export const REVENUE_DEFINITIONS: { term: string; definition: string }[] = [
  { term: "Τζίρος (Turnover)", definition: "Συνολικό ποσό χρεώσεων / τιμολόγησης μήνα." },
  { term: "Πραγματικά έσοδα", definition: "Ποσά που εισπράχθηκαν πραγματικά (ταμείο & τράπεζα)." },
  { term: "Υπολογιζόμενα έσοδα", definition: "Αναμενόμενα έσοδα από προγραμματισμένα πακέτα & συνεδρίες." },
  { term: "Πρόβλεψη εσόδων", definition: "Εκτίμηση εσόδων επόμενου μήνα (ενεργά παιδιά + νέες εγγραφές)." },
];

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEuroPrecise(amount: number): string {
  return new Intl.NumberFormat("el-GR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPct(value: number, signed = false): string {
  const prefix = signed && value > 0 ? "+" : "";
  return `${prefix}${value.toFixed(1)}%`;
}
