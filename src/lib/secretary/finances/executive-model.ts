/**
 * Builds management intelligence view from static demo data.
 */

import {
  FINANCE_ALERTS,
  FINANCE_BUDGET_LINES,
  FINANCE_CASH_FLOW,
  FINANCE_DEMO_CALCULATED_REVENUE,
  FINANCE_DEMO_EVOMOS_REVENUE,
  FINANCE_DEMO_EXPENSES_TOTAL,
  FINANCE_DEMO_FORECAST_REVENUE,
  FINANCE_DEMO_NIKAIA_REVENUE,
  FINANCE_DEMO_REAL_REVENUE,
  FINANCE_DEMO_TURNOVER,
  FINANCE_EXPENSES,
  FINANCE_FORECAST,
  FINANCE_PARENT_BALANCES,
  FINANCE_REVENUE_BY_EVALUATIONS,
  FINANCE_REVENUE_BY_GROUP,
  FINANCE_REVENUE_BY_PROGRAM,
  FINANCE_REVENUE_BY_SPECIALTY,
  FINANCE_REVENUE_BY_THERAPIST,
  FINANCE_UPCOMING_INFLOWS,
  FINANCE_UPCOMING_LIABILITIES,
  MONTH_LABEL,
  MONTH_YMD,
} from "./demo-data";
import {
  EXPENSE_CATEGORY_LABELS,
  formatEuro,
  formatPct,
} from "./labels";
import type {
  ExecutiveFinanceModel,
  ExecutiveKpi,
  FinanceDashboardSnapshot,
  RevenueSliceRow,
  TrendDirection,
} from "./types";

function trendFromDelta(deltaPct: number): { trend: TrendDirection; trendLabel: string } {
  if (deltaPct > 0.5) return { trend: "up", trendLabel: formatPct(deltaPct, true) };
  if (deltaPct < -0.5) return { trend: "down", trendLabel: formatPct(deltaPct, true) };
  return { trend: "flat", trendLabel: "±0%" };
}

function withShare(rows: Omit<RevenueSliceRow, "sharePct">[]): RevenueSliceRow[] {
  const total = rows.reduce((s, r) => s + r.amount, 0) || 1;
  return rows.map((r) => ({ ...r, sharePct: Math.round((r.amount / total) * 1000) / 10 }));
}

