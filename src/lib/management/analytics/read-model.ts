/**
 * Management analytics read model — demo data + period comparisons.
 */

import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { compareIndex, compareValues } from "./compare";
import {
  ANALYTICS_CASE_FLOW_SERIES,
  ANALYTICS_FINANCIAL_SERIES,
  MONTH_LABELS_EL,
  therapistRowsForPeriod,
} from "./demo-data";
import { formatEuro, formatPct } from "./labels";
import type {
  AnalyticsFiltersState,
  AnalyticsPeriodKind,
  ComparedMetric,
  FinancialSnapshot,
  ManagementAnalyticsModel,
} from "./types";

function seriesForPeriod(period: AnalyticsPeriodKind) {
  return ANALYTICS_FINANCIAL_SERIES[period] ?? ANALYTICS_FINANCIAL_SERIES.month;
}

function resolveIndex(period: AnalyticsPeriodKind, anchorYmd: string): number {
  const series = seriesForPeriod(period);
  if (period === "month") {
    const m = Number(anchorYmd.slice(5, 7)) - 1;
    return Math.min(Math.max(0, m), series.length - 1);
  }
  if (period === "year") {
    const y = Number(anchorYmd.slice(0, 4));
    return Math.min(Math.max(0, y - 2024), series.length - 1);
  }
  const day = Number(anchorYmd.slice(8, 10));
  return Math.min(Math.max(0, (day - 1) % series.length), series.length - 1);
}

function periodLabel(period: AnalyticsPeriodKind, anchorYmd: string, customFrom?: string, customTo?: string): string {
  if (period === "custom" && customFrom && customTo) {
    return `${customFrom} — ${customTo}`;
  }
  const [y, m, d] = anchorYmd.split("-").map(Number);
  if (period === "day") return `${d}/${m}/${y}`;
  if (period === "week") return `Εβδομάδα · ${d}/${m}/${y}`;
  if (period === "month") return `${MONTH_LABELS_EL[m - 1] ?? "—"} ${y}`;
  if (period === "year") return `Έτος ${y}`;
  return `${MONTH_LABELS_EL[m - 1] ?? "—"} ${y}`;
}

function comparePeriodLabel(
  period: AnalyticsPeriodKind,
  compareIndexVal: number,
  compareMode: AnalyticsFiltersState["compareMode"]
): string {
  const suffix =
    compareMode === "same_period_last_year"
      ? " (προηγ. έτος)"
      : compareMode === "same_period_last_month"
        ? " (προηγ. μήνας)"
        : compareMode === "selected_period"
          ? " (επιλεγμένη)"
          : " (προηγ.)";
  if (period === "month") return `${MONTH_LABELS_EL[compareIndexVal % 12] ?? "—"}${suffix}`;
  if (period === "year") return `${2024 + compareIndexVal}${suffix}`;
  return `Περίοδος ${compareIndexVal + 1}${suffix}`;
}

function financialToCompared(
  id: string,
  label: string,
  current: number,
  previous: number,
  format: "euro" | "pct" = "euro",
  managementOnly = false
): ComparedMetric {
  const comparison = compareValues(current, previous);
  return {
    id,
    label,
    formatted: format === "pct" ? formatPct(current) : formatEuro(current),
    comparison,
    helper: `${format === "pct" ? formatPct(comparison.deltaPct, true) : formatEuro(comparison.delta)} vs σύγκριση`,
    managementOnly,
  };
}

