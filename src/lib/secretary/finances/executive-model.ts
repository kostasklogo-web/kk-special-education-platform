/**
 * Builds management intelligence view from static demo data.
 */

import { safeBuildFinanceScheduleReadModel } from "@/lib/finance/finance-schedule-safe";
import { buildFallbackFinanceScheduleReadModel } from "@/lib/finance/finance-schedule-fallback";
import {
  FINANCE_BUDGET_LINES,
  FINANCE_CASH_FLOW,
  FINANCE_DEMO_EXPENSES_TOTAL,
  FINANCE_EXPENSES,
  FINANCE_FORECAST,
  FINANCE_UPCOMING_INFLOWS,
  FINANCE_UPCOMING_LIABILITIES,
} from "./demo-data";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import {
  EXPENSE_CATEGORY_LABELS,
  formatEuro,
  formatPct,
} from "./labels";
import type {
  ExecutiveFinanceModel,
  ExecutiveKpi,
  FinanceDashboardSnapshot,
  TrendDirection,
} from "./types";

function trendFromDelta(deltaPct: number): { trend: TrendDirection; trendLabel: string } {
  if (deltaPct > 0.5) return { trend: "up", trendLabel: formatPct(deltaPct, true) };
  if (deltaPct < -0.5) return { trend: "down", trendLabel: formatPct(deltaPct, true) };
  return { trend: "flat", trendLabel: "±0%" };
}

