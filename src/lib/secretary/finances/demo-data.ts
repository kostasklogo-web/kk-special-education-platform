/**
 * Static prototype — Financial Operations command center (/secretary/finances).
 */

import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import type {
  BudgetLineRow,
  CashFlowMonthRow,
  FinanceAlert,
  FinanceExpenseRow,
  FinanceForecastSnapshot,
  FinanceTransactionRow,
  ParentBalanceRow,
  RevenueSliceRow,
  UpcomingCashEvent,
} from "./types";
import { BUDGET_CATEGORY_LABELS } from "./labels";

export const MONTH = todayAthensYmd().slice(0, 7);
export const MONTH_YMD = `${MONTH}-01`;
export const MONTH_LABEL = "Μάιος 2026";

/** Core monthly scale (€) — Nikaia ~47k turnover contribution */
export const FINANCE_DEMO_NIKAIA_REVENUE = 47_200;
export const FINANCE_DEMO_EVOMOS_REVENUE = 11_400;
export const FINANCE_DEMO_TURNOVER = 62_400;
export const FINANCE_DEMO_REAL_REVENUE = 54_180;
export const FINANCE_DEMO_CALCULATED_REVENUE =
  FINANCE_DEMO_NIKAIA_REVENUE + FINANCE_DEMO_EVOMOS_REVENUE;
export const FINANCE_DEMO_FORECAST_REVENUE = 60_200;

export const FINANCE_DEMO_NIKAIA_RENT = 2_000;
export const FINANCE_DEMO_EVOMOS_RENT = 3_108;
export const FINANCE_DEMO_PAYROLL = 24_500;
export const FINANCE_DEMO_FREELANCERS = 10_500;