function buildFinancialCompared(
  current: FinancialSnapshot,
  previous: FinancialSnapshot,
  fullAccess: boolean
): ComparedMetric[] {
  const mask = !fullAccess;
  return [
    financialToCompared("turnover", "Τζίρος", current.turnover, previous.turnover, "euro", mask),
    financialToCompared("real_revenue", "Πραγματικά έσοδα", current.realRevenue, previous.realRevenue, "euro", mask),
    financialToCompared(
      "calculated_revenue",
      "Υπολογιζόμενα έσοδα",
      current.calculatedRevenue,
      previous.calculatedRevenue,
      "euro",
      mask
    ),
    financialToCompared(
      "forecast_revenue",
      "Πρόβλεψη εσόδων",
      current.forecastRevenue,
      previous.forecastRevenue,
      "euro",
      mask
    ),
    financialToCompared("cash_flow", "Ταμειακή ροή", current.cashFlow, previous.cashFlow, "euro", mask),
    financialToCompared("expenses", "Έξοδα", current.expenses, previous.expenses, "euro", true),
    financialToCompared("net_result", "Καθαρό αποτέλεσμα", current.netResult, previous.netResult, "euro", true),
    financialToCompared(
      "budget_actual",
      "Budget vs Actual",
      current.budgetActual,
      previous.budgetActual,
      "euro",
      true
    ),
    financialToCompared("outstanding", "Ανεξόφλητα", current.outstanding, previous.outstanding, "euro", mask),
    financialToCompared(
      "collection_rate",
      "Είσπραξη / τζίρος",
      current.collectionRatePct,
      previous.collectionRatePct,
      "pct",
      mask
    ),
  ];
}

function buildCaseFlowCompared(
  current: (typeof ANALYTICS_CASE_FLOW_SERIES)[0],
  previous: (typeof ANALYTICS_CASE_FLOW_SERIES)[0]
): ComparedMetric[] {
  const pairs: [string, string, keyof typeof current][] = [
    ["new_cases", "Νέα περιστατικά", "newCases"],
    ["active", "Ενεργά παιδιά", "activeChildren"],
    ["paused", "Σε αναστολή", "pausedCases"],
    ["completed", "Ολοκληρωμένα προγράμματα", "completedPrograms"],
    ["waiting", "Λίστα αναμονής", "waitingList"],
    ["eval_done", "Ολοκληρωμένες αξιολογήσεις", "evaluationsCompleted"],
    ["eval_pending", "Εκκρεμείς αξιολογήσεις", "evaluationsPending"],
    ["conversions", "Μετατροπές αξιολ. → πρόγραμμα", "evalToProgramConversions"],
    ["exits", "Αποχωρήσεις", "exits"],
    ["reactivations", "Επανενεργοποιήσεις", "reactivations"],
  ];
  return pairs.map(([id, label, key]) => {
    const c = current[key] as number;
    const p = previous[key] as number;
    const comparison = compareValues(c, p);
    return {
      id,
      label,
      formatted: String(c),
      comparison,
      helper: `${comparison.delta >= 0 ? "+" : ""}${comparison.delta} vs σύγκριση`,
    };
  });
}