function buildExecutiveFinanceModelImpl(
  monthYmdInput?: string,
  forceScheduleFallback = false
): ExecutiveFinanceModel {
  let schedule;
  let scheduleUsedFallback = false;
  if (forceScheduleFallback) {
    schedule = { ...buildFallbackFinanceScheduleReadModel(), usedFallback: true };
    scheduleUsedFallback = true;
  } else {
    try {
      schedule = safeBuildFinanceScheduleReadModel(monthYmdInput ?? todayAthensYmd());
      scheduleUsedFallback = schedule.usedFallback;
    } catch {
      schedule = { ...buildFallbackFinanceScheduleReadModel(), usedFallback: true };
      scheduleUsedFallback = true;
    }
  }
  const sm = schedule.metrics;

  const calculatedRevenue = sm.calculatedRevenue;
  const realRevenue = sm.realRevenue;
  const turnover = sm.turnover;
  const outstanding = sm.outstandingBalance;
  const collectionRate = sm.collectionRatePct;
  const cashFlowPct =
    calculatedRevenue > 0 ? Math.round((realRevenue / calculatedRevenue) * 1000) / 10 : 0;

  const expensesTotal = FINANCE_DEMO_EXPENSES_TOTAL;
  const netReal = realRevenue - expensesTotal;
  const netCalculated = calculatedRevenue - expensesTotal;
  const budgetExpenseActual = expensesTotal;
  const budgetExpenseBudget = FINANCE_BUDGET_LINES.reduce((s, l) => s + l.budgetAmount, 0);
  const budgetRevenueTarget = 60_000;
  const budgetRevenueActual = realRevenue;
  const budgetVarianceExpenses = budgetExpenseActual - budgetExpenseBudget;
  const currentLiquidity = 18_500;
  const upcomingOut = FINANCE_UPCOMING_LIABILITIES.reduce((s, e) => s + e.amount, 0);
  const upcomingIn =
    FINANCE_UPCOMING_INFLOWS.reduce((s, e) => s + e.amount, 0) + sm.forecastRevenue;
  const cashFlowForecastNet = upcomingIn - upcomingOut + netReal * 0.15;
  const cashFlowWarning =
    cashFlowForecastNet < 5_000 ||
    upcomingOut > currentLiquidity + upcomingIn ||
    sm.collectionRiskLevel === "high";

  const tTurnover = trendFromDelta(2.4);
  const tReal = trendFromDelta(1.8);
  const tExp = trendFromDelta(3.1);

  const kpis: ExecutiveKpi[] = [
    {
      id: "cashflow",
      label: "Ταμειακή ροή (μήνας)",
      value: netReal,
      formatted: formatEuro(netReal),
      helper: `${cashFlowPct}% είσπραξη vs υπολογιζόμενα (από πρόγραμμα)`,
      trend: netReal >= 0 ? "up" : "down",
      trendLabel: tReal.trendLabel,
      tone: netReal >= 0 ? "positive" : "negative",
    },
    {
      id: "turnover",
      label: "Τζίρος (Turnover)",
      value: turnover,
      formatted: formatEuro(turnover),
      helper: "Τιμολογημένες χρεώσεις από πρόγραμμα",
      trend: tTurnover.trend,
      trendLabel: tTurnover.trendLabel,
      tone: "neutral",
    },
    {
      id: "real_revenue",
      label: "Πραγματικά έσοδα",
      value: realRevenue,
      formatted: formatEuro(realRevenue),
      helper: `Είσπραξη ${collectionRate}% του τζίρου · ${formatEuro(sm.collectionGap)} διαφορά`,
      trend: tReal.trend,
      trendLabel: tReal.trendLabel,
      tone: "positive",
    },
    {
      id: "calculated_revenue",
      label: "Υπολογιζόμενα έσοδα",
      value: calculatedRevenue,
      formatted: formatEuro(calculatedRevenue),
      helper: `${sm.billableSessionCount} χρεώσιμες συνεδρίες (πρόγραμμα)`,
      trend: "up",
      trendLabel: "+1.2%",
      tone: "neutral",
    },
    {
      id: "forecast_revenue",
      label: "Πρόβλεψη εσόδων (επόμενος)",
      value: sm.forecastRevenue,
      formatted: formatEuro(sm.forecastRevenue),
      helper: `${sm.forecastSessionCount} μελλοντικές χρεώσιμες · ${FINANCE_FORECAST.nextMonthLabel}`,
      trend: "up",
      trendLabel: "+2.7%",
      tone: "positive",
      managementOnly: false,
    },
    {
      id: "expenses",
      label: "Μηνιαία έξοδα",
      value: expensesTotal,
      formatted: formatEuro(expensesTotal),
      helper:
        budgetVarianceExpenses > 0
          ? `Υπέρβαση budget ${formatEuro(budgetVarianceExpenses)}`
          : "Εντός budget",
      trend: tExp.trend,
      trendLabel: tExp.trendLabel,
      tone: budgetVarianceExpenses > 0 ? "warning" : "neutral",
      managementOnly: true,
    },
    {
      id: "net",
      label: "Καθαρό λειτουργικό",
      value: netReal,
      formatted: formatEuro(netReal),
      helper: `Επί πραγματικών εσόδων · υπολ. ${formatEuro(netCalculated)}`,
      trend: netReal >= 0 ? "up" : "down",
      trendLabel: formatPct((netReal / (netCalculated || 1)) * 100 - 100, true),
      tone: netReal >= 0 ? "positive" : "negative",
      managementOnly: true,
    },
    {
      id: "outstanding",
      label: "Εκκρεμή υπόλοιπα",
      value: outstanding,
      formatted: formatEuro(outstanding),
      helper: `${schedule.parentProfiles.filter((b) => b.outstandingAmount > 0).length} οικογένειες · από πρόγραμμα`,
      trend: outstanding > 1_000 ? "up" : "flat",
      trendLabel: outstanding > 1_000 ? "+8%" : "—",
      tone: outstanding > 2_000 ? "warning" : "neutral",
    },
    {
      id: "budget_actual",
      label: "Budget vs Actual (έξοδα)",
      value: budgetVarianceExpenses,
      formatted: formatEuro(budgetExpenseActual),
      helper: `Budget ${formatEuro(budgetExpenseBudget)} · ${budgetVarianceExpenses > 0 ? "υπέρβαση" : "εντός"}`,
      trend: budgetVarianceExpenses > 0 ? "up" : "down",
      trendLabel: formatPct((budgetVarianceExpenses / budgetExpenseBudget) * 100, true),
      tone: budgetVarianceExpenses > 500 ? "warning" : "positive",
      managementOnly: true,
    },
  ];

  const forecastAdjusted: typeof FINANCE_FORECAST = {
    ...FINANCE_FORECAST,
    projectedRevenue: Math.round(calculatedRevenue * 1.04 + sm.forecastRevenue),
    projectedNet:
      Math.round(calculatedRevenue * 1.04 + sm.forecastRevenue) - FINANCE_FORECAST.projectedExpenses,
    collectionRateForecastPct: Math.min(95, collectionRate + 2),
    riskSummary:
      sm.collectionRiskLevel === "high"
        ? `Υψηλός κίνδυνος είσπραξης (${collectionRate}%) — ${sm.outstandingSessionCount} ανεξόφλητες συνεδρίες.`
        : FINANCE_FORECAST.riskSummary,
    riskLevel: sm.collectionRiskLevel === "high" ? "critical" : FINANCE_FORECAST.riskLevel,
  };

  return {
    monthLabel: schedule.monthLabel,
    monthYmd: schedule.monthYmd,
    scheduleSource: schedule.source,
    scheduleUsedFallback,
    scheduleMetrics: sm,
    sessionCharges: schedule.charges,
    parentProfilesFromSchedule: schedule.parentProfiles,
    kpis,
    cashFlowPct,
    collectionRatePct: collectionRate,
    budgetRevenueTarget,
    budgetRevenueActual,
    budgetExpenseTotal: budgetExpenseBudget,
    budgetExpenseActual,
    revenueByCenter: schedule.aggregates.byCenter,
    revenueBySpecialty: schedule.aggregates.bySpecialty,
    revenueByTherapist: schedule.aggregates.byTherapist,
    revenueByProgramType: schedule.aggregates.byProgramType,
    revenueByGroupPrograms: schedule.aggregates.byGroup,
    revenueByEvaluations: schedule.aggregates.byEvaluations,
    budgetLines: FINANCE_BUDGET_LINES,
    cashFlowMonths: FINANCE_CASH_FLOW,
    currentLiquidity,
    upcomingLiabilities: FINANCE_UPCOMING_LIABILITIES,
    upcomingInflows: FINANCE_UPCOMING_INFLOWS,
    cashFlowForecastNet,
    cashFlowWarning,
    forecast: forecastAdjusted,
    priorMonthComparison: {
      turnoverDeltaPct: 2.4,
      realRevenueDeltaPct: 1.8,
      expensesDeltaPct: 3.1,
    },
  };
}

