export type FinanceCenterCode = "nikaia" | "evosmos" | "omilos";

export type TrendDirection = "up" | "down" | "flat";

export type ParentBalanceStatus =
  | "current"
  | "due_soon"
  | "overdue"
  | "partial"
  | "management_review";

export type ParentPaymentRisk = "low" | "medium" | "high" | "critical";

export type ExpenseCategoryCode =
  | "rent"
  | "payroll"
  | "freelancers"
  | "utilities"
  | "materials"
  | "software"
  | "marketing"
  | "maintenance"
  | "other";

export type BudgetCategoryCode =
  | "payroll"
  | "freelancers"
  | "rent"
  | "utilities"
  | "marketing"
  | "software"
  | "supplies"
  | "maintenance"
  | "other";

export type FinanceAlertLevel = "info" | "warning" | "critical";

export type FinanceAlertKind =
  | "overdue_payment"
  | "missing_receipt"
  | "high_expense"
  | "negative_cashflow"
  | "management_review"
  | "budget_exceeded"
  | "low_collection"
  | "expense_spike"
  | "cashflow_risk";

export type RevenueSliceRow = {
  id: string;
  label: string;
  amount: number;
  sharePct: number;
};

export type ParentBalanceRow = {
  id: string;
  parentName: string;
  childName: string;
  center: FinanceCenterCode;
  programLabel: string;
  monthlyFee: number;
  amountPaid: number;
  outstandingBalance: number;
  overdueDays: number;
  status: ParentBalanceStatus;
  paymentConsistencyPct: number;
  riskLevel: ParentPaymentRisk;
};

export type FinanceTransactionRow = {
  id: string;
  paymentDate: string;
  parentName: string;
  childName: string;
  center: FinanceCenterCode;
  amount: number;
  paymentMethod: "cash" | "bank_transfer" | "pos" | "iris" | "other";
  relatedMonth: string;
  receiptStatus: "issued" | "pending" | "not_required" | "needs_review";
};

export type FinanceExpenseRow = {
  id: string;
  category: ExpenseCategoryCode;
  description: string;
  center: FinanceCenterCode | "omilos";
  amount: number;
  expenseMonth: string;
  vendorLabel: string;
  paidAt: string | null;
};

export type CashFlowMonthRow = {
  month: string;
  labelEl: string;
  inflow: number;
  outflow: number;
  liquidityEnd?: number;
};

export type BudgetLineRow = {
  category: BudgetCategoryCode;
  label: string;
  budgetAmount: number;
  actualAmount: number;
  variance: number;
  variancePct: number;
};

export type UpcomingCashEvent = {
  id: string;
  dateYmd: string;
  label: string;
  amount: number;
  type: "inflow" | "outflow";
  category?: string;
};

export type FinanceAlert = {
  id: string;
  kind: FinanceAlertKind;
  level: FinanceAlertLevel;
  title: string;
  detail: string;
  href?: string;
};

export type ExecutiveKpi = {
  id: string;
  label: string;
  value: number;
  formatted: string;
  helper: string;
  trend: TrendDirection;
  trendLabel: string;
  tone: "positive" | "negative" | "neutral" | "warning";
  managementOnly?: boolean;
};

export type FinanceForecastSnapshot = {
  nextMonthLabel: string;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedNet: number;
  collectionRateForecastPct: number;
  riskSummary: string;
  riskLevel: FinanceAlertLevel;
};

export type ExecutiveFinanceModel = {
  monthLabel: string;
  monthYmd: string;
  kpis: ExecutiveKpi[];
  cashFlowPct: number;
  collectionRatePct: number;
  budgetRevenueTarget: number;
  budgetRevenueActual: number;
  budgetExpenseTotal: number;
  budgetExpenseActual: number;
  revenueByCenter: RevenueSliceRow[];
  revenueBySpecialty: RevenueSliceRow[];
  revenueByTherapist: RevenueSliceRow[];
  revenueByProgramType: RevenueSliceRow[];
  revenueByGroupPrograms: RevenueSliceRow[];
  revenueByEvaluations: RevenueSliceRow[];
  budgetLines: BudgetLineRow[];
  cashFlowMonths: CashFlowMonthRow[];
  currentLiquidity: number;
  upcomingLiabilities: UpcomingCashEvent[];
  upcomingInflows: UpcomingCashEvent[];
  cashFlowForecastNet: number;
  cashFlowWarning: boolean;
  forecast: FinanceForecastSnapshot;
  priorMonthComparison: {
    turnoverDeltaPct: number;
    realRevenueDeltaPct: number;
    expensesDeltaPct: number;
  };
};

/** @deprecated Use ExecutiveFinanceModel — kept for compatibility */
export type FinanceDashboardSnapshot = {
  monthLabel: string;
  monthYmd: string;
  revenueTotal: number;
  expensesTotal: number;
  netOperating: number;
  outstandingBalances: number;
  dueThisWeek: number;
  overduePayments: number;
  revenueByCenter: { center: FinanceCenterCode; label: string; amount: number }[];
  expensesByCategory: { category: ExpenseCategoryCode; label: string; amount: number }[];
};