export function buildManagementAnalyticsModel(
  filters: AnalyticsFiltersState,
  fullAccess: boolean
): ManagementAnalyticsModel {
  const anchorYmd = filters.anchorYmd || todayAthensYmd();
  const series = seriesForPeriod(filters.period);
  const caseSeries = ANALYTICS_CASE_FLOW_SERIES;
  const idx = resolveIndex(filters.period, anchorYmd);
  const prevIdx = compareIndex(idx, series.length, filters.compareMode);

  const currentFin = series[idx] ?? series[series.length - 1]!;
  const previousFin = series[prevIdx] ?? series[0]!;
  const currentCase = caseSeries[idx % caseSeries.length] ?? caseSeries[0]!;
  const previousCase = caseSeries[prevIdx % caseSeries.length] ?? caseSeries[0]!;

  const therapistRows = therapistRowsForPeriod(idx).filter((t) => {
    if (filters.centerFilter && filters.centerFilter !== "all" && t.center !== filters.centerFilter) {
      return false;
    }
    if (filters.specialtyFilter && filters.specialtyFilter !== "all" && t.specialty !== filters.specialtyFilter) {
      return false;
    }
    if (filters.therapistFilter && filters.therapistFilter !== "all" && t.id !== filters.therapistFilter) {
      return false;
    }
    return true;
  });

  const prevTherapists = therapistRowsForPeriod(prevIdx);
  const therapistRowsWithCompare = therapistRows.map((row) => {
    const prev = prevTherapists.find((p) => p.id === row.id);
    return {
      ...row,
      comparison: prev
        ? compareValues(row.completedSessions, prev.completedSessions)
        : compareValues(row.completedSessions, row.completedSessions),
    };
  });

  const chartSeries = [
    { label: "Τζίρος", current: currentFin.turnover, previous: previousFin.turnover },
    { label: "Πραγματικά", current: currentFin.realRevenue, previous: previousFin.realRevenue },
    { label: "Έξοδα", current: currentFin.expenses, previous: previousFin.expenses },
    { label: "Καθαρό", current: currentFin.netResult, previous: previousFin.netResult },
  ];

  const budgetVariance = currentFin.budgetActual - currentFin.budgetTarget;

  return {
    periodLabel: periodLabel(filters.period, anchorYmd, filters.customFrom, filters.customTo),
    comparePeriodLabel: comparePeriodLabel(filters.period, prevIdx, filters.compareMode),
    filters: { ...filters, anchorYmd },
    financial: buildFinancialCompared(currentFin, previousFin, fullAccess),
    therapistRows: therapistRowsWithCompare,
    caseFlow: {
      metrics: buildCaseFlowCompared(currentCase, previousCase),
      snapshot: currentCase,
    },
    dailyReport: {
      dateLabel: periodLabel("day", anchorYmd),
      revenueToday: DAILY_FROM(currentFin).realRevenue,
      completedSessions: 47,
      absences: 3,
      cancellations: 2,
      newLeads: 2,
      urgentIssues: ["Καθυστέρηση αναφοράς — Τσίτσος Μ.", "Έλεγχος διοίκησης — Φωτίου Κ."],
      pendingTasks: 14,
      cashIn: Math.round(currentFin.cashFlow * 0.6),
      cashOut: Math.round(currentFin.expenses / 22),
    },
    weeklyReport: {
      weekLabel: periodLabel("week", anchorYmd),
      weeklyRevenue: currentFin.realRevenue,
      weeklyCashFlow: currentFin.cashFlow,
      therapistProductivityPct: 86,
      attendanceTrendPct: 94.2,
      newCases: currentCase.newCases,
      reportDelays: 5,
      operationalRisks: ["Χαμηλή είσπραξη Παρασκευής", "2 εκκρεμείς αξιολογήσεις Εύοσμος"],
    },
    monthlyReport: {
      monthLabel: periodLabel("month", anchorYmd),
      revenue: currentFin.realRevenue,
      expenses: currentFin.expenses,
      netResult: currentFin.netResult,
      budgetVariance,
      therapistUtilizationPct: 85,
      caseFlowSummary: `${currentCase.newCases} νέα · ${currentCase.activeChildren} ενεργά · ${currentCase.waitingList} αναμονή`,
      diagnosisRiskCount: 3,
      collectionRiskLevel:
        currentFin.collectionRatePct < 85 ? "high" : currentFin.collectionRatePct < 90 ? "medium" : "low",
    },
    yearlyReport: {
      yearLabel: periodLabel("year", anchorYmd),
      annualTurnover: currentFin.turnover * (filters.period === "year" ? 1 : 12),
      annualRealRevenue: currentFin.realRevenue * (filters.period === "year" ? 1 : 12),
      annualExpenses: currentFin.expenses * (filters.period === "year" ? 1 : 12),
      netProfitLoss: currentFin.netResult * (filters.period === "year" ? 1 : 12),
      centerComparison: [
        { center: "Νίκαια", revenue: Math.round(currentFin.realRevenue * 0.76), sharePct: 76 },
        { center: "Εύοσμος", revenue: Math.round(currentFin.realRevenue * 0.24), sharePct: 24 },
      ],
      therapistProductivityPct: 84,
      childFlowNet: currentCase.newCases - currentCase.exits + currentCase.reactivations,
      growthTrendPct: compareValues(currentFin.realRevenue, previousFin.realRevenue).deltaPct,
    },
    chartSeries,
  };
}

function DAILY_FROM(fin: FinancialSnapshot): FinancialSnapshot {
  return {
    ...fin,
    realRevenue: Math.round(fin.realRevenue / 5),
    turnover: Math.round(fin.turnover / 5),
  };
}

export function defaultAnalyticsFilters(): AnalyticsFiltersState {
  return {
    period: "month",
    anchorYmd: todayAthensYmd(),
    compareMode: "previous_period",
    centerFilter: "all",
    specialtyFilter: "all",
    therapistFilter: "all",
  };
}