export function buildExecutiveFinanceModel(): ExecutiveFinanceModel {
  const expensesTotal = FINANCE_DEMO_EXPENSES_TOTAL;
  const netReal = FINANCE_DEMO_REAL_REVENUE - expensesTotal;
  const netCalculated = FINANCE_DEMO_CALCULATED_REVENUE - expensesTotal;
  const outstanding = FINANCE_PARENT_BALANCES.reduce((s, r) => s + r.outstandingBalance, 0);
  const overdue = FINANCE_PARENT_BALANCES.filter((r) => r.overdueDays > 0).reduce(
    (s, r) => s + r.outstandingBalance,
    0
  );
  const dueWeek = FINANCE_PARENT_BALANCES.filter(
    (r) => r.status === "due_soon" || (r.outstandingBalance > 0 && r.overdueDays === 0)
  ).reduce((s, r) => s + r.outstandingBalance, 0);
  const collectionRate = Math.round((FINANCE_DEMO_REAL_REVENUE / FINANCE_DEMO_TURNOVER) * 1000) / 10;
  const cashFlowPct = Math.round((FINANCE_DEMO_REAL_REVENUE / FINANCE_DEMO_CALCULATED_REVENUE) * 1000) / 10;
  const budgetExpenseActual = expensesTotal;
  const budgetExpenseBudget = FINANCE_BUDGET_LINES.reduce((s, l) => s + l.budgetAmount, 0);
  const budgetRevenueTarget = 60_000;
  const budgetRevenueActual = FINANCE_DEMO_REAL_REVENUE;
  const budgetVarianceExpenses = budgetExpenseActual - budgetExpenseBudget;
  const currentLiquidity = 18_500;
  const upcomingOut = FINANCE_UPCOMING_LIABILITIES.reduce((s, e) => s + e.amount, 0);
  const upcomingIn = FINANCE_UPCOMING_INFLOWS.reduce((s, e) => s + e.amount, 0);
  const cashFlowForecastNet = upcomingIn - upcomingOut + netReal * 0.15;
  const cashFlowWarning = cashFlowForecastNet < 5_000 || upcomingOut > currentLiquidity + upcomingIn;

  const tTurnover = trendFromDelta(2.4);
  const tReal = trendFromDelta(1.8);
  const tExp = trendFromDelta(3.1);

  const kpis: ExecutiveKpi[] = [
    {
      id: "cashflow",
      label: "Ταμειακή ροή (μήνας)",
      value: netReal,
      formatted: formatEuro(netReal),
      helper: `${cashFlowPct}% είσπραξη vs υπολογιζόμενα`,
      trend: netReal >= 0 ? "up" : "down",
      trendLabel: tReal.trendLabel,
      tone: netReal >= 0 ? "positive" : "negative",
    },
    {
      id: "turnover",
      label: "Τζίρος (Turnover)",
      value: FINANCE_DEMO_TURNOVER,
      formatted: formatEuro(FINANCE_DEMO_TURNOVER),
      helper: "Συνολικές χρεώσεις μήνα",
      trend: tTurnover.trend,
      trendLabel: tTurnover.trendLabel,
      tone: "neutral",
    },
    {
      id: "real_revenue",
      label: "Πραγματικά έσοδα",
      value: FINANCE_DEMO_REAL_REVENUE,
      formatted: formatEuro(FINANCE_DEMO_REAL_REVENUE),
      helper: `Είσπραξη ${collectionRate}% του τζίρου`,
      trend: tReal.trend,
      trendLabel: tReal.trendLabel,
      tone: "positive",
    },
    {
      id: "calculated_revenue",
      label: "Υπολογιζόμενα έσοδα",
      value: FINANCE_DEMO_CALCULATED_REVENUE,
      formatted: formatEuro(FINANCE_DEMO_CALCULATED_REVENUE),
      helper: "Από προγράμματα & ραντεβού",
      trend: "up",
      trendLabel: "+1.2%",
      tone: "neutral",
    },
    {
      id: "forecast_revenue",
      label: "Πρόβλεψη εσόδων (επόμενος)",
      value: FINANCE_DEMO_FORECAST_REVENUE,
      formatted: formatEuro(FINANCE_DEMO_FORECAST_REVENUE),
      helper: FINANCE_FORECAST.nextMonthLabel,
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
      helper: `${FINANCE_PARENT_BALANCES.filter((b) => b.outstandingBalance > 0).length} οικογένειες`,
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

  return {
    monthLabel: MONTH_LABEL,
    monthYmd: MONTH_YMD,
    kpis,
    cashFlowPct,
    collectionRatePct: collectionRate,
    budgetRevenueTarget,
    budgetRevenueActual,
    budgetExpenseTotal: budgetExpenseBudget,
    budgetExpenseActual,
    revenueByCenter: withShare([
      { id: "c-n", label: "Νίκαια", amount: FINANCE_DEMO_NIKAIA_REVENUE },
      { id: "c-e", label: "Εύοσμος", amount: FINANCE_DEMO_EVOMOS_REVENUE },
    ]),
    revenueBySpecialty: withShare(FINANCE_REVENUE_BY_SPECIALTY),
    revenueByTherapist: withShare(FINANCE_REVENUE_BY_THERAPIST),
    revenueByProgramType: withShare(FINANCE_REVENUE_BY_PROGRAM),
    revenueByGroupPrograms: withShare(FINANCE_REVENUE_BY_GROUP),
    revenueByEvaluations: withShare(FINANCE_REVENUE_BY_EVALUATIONS),
    budgetLines: FINANCE_BUDGET_LINES,
    cashFlowMonths: FINANCE_CASH_FLOW,
    currentLiquidity,
    upcomingLiabilities: FINANCE_UPCOMING_LIABILITIES,
    upcomingInflows: FINANCE_UPCOMING_INFLOWS,
    cashFlowForecastNet,
    cashFlowWarning,
    forecast: FINANCE_FORECAST,
    priorMonthComparison: {
      turnoverDeltaPct: 2.4,
      realRevenueDeltaPct: 1.8,
      expensesDeltaPct: 3.1,
    },
  };
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
    revenueTotal: FINANCE_DEMO_CALCULATED_REVENUE,
    expensesTotal: FINANCE_DEMO_EXPENSES_TOTAL,
    netOperating: FINANCE_DEMO_REAL_REVENUE - FINANCE_DEMO_EXPENSES_TOTAL,
    outstandingBalances: FINANCE_PARENT_BALANCES.reduce((s, r) => s + r.outstandingBalance, 0),
    dueThisWeek: FINANCE_PARENT_BALANCES.filter((r) => r.status === "due_soon").reduce(
      (s, r) => s + r.outstandingBalance,
      0
    ) + 145,
    overduePayments: FINANCE_PARENT_BALANCES.filter((r) => r.overdueDays > 0).reduce(
      (s, r) => s + r.outstandingBalance,
      0
    ),
    revenueByCenter: [
      { center: "nikaia" as const, label: "Νίκαια", amount: FINANCE_DEMO_NIKAIA_REVENUE },
      { center: "evosmos" as const, label: "Εύοσμος", amount: FINANCE_DEMO_EVOMOS_REVENUE },
    ],
    expensesByCategory: [...byCategory.entries()]
      .map(([category, amount]) => ({
        category: category as FinanceDashboardSnapshot["expensesByCategory"][0]["category"],
        label: EXPENSE_CATEGORY_LABELS[category as keyof typeof EXPENSE_CATEGORY_LABELS],
        amount,
      }))
      .sort((a, b) => b.amount - a.amount),
  };
}