export const FINANCE_PARENT_BALANCES: ParentBalanceRow[] = [
  {
    id: "pb-1",
    parentName: "Παπαδόπουλου Μ.",
    childName: "Παπαδόπουλος Ν.",
    center: "nikaia",
    programLabel: "Λογοθεραπεία — 2×/εβδ.",
    monthlyFee: 320,
    amountPaid: 320,
    outstandingBalance: 0,
    overdueDays: 0,
    status: "current",
    paymentConsistencyPct: 98,
    riskLevel: "low",
  },
  {
    id: "pb-2",
    parentName: "Οικονομίδου Α.",
    childName: "Οικονομίδου Ε.",
    center: "evosmos",
    programLabel: "Εργοθεραπεία — 1×/εβδ.",
    monthlyFee: 280,
    amountPaid: 140,
    outstandingBalance: 140,
    overdueDays: 0,
    status: "partial",
    paymentConsistencyPct: 72,
    riskLevel: "medium",
  },
  {
    id: "pb-3",
    parentName: "Τσίτσου Α.",
    childName: "Τσίτσος Μ.",
    center: "nikaia",
    programLabel: "Εργοθεραπεία — 2×/εβδ.",
    monthlyFee: 280,
    amountPaid: 100,
    outstandingBalance: 180,
    overdueDays: 18,
    status: "overdue",
    paymentConsistencyPct: 55,
    riskLevel: "high",
  },
  {
    id: "pb-4",
    parentName: "Φωτίου Ανδρέας",
    childName: "Φωτίου Κ.",
    center: "nikaia",
    programLabel: "Ψυχολογία — πακέτο",
    monthlyFee: 360,
    amountPaid: 0,
    outstandingBalance: 360,
    overdueDays: 32,
    status: "management_review",
    paymentConsistencyPct: 28,
    riskLevel: "critical",
  },
  {
    id: "pb-5",
    parentName: "Κωνσταντίνου Ε.",
    childName: "Κωνσταντίνου Δ.",
    center: "evosmos",
    programLabel: "Λογοθεραπεία — 1×/εβδ.",
    monthlyFee: 260,
    amountPaid: 260,
    outstandingBalance: 0,
    overdueDays: 0,
    status: "current",
    paymentConsistencyPct: 100,
    riskLevel: "low",
  },
  {
    id: "pb-6",
    parentName: "Αλεξίου Π.",
    childName: "Αλεξίου Ι.",
    center: "nikaia",
    programLabel: "Ειδική εκπαίδευση",
    monthlyFee: 300,
    amountPaid: 150,
    outstandingBalance: 150,
    overdueDays: 5,
    status: "due_soon",
    paymentConsistencyPct: 68,
    riskLevel: "medium",
  },
  {
    id: "pb-7",
    parentName: "Δημητρίου Σ.",
    childName: "Δημητρίου Λ.",
    center: "nikaia",
    programLabel: "Ομαδικό πρόγραμμα",
    monthlyFee: 220,
    amountPaid: 220,
    outstandingBalance: 0,
    overdueDays: 0,
    status: "current",
    paymentConsistencyPct: 95,
    riskLevel: "low",
  },
  {
    id: "pb-8",
    parentName: "Νικολάου Κ.",
    childName: "Νικολάου Μ.",
    center: "evosmos",
    programLabel: "Λογοθεραπεία — 2×/εβδ.",
    monthlyFee: 320,
    amountPaid: 0,
    outstandingBalance: 320,
    overdueDays: 8,
    status: "overdue",
    paymentConsistencyPct: 42,
    riskLevel: "high",
  },
  {
    id: "pb-9",
    parentName: "Βασιλείου Ν.",
    childName: "Βασιλείου Α.",
    center: "nikaia",
    programLabel: "Αξιολόγηση + συνεδρίες",
    monthlyFee: 410,
    amountPaid: 410,
    outstandingBalance: 0,
    overdueDays: 0,
    status: "current",
    paymentConsistencyPct: 92,
    riskLevel: "low",
  },
  {
    id: "pb-10",
    parentName: "Σταμούλη Χ.",
    childName: "Σταμούλη Ε.",
    center: "evosmos",
    programLabel: "Εργοθεραπεία — 2×/εβδ.",
    monthlyFee: 290,
    amountPaid: 145,
    outstandingBalance: 145,
    overdueDays: 0,
    status: "partial",
    paymentConsistencyPct: 75,
    riskLevel: "medium",
  },
  {
    id: "pb-11",
    parentName: "Μιχαηλίδης Γ.",
    childName: "Μιχαηλίδης Θ.",
    center: "nikaia",
    programLabel: "Λογοθεραπεία",
    monthlyFee: 300,
    amountPaid: 300,
    outstandingBalance: 0,
    overdueDays: 0,
    status: "current",
    paymentConsistencyPct: 96,
    riskLevel: "low",
  },
  {
    id: "pb-12",
    parentName: "Γεωργίου Ε.",
    childName: "Γεωργίου Μ.",
    center: "evosmos",
    programLabel: "Εργοθεραπεία",
    monthlyFee: 275,
    amountPaid: 275,
    outstandingBalance: 0,
    overdueDays: 0,
    status: "current",
    paymentConsistencyPct: 94,
    riskLevel: "low",
  },
];

