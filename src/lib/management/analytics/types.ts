/**
 * Management analytics read-model types (prototype — no DB schema).
 */

export type AnalyticsPeriodKind = "day" | "week" | "month" | "year" | "custom";

export type CompareMode =
  | "previous_period"
  | "same_period_last_month"
  | "same_period_last_year"
  | "selected_period";

export type AnalyticsSectionId =
  | "overview"
  | "financial"
  | "therapists"
  | "caseflow"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly";

export type TrendDirection = "up" | "down" | "flat";

export type MetricComparison = {
  current: number;
  previous: number;
  delta: number;
  deltaPct: number;
  trend: TrendDirection;
};

export type ComparedMetric = {
  id: string;
  label: string;
  formatted: string;
  comparison: MetricComparison;
  helper?: string;
  /** Hide value for limited roles */
  managementOnly?: boolean;
};

export type FinancialSnapshot = {
  turnover: number;
  realRevenue: number;
  calculatedRevenue: number;
  forecastRevenue: number;
  cashFlow: number;
  expenses: number;
  netResult: number;
  budgetActual: number;
  budgetTarget: number;
  outstanding: number;
  collectionRatePct: number;
};

export type TherapistKpiRow = {
  id: string;
  name: string;
  specialty: string;
  center: "nikaia" | "evosmos";
  scheduledHours: number;
  completedSessions: number;
  cancellations: number;
  absences: number;
  utilizationPct: number;
  noteCompletionPct: number;
  reportCompletionPct: number;
  supervisionSessions: number;
  avgCaseload: number;
  groupSessions: number;
  comparison?: MetricComparison;
};

export type CaseFlowSnapshot = {
  newCases: number;
  activeChildren: number;
  pausedCases: number;
  completedPrograms: number;
  waitingList: number;
  evaluationsCompleted: number;
  evaluationsPending: number;
  evalToProgramConversions: number;
  exits: number;
  reactivations: number;
};

export type DailyManagementReport = {
  dateLabel: string;
  revenueToday: number;
  completedSessions: number;
  absences: number;
  cancellations: number;
  newLeads: number;
  urgentIssues: string[];
  pendingTasks: number;
  cashIn: number;
  cashOut: number;
};

export type WeeklyManagementReport = {
  weekLabel: string;
  weeklyRevenue: number;
  weeklyCashFlow: number;
  therapistProductivityPct: number;
  attendanceTrendPct: number;
  newCases: number;
  reportDelays: number;
  operationalRisks: string[];
};

export type MonthlyManagementReport = {
  monthLabel: string;
  revenue: number;
  expenses: number;
  netResult: number;
  budgetVariance: number;
  therapistUtilizationPct: number;
  caseFlowSummary: string;
  diagnosisRiskCount: number;
  collectionRiskLevel: "low" | "medium" | "high";
};

export type YearlyManagementReport = {
  yearLabel: string;
  annualTurnover: number;
  annualRealRevenue: number;
  annualExpenses: number;
  netProfitLoss: number;
  centerComparison: { center: string; revenue: number; sharePct: number }[];
  therapistProductivityPct: number;
  childFlowNet: number;
  growthTrendPct: number;
};

export type AnalyticsFiltersState = {
  period: AnalyticsPeriodKind;
  anchorYmd: string;
  customFrom?: string;
  customTo?: string;
  compareMode: CompareMode;
  selectedCompareYmd?: string;
  therapistFilter?: string;
  specialtyFilter?: string;
  centerFilter?: "all" | "nikaia" | "evosmos" | string;
};

export type ManagementAnalyticsModel = {
  periodLabel: string;
  comparePeriodLabel: string;
  filters: AnalyticsFiltersState;
  financial: ComparedMetric[];
  therapistRows: TherapistKpiRow[];
  caseFlow: { metrics: ComparedMetric[]; snapshot: CaseFlowSnapshot };
  dailyReport: DailyManagementReport;
  weeklyReport: WeeklyManagementReport;
  monthlyReport: MonthlyManagementReport;
  yearlyReport: YearlyManagementReport;
  chartSeries: { label: string; current: number; previous: number }[];
};