/** Never throws — uses static fallback schedule data if anything fails. */
export function buildExecutiveFinanceModel(monthYmdInput?: string): ExecutiveFinanceModel {
  try {
    return buildExecutiveFinanceModelImpl(monthYmdInput);
  } catch (error) {
    if (typeof console !== "undefined") {
      console.warn("[finances] executive model fallback:", error);
    }
    return buildExecutiveFinanceModelImpl(monthYmdInput, true);
  }
}

export function buildFinanceDashboardSnapshot(): FinanceDashboardSnapshot {
  const ex = buildExecutiveFinanceModel();
  const byCategory = new Map<string, number>();
  for (const e of FINANCE_EXPENSES) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  return {
    monthLabel: ex.monthLabel,
    monthYmd: ex.monthYmd,
    revenueTotal: ex.scheduleMetrics.calculatedRevenue,
    expensesTotal: FINANCE_DEMO_EXPENSES_TOTAL,
    netOperating: ex.scheduleMetrics.realRevenue - FINANCE_DEMO_EXPENSES_TOTAL,
    outstandingBalances: ex.scheduleMetrics.outstandingBalance,
    dueThisWeek: ex.parentProfilesFromSchedule
      .filter((r) => r.status === "due_soon")
      .reduce((s, r) => s + r.outstandingAmount, 0),
    overduePayments: ex.parentProfilesFromSchedule
      .filter((r) => r.overdueDays > 0)
      .reduce((s, r) => s + r.outstandingAmount, 0),
    revenueByCenter: ex.revenueByCenter.map((r) => ({
      center: (r.id === "evosmos" ? "evosmos" : "nikaia") as "nikaia" | "evosmos",
      label: r.label,
      amount: r.amount,
    })),
    expensesByCategory: [...byCategory.entries()]
      .map(([category, amount]) => ({
        category: category as FinanceDashboardSnapshot["expensesByCategory"][0]["category"],
        label: EXPENSE_CATEGORY_LABELS[category as keyof typeof EXPENSE_CATEGORY_LABELS],
        amount,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}