export const FINANCE_TRANSACTIONS: FinanceTransactionRow[] = [
  { id: "tx-1", paymentDate: `${MONTH}-02`, parentName: "Παπαδόπουλου Μ.", childName: "Παπαδόπουλος Ν.", center: "nikaia", amount: 320, paymentMethod: "bank_transfer", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-2", paymentDate: `${MONTH}-03`, parentName: "Κωνσταντίνου Ε.", childName: "Κωνσταντίνου Δ.", center: "evosmos", amount: 260, paymentMethod: "pos", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-3", paymentDate: `${MONTH}-05`, parentName: "Τσίτσου Α.", childName: "Τσίτσος Μ.", center: "nikaia", amount: 100, paymentMethod: "cash", relatedMonth: MONTH_YMD, receiptStatus: "pending" },
  { id: "tx-4", paymentDate: `${MONTH}-06`, parentName: "Δημητρίου Σ.", childName: "Δημητρίου Λ.", center: "nikaia", amount: 220, paymentMethod: "iris", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-5", paymentDate: `${MONTH}-08`, parentName: "Βασιλείου Ν.", childName: "Βασιλείου Α.", center: "nikaia", amount: 410, paymentMethod: "bank_transfer", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-6", paymentDate: `${MONTH}-09`, parentName: "Οικονομίδου Α.", childName: "Οικονομίδου Ε.", center: "evosmos", amount: 140, paymentMethod: "pos", relatedMonth: MONTH_YMD, receiptStatus: "needs_review" },
  { id: "tx-7", paymentDate: `${MONTH}-10`, parentName: "Αλεξίου Π.", childName: "Αλεξίου Ι.", center: "nikaia", amount: 150, paymentMethod: "cash", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-8", paymentDate: `${MONTH}-11`, parentName: "Σταμούλη Χ.", childName: "Σταμούλη Ε.", center: "evosmos", amount: 145, paymentMethod: "bank_transfer", relatedMonth: MONTH_YMD, receiptStatus: "pending" },
  { id: "tx-9", paymentDate: `${MONTH}-12`, parentName: "Μιχαηλίδης Γ.", childName: "Μιχαηλίδης Θ.", center: "nikaia", amount: 300, paymentMethod: "bank_transfer", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-10", paymentDate: `${MONTH}-13`, parentName: "Γεωργίου Ε.", childName: "Γεωργίου Μ.", center: "evosmos", amount: 275, paymentMethod: "pos", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-11", paymentDate: `${MONTH}-14`, parentName: "Παπαδόπουλου Μ.", childName: "Παπαδόπουλος Ν.", center: "nikaia", amount: 80, paymentMethod: "cash", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
  { id: "tx-12", paymentDate: `${MONTH}-15`, parentName: "Νικολάου Κ.", childName: "Νικολάου Μ.", center: "evosmos", amount: 200, paymentMethod: "bank_transfer", relatedMonth: MONTH_YMD, receiptStatus: "issued" },
];

export const FINANCE_EXPENSES: FinanceExpenseRow[] = [
  { id: "ex-rent-n", category: "rent", description: "Μηνιαίο ενοίκιο — Νίκαια", center: "nikaia", amount: FINANCE_DEMO_NIKAIA_RENT, expenseMonth: MONTH_YMD, vendorLabel: "Ιδιοκτήτης", paidAt: `${MONTH}-03` },
  { id: "ex-rent-e", category: "rent", description: "Μηνιαίο ενοίκιο — Εύοσμος", center: "evosmos", amount: FINANCE_DEMO_EVOMOS_RENT, expenseMonth: MONTH_YMD, vendorLabel: "Ιδιοκτήτης", paidAt: `${MONTH}-03` },
  { id: "ex-payroll", category: "payroll", description: "Μισθοδοσία μόνιμου προσωπικού", center: "omilos", amount: FINANCE_DEMO_PAYROLL, expenseMonth: MONTH_YMD, vendorLabel: "Εσωτερική", paidAt: `${MONTH}-28` },
  { id: "ex-freelance", category: "freelancers", description: "Συνεργάτες με μπλοκάκι", center: "omilos", amount: FINANCE_DEMO_FREELANCERS, expenseMonth: MONTH_YMD, vendorLabel: "Πολλαπλοί", paidAt: `${MONTH}-15` },
  { id: "ex-deko-n", category: "utilities", description: "ΔΕΗ + νερό — Νίκαια", center: "nikaia", amount: 1_120, expenseMonth: MONTH_YMD, vendorLabel: "ΔΕΗ / ΕΥΔΑΠ", paidAt: `${MONTH}-18` },
  { id: "ex-deko-e", category: "utilities", description: "ΔΕΗ + νερό — Εύοσμος", center: "evosmos", amount: 780, expenseMonth: MONTH_YMD, vendorLabel: "ΔΕΗ / ΕΥΔΑΠ", paidAt: `${MONTH}-18` },
  { id: "ex-materials", category: "materials", description: "Υλικά θεραπείας & γραφείου", center: "omilos", amount: 640, expenseMonth: MONTH_YMD, vendorLabel: "Προμηθευτές", paidAt: `${MONTH}-09` },
  { id: "ex-software", category: "software", description: "CRM, cloud, backups", center: "omilos", amount: 420, expenseMonth: MONTH_YMD, vendorLabel: "SaaS", paidAt: `${MONTH}-01` },
  { id: "ex-marketing", category: "marketing", description: "Meta + Google local", center: "omilos", amount: 950, expenseMonth: MONTH_YMD, vendorLabel: "Ads", paidAt: `${MONTH}-20` },
  { id: "ex-maint", category: "maintenance", description: "Κλιματισμός & εξοπλισμός", center: "nikaia", amount: 620, expenseMonth: MONTH_YMD, vendorLabel: "Τεχνική", paidAt: null },
  { id: "ex-other", category: "other", description: "Ασφάλιση, λογιστής, τράπεζα", center: "omilos", amount: 1_240, expenseMonth: MONTH_YMD, vendorLabel: "Λοιπά", paidAt: `${MONTH}-25` },
];

export const FINANCE_DEMO_EXPENSES_TOTAL = FINANCE_EXPENSES.reduce((s, e) => s + e.amount, 0);

export const FINANCE_BUDGET_LINES: BudgetLineRow[] = [
  { category: "payroll", label: BUDGET_CATEGORY_LABELS.payroll, budgetAmount: 24_000, actualAmount: FINANCE_DEMO_PAYROLL, variance: FINANCE_DEMO_PAYROLL - 24_000, variancePct: 2.1 },
  { category: "freelancers", label: BUDGET_CATEGORY_LABELS.freelancers, budgetAmount: 10_200, actualAmount: FINANCE_DEMO_FREELANCERS, variance: 300, variancePct: 2.9 },
  { category: "rent", label: BUDGET_CATEGORY_LABELS.rent, budgetAmount: 5_000, actualAmount: FINANCE_DEMO_NIKAIA_RENT + FINANCE_DEMO_EVOMOS_RENT, variance: 108, variancePct: 2.2 },
  { category: "utilities", label: BUDGET_CATEGORY_LABELS.utilities, budgetAmount: 1_800, actualAmount: 1_900, variance: 100, variancePct: 5.6 },
  { category: "marketing", label: BUDGET_CATEGORY_LABELS.marketing, budgetAmount: 800, actualAmount: 950, variance: 150, variancePct: 18.8 },
  { category: "software", label: BUDGET_CATEGORY_LABELS.software, budgetAmount: 400, actualAmount: 420, variance: 20, variancePct: 5.0 },
  { category: "supplies", label: BUDGET_CATEGORY_LABELS.supplies, budgetAmount: 550, actualAmount: 640, variance: 90, variancePct: 16.4 },
  { category: "maintenance", label: BUDGET_CATEGORY_LABELS.maintenance, budgetAmount: 500, actualAmount: 620, variance: 120, variancePct: 24.0 },
  { category: "other", label: BUDGET_CATEGORY_LABELS.other, budgetAmount: 1_100, actualAmount: 1_240, variance: 140, variancePct: 12.7 },
];

const SLICE = (rows: Omit<RevenueSliceRow, "sharePct">[]): Omit<RevenueSliceRow, "sharePct">[] => rows;

export const FINANCE_REVENUE_BY_SPECIALTY: Omit<RevenueSliceRow, "sharePct">[] = SLICE([
  { id: "sp-log", label: "Λογοθεραπεία", amount: 18_400 },
  { id: "sp-erg", label: "Εργοθεραπεία", amount: 14_200 },
  { id: "sp-psy", label: "Ψυχολογία", amount: 9_800 },
  { id: "sp-se", label: "Ειδική εκπαίδευση", amount: 7_600 },
  { id: "sp-kin", label: "Κινητικοτητα / Φυσικοθ.", amount: 4_200 },
  { id: "sp-other", label: "Λοιπές ειδικότητες", amount: 4_400 },
]);

export const FINANCE_REVENUE_BY_THERAPIST: Omit<RevenueSliceRow, "sharePct">[] = SLICE([
  { id: "th-1", label: "Βασιλείου Ν. (Λογ.)", amount: 8_200 },
  { id: "th-2", label: "Γεωργίου Ε. (Ψυχ.)", amount: 7_400 },
  { id: "th-3", label: "Δρ. Ανδρέου (ΚΔ)", amount: 6_900 },
  { id: "th-4", label: "Κωνσταντίνου (Εργ.)", amount: 6_100 },
  { id: "th-5", label: "Συνεργάτες μπλοκάκι", amount: 22_000 },
  { id: "th-6", label: "Λοιποί θεραπευτές", amount: 7_000 },
]);

export const FINANCE_REVENUE_BY_PROGRAM: Omit<RevenueSliceRow, "sharePct">[] = SLICE([
  { id: "pr-ind", label: "Ατομικές συνεδρίες", amount: 38_500 },
  { id: "pr-pkg", label: "Μηνιαία πακέτα", amount: 12_800 },
  { id: "pr-par", label: "Συμβουλευτική γονέων", amount: 2_400 },
  { id: "pr-sup", label: "Εποπτεία / εσωτερική", amount: 900 },
]);

export const FINANCE_REVENUE_BY_GROUP: Omit<RevenueSliceRow, "sharePct">[] = SLICE([
  { id: "gr-soc", label: "Ομάδες κοινωνικών δεξιοτήτων", amount: 2_800 },
  { id: "gr-log", label: "Ομάδες λογοθεραπείας", amount: 1_600 },
  { id: "gr-se", label: "Ομάδες ειδ. εκπαίδευσης", amount: 1_200 },
]);

export const FINANCE_REVENUE_BY_EVALUATIONS: Omit<RevenueSliceRow, "sharePct">[] = SLICE([
  { id: "ev-initial", label: "Αρχική αξιολόγηση", amount: 4_200 },
  { id: "ev-renew", label: "Ανανέωση γνωμάτευσης", amount: 1_800 },
  { id: "ev-school", label: "Αναφορά σχολείου", amount: 1_100 },
]);

export const FINANCE_CASH_FLOW: CashFlowMonthRow[] = [
  { month: "2026-01", labelEl: "Ιαν 2026", inflow: 52_400, outflow: 42_100, liquidityEnd: 14_200 },
  { month: "2026-02", labelEl: "Φεβ 2026", inflow: 53_800, outflow: 43_800, liquidityEnd: 15_100 },
  { month: "2026-03", labelEl: "Μαρ 2026", inflow: 55_200, outflow: 44_200, liquidityEnd: 16_400 },
  { month: "2026-04", labelEl: "Απρ 2026", inflow: 56_100, outflow: 45_600, liquidityEnd: 17_200 },
  {
    month: MONTH,
    labelEl: MONTH_LABEL,
    inflow: FINANCE_DEMO_REAL_REVENUE,
    outflow: FINANCE_DEMO_EXPENSES_TOTAL,
    liquidityEnd: 18_500,
  },
];

export const FINANCE_UPCOMING_LIABILITIES: UpcomingCashEvent[] = [
  { id: "ul-1", dateYmd: `${MONTH}-28`, label: "Μισθοδοσία μήνα", amount: FINANCE_DEMO_PAYROLL, type: "outflow", category: "payroll" },
  { id: "ul-2", dateYmd: `${MONTH}-20`, label: "Marketing (εκκρεμές)", amount: 950, type: "outflow", category: "marketing" },
  { id: "ul-3", dateYmd: `${MONTH}-22`, label: "Συντήρηση κλιματισμού", amount: 620, type: "outflow", category: "maintenance" },
  { id: "ul-4", dateYmd: "2026-06-03", label: "Ενοίκιο Ιούνιος (2 κέντρα)", amount: 5_108, type: "outflow", category: "rent" },
  { id: "ul-5", dateYmd: "2026-06-15", label: "Συνεργάτες μπλοκάκι", amount: 10_500, type: "outflow", category: "freelancers" },
];

export const FINANCE_UPCOMING_INFLOWS: UpcomingCashEvent[] = [
  { id: "ui-1", dateYmd: `${MONTH}-18`, label: "Αναμενόμενες εισπράξεις εβδομάδας", amount: 4_200, type: "inflow" },
  { id: "ui-2", dateYmd: `${MONTH}-25`, label: "Υπόλοιπα με προθεσμία", amount: 3_800, type: "inflow" },
  { id: "ui-3", dateYmd: "2026-06-05", label: "Πρώτες εισπράξεις Ιουνίου", amount: 8_400, type: "inflow" },
  { id: "ui-4", dateYmd: "2026-06-12", label: "Πακέτα μηνιαίας χρέωσης", amount: 12_600, type: "inflow" },
];

export const FINANCE_FORECAST: FinanceForecastSnapshot = {
  nextMonthLabel: "Ιούνιος 2026",
  projectedRevenue: 60_200,
  projectedExpenses: 48_200,
  projectedNet: 12_000,
  collectionRateForecastPct: 88.5,
  riskSummary:
    "Μέτριος κίνδυνος: 2 οικογένειες σε έλεγχο διοίκησης, marketing υπέρ budget, είσπραξη 86.8% — στόχος 90%.",
  riskLevel: "warning",
};

export const FINANCE_ALERTS: FinanceAlert[] = [
  { id: "al-1", kind: "overdue_payment", level: "critical", title: "Καθυστερημένη οφειλή — Φωτίου Κ.", detail: "360€ · 32 ημέρες · έλεγχος διοίκησης.", href: "/secretary/payments" },
  { id: "al-2", kind: "overdue_payment", level: "warning", title: "Καθυστερημένη — Τσίτσος Μ.", detail: "180€ · 18 ημέρες.", href: "/secretary/payments" },
  { id: "al-3", kind: "low_collection", level: "warning", title: "Χαμηλή είσπραξη μήνα", detail: `Είσπραξη 86.8% του τζίρου (${FINANCE_DEMO_REAL_REVENUE.toLocaleString("el-GR")}€ / ${FINANCE_DEMO_TURNOVER.toLocaleString("el-GR")}€). Στόχος 90%.` },
  { id: "al-4", kind: "budget_exceeded", level: "warning", title: "Υπέρβαση budget — Marketing", detail: "950€ actual vs 800€ budget (+18.8%)." },
  { id: "al-5", kind: "budget_exceeded", level: "warning", title: "Υπέρβαση budget — Συντήρηση", detail: "620€ vs 500€ budget (+24%)." },
  { id: "al-6", kind: "expense_spike", level: "info", title: "Αύξηση εξόδων μήνα", detail: "+3.1% vs Απρίλιο — κυρίως μισθοδοσία & marketing." },
  { id: "al-7", kind: "cashflow_risk", level: "warning", title: "Ταμειακή πίεση — 28/05", detail: "Μισθοδοσία 24.500€ · τρέχουσα ρευστότητα 18.500€." },
  { id: "al-8", kind: "negative_cashflow", level: "info", title: "Πρόβλεψη εβδομάδας 4", detail: "Προσωρινή εξόρυξη πριν τις εισπράξεις Ιουνίου." },
  { id: "al-9", kind: "missing_receipt", level: "warning", title: "Εκκρεμεί απόδειξη", detail: "Τσίτσου Α. · 100€ μετρητά." },
  { id: "al-10", kind: "management_review", level: "critical", title: "Έλεγχος διοίκησης", detail: "Φωτίου Κ. — αναστολή νέων ραντεβού.", href: "/secretary/payments" },
];
