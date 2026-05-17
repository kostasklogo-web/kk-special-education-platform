/**
 * Static fallback when schedule-linked finance read model cannot be built.
 * No Supabase — demo constants only.
 */

import type { FinanceScheduleAggregates } from "./finance-schedule-read-model";
import type {
  FinanceScheduleMetrics,
  FinanceScheduleReadModel,
  ParentFinancialProfile,
  SessionBillingCharge,
} from "./types";
import {
  FINANCE_DEMO_CALCULATED_REVENUE,
  FINANCE_DEMO_FORECAST_REVENUE,
  FINANCE_DEMO_REAL_REVENUE,
  FINANCE_DEMO_TURNOVER,
  FINANCE_PARENT_BALANCES,
  FINANCE_REVENUE_BY_EVALUATIONS,
  FINANCE_REVENUE_BY_GROUP,
  FINANCE_REVENUE_BY_PROGRAM,
  FINANCE_REVENUE_BY_SPECIALTY,
  FINANCE_REVENUE_BY_THERAPIST,
  MONTH_LABEL,
  MONTH_YMD,
} from "@/lib/secretary/finances/demo-data";
import type { RevenueSliceRow } from "@/lib/secretary/finances/types";

export const FALLBACK_SCHEDULE_METRICS: FinanceScheduleMetrics = {
  calculatedRevenue: FINANCE_DEMO_CALCULATED_REVENUE,
  realRevenue: FINANCE_DEMO_REAL_REVENUE,
  turnover: FINANCE_DEMO_TURNOVER,
  forecastRevenue: FINANCE_DEMO_FORECAST_REVENUE,
  outstandingBalance: Math.max(0, FINANCE_DEMO_CALCULATED_REVENUE - FINANCE_DEMO_REAL_REVENUE),
  collectionRatePct:
    FINANCE_DEMO_TURNOVER > 0
      ? Math.round((FINANCE_DEMO_REAL_REVENUE / FINANCE_DEMO_TURNOVER) * 1000) / 10
      : 0,
  collectionGap: Math.max(0, FINANCE_DEMO_TURNOVER - FINANCE_DEMO_REAL_REVENUE),
  billableSessionCount: 48,
  paidSessionCount: 32,
  outstandingSessionCount: 16,
  forecastSessionCount: 12,
  collectionRiskLevel: "medium",
};

function withSharePct(rows: { id: string; label: string; amount: number }[]): RevenueSliceRow[] {
  const total = rows.reduce((s, r) => s + r.amount, 0) || 1;
  return rows.map((r) => ({
    ...r,
    sharePct: Math.round((r.amount / total) * 1000) / 10,
  }));
}

export const FALLBACK_SCHEDULE_AGGREGATES: FinanceScheduleAggregates = {
  byCenter: withSharePct([
    { id: "nikaia", label: "Νίκαια", amount: 47_200 },
    { id: "evosmos", label: "Εύοσμος", amount: 11_400 },
  ]),
  bySpecialty: withSharePct(FINANCE_REVENUE_BY_SPECIALTY),
  byTherapist: withSharePct(FINANCE_REVENUE_BY_THERAPIST),
  byProgramType: withSharePct(FINANCE_REVENUE_BY_PROGRAM),
  byGroup: withSharePct(FINANCE_REVENUE_BY_GROUP),
  byEvaluations: withSharePct(FINANCE_REVENUE_BY_EVALUATIONS),
};

function demoChargesFallback(): SessionBillingCharge[] {
  const today = MONTH_YMD.replace(/-01$/, "-15");
  return FINANCE_PARENT_BALANCES.slice(0, 6).map((row, i) => ({
    sessionId: `fallback-${row.id}`,
    sessionGroupId: null,
    childId: `child-${i}`,
    childName: row.childName,
    parentId: row.id,
    parentName: row.parentName,
    therapistId: "fallback-th",
    therapistName: "—",
    specialtyCode: "log",
    specialtyLabel: row.programLabel.split("—")[0]?.trim() ?? "Θεραπεία",
    center: row.center,
    centerLabel: row.center === "evosmos" ? "Εύοσμος" : "Νίκαια",
    roomId: null,
    roomLabel: null,
    dateYmd: today,
    startsAt: `${today}T09:00:00.000Z`,
    endsAt: `${today}T09:45:00.000Z`,
    durationMinutes: 45,
    sessionKind: "individual",
    sessionStatus: "completed",
    billingType: "individual_45",
    billingStatus: "billable",
    expectedCharge: row.monthlyFee,
    invoicedAmount: row.monthlyFee,
    paidAmount: row.amountPaid,
    outstandingAmount: row.outstandingBalance,
    paymentStatus:
      row.outstandingBalance <= 0 ? "paid" : row.amountPaid > 0 ? "partial" : "outstanding",
    isBillable: true,
    isForecast: false,
    scheduleSource: "control_center_demo",
  }));
}

function parentProfilesFallback(): ParentFinancialProfile[] {
  return FINANCE_PARENT_BALANCES.map((row) => ({
    id: row.id,
    parentName: row.parentName,
    children: [row.childName],
    center: row.center,
    monthlyExpectedCharge: row.monthlyFee,
    amountPaid: row.amountPaid,
    outstandingAmount: row.outstandingBalance,
    overdueDays: row.overdueDays,
    paymentConsistencyPct: row.paymentConsistencyPct,
    riskLevel: row.riskLevel,
    linkedChargeIds: [`fallback-${row.id}`],
    status: row.status,
  }));
}

export function buildFallbackFinanceScheduleReadModel(): FinanceScheduleReadModel & {
  aggregates: FinanceScheduleAggregates;
} {
  return {
    monthYmd: MONTH_YMD,
    monthLabel: MONTH_LABEL,
    source: "control_center_demo",
    metrics: FALLBACK_SCHEDULE_METRICS,
    charges: demoChargesFallback(),
    parentProfiles: parentProfilesFallback(),
    aggregates: FALLBACK_SCHEDULE_AGGREGATES,
  };
}
