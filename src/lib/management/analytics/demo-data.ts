/**
 * Static demo series for management analytics (no Supabase).
 */

import type { CaseFlowSnapshot, FinancialSnapshot, TherapistKpiRow } from "./types";

const MONTHLY_FINANCIAL: FinancialSnapshot[] = [
  { turnover: 58_200, realRevenue: 50_400, calculatedRevenue: 55_800, forecastRevenue: 4_200, cashFlow: 12_100, expenses: 38_200, netResult: 12_200, budgetActual: 38_200, budgetTarget: 37_000, outstanding: 5_400, collectionRatePct: 86.6 },
  { turnover: 59_800, realRevenue: 52_100, calculatedRevenue: 57_200, forecastRevenue: 4_500, cashFlow: 13_400, expenses: 38_900, netResult: 13_200, budgetActual: 38_900, budgetTarget: 37_000, outstanding: 5_100, collectionRatePct: 87.1 },
  { turnover: 61_400, realRevenue: 53_800, calculatedRevenue: 58_600, forecastRevenue: 4_800, cashFlow: 14_200, expenses: 39_400, netResult: 14_400, budgetActual: 39_400, budgetTarget: 37_500, outstanding: 4_900, collectionRatePct: 87.6 },
  { turnover: 60_100, realRevenue: 52_400, calculatedRevenue: 57_800, forecastRevenue: 4_600, cashFlow: 11_800, expenses: 39_800, netResult: 12_600, budgetActual: 39_800, budgetTarget: 37_500, outstanding: 5_600, collectionRatePct: 87.2 },
  { turnover: 62_400, realRevenue: 54_180, calculatedRevenue: 58_600, forecastRevenue: 5_100, cashFlow: 14_800, expenses: 40_100, netResult: 14_080, budgetActual: 40_100, budgetTarget: 38_000, outstanding: 4_420, collectionRatePct: 86.8 },
  { turnover: 63_200, realRevenue: 55_200, calculatedRevenue: 59_400, forecastRevenue: 5_300, cashFlow: 15_200, expenses: 40_400, netResult: 14_800, budgetActual: 40_400, budgetTarget: 38_000, outstanding: 4_200, collectionRatePct: 87.3 },
  { turnover: 62_800, realRevenue: 54_900, calculatedRevenue: 59_100, forecastRevenue: 5_200, cashFlow: 14_600, expenses: 40_600, netResult: 14_300, budgetActual: 40_600, budgetTarget: 38_200, outstanding: 4_350, collectionRatePct: 87.4 },
  { turnover: 64_100, realRevenue: 56_400, calculatedRevenue: 60_200, forecastRevenue: 5_500, cashFlow: 16_100, expenses: 40_800, netResult: 15_600, budgetActual: 40_800, budgetTarget: 38_200, outstanding: 3_980, collectionRatePct: 87.9 },
  { turnover: 63_500, realRevenue: 55_800, calculatedRevenue: 59_800, forecastRevenue: 5_400, cashFlow: 15_400, expenses: 41_000, netResult: 14_800, budgetActual: 41_000, budgetTarget: 38_500, outstanding: 4_100, collectionRatePct: 87.9 },
  { turnover: 65_200, realRevenue: 57_200, calculatedRevenue: 61_400, forecastRevenue: 5_800, cashFlow: 16_800, expenses: 41_200, netResult: 16_000, budgetActual: 41_200, budgetTarget: 38_500, outstanding: 3_850, collectionRatePct: 87.7 },
  { turnover: 64_800, realRevenue: 56_900, calculatedRevenue: 61_100, forecastRevenue: 5_700, cashFlow: 16_200, expenses: 41_400, netResult: 15_500, budgetActual: 41_400, budgetTarget: 39_000, outstanding: 3_920, collectionRatePct: 87.8 },
  { turnover: 66_400, realRevenue: 58_100, calculatedRevenue: 62_200, forecastRevenue: 6_000, cashFlow: 17_400, expenses: 41_600, netResult: 16_500, budgetActual: 41_600, budgetTarget: 39_000, outstanding: 3_700, collectionRatePct: 87.5 },
];

const WEEKLY_FINANCIAL: FinancialSnapshot[] = MONTHLY_FINANCIAL.map((m) => ({
  ...m,
  turnover: Math.round(m.turnover / 4.3),
  realRevenue: Math.round(m.realRevenue / 4.3),
  calculatedRevenue: Math.round(m.calculatedRevenue / 4.3),
  forecastRevenue: Math.round(m.forecastRevenue / 4.3),
  cashFlow: Math.round(m.cashFlow / 4.3),
  expenses: Math.round(m.expenses / 4.3),
  netResult: Math.round(m.netResult / 4.3),
  budgetActual: Math.round(m.budgetActual / 4.3),
  budgetTarget: Math.round(m.budgetTarget / 4.3),
  outstanding: Math.round(m.outstanding / 4.3),
}));

const DAILY_FINANCIAL: FinancialSnapshot[] = WEEKLY_FINANCIAL.map((w) => ({
  ...w,
  turnover: Math.round(w.turnover / 5),
  realRevenue: Math.round(w.realRevenue / 5),
  calculatedRevenue: Math.round(w.calculatedRevenue / 5),
  forecastRevenue: Math.round(w.forecastRevenue / 5),
  cashFlow: Math.round(w.cashFlow / 5),
  expenses: Math.round(w.expenses / 5),
  netResult: Math.round(w.netResult / 5),
  budgetActual: Math.round(w.budgetActual / 5),
  budgetTarget: Math.round(w.budgetTarget / 5),
  outstanding: Math.round(w.outstanding / 5),
}));

const YEARLY_FINANCIAL: FinancialSnapshot[] = [
  { turnover: 680_000, realRevenue: 592_000, calculatedRevenue: 648_000, forecastRevenue: 62_000, cashFlow: 168_000, expenses: 468_000, netResult: 124_000, budgetActual: 468_000, budgetTarget: 450_000, outstanding: 48_000, collectionRatePct: 87.1 },
  { turnover: 720_000, realRevenue: 628_000, calculatedRevenue: 686_000, forecastRevenue: 68_000, cashFlow: 182_000, expenses: 492_000, netResult: 136_000, budgetActual: 492_000, budgetTarget: 470_000, outstanding: 42_000, collectionRatePct: 87.2 },
  { turnover: 756_000, realRevenue: 662_000, calculatedRevenue: 722_000, forecastRevenue: 72_000, cashFlow: 194_000, expenses: 512_000, netResult: 150_000, budgetActual: 512_000, budgetTarget: 490_000, outstanding: 38_000, collectionRatePct: 87.6 },
];

export const ANALYTICS_FINANCIAL_SERIES = {
  day: DAILY_FINANCIAL,
  week: WEEKLY_FINANCIAL,
  month: MONTHLY_FINANCIAL,
  year: YEARLY_FINANCIAL,
  custom: MONTHLY_FINANCIAL,
};

const BASE_CASE_FLOW: CaseFlowSnapshot = {
  newCases: 8,
  activeChildren: 142,
  pausedCases: 6,
  completedPrograms: 3,
  waitingList: 18,
  evaluationsCompleted: 5,
  evaluationsPending: 7,
  evalToProgramConversions: 4,
  exits: 2,
  reactivations: 1,
};

export const ANALYTICS_CASE_FLOW_SERIES: CaseFlowSnapshot[] = MONTHLY_FINANCIAL.map((_, i) => ({
  newCases: BASE_CASE_FLOW.newCases + (i % 3),
  activeChildren: BASE_CASE_FLOW.activeChildren + i,
  pausedCases: BASE_CASE_FLOW.pausedCases + (i % 2),
  completedPrograms: BASE_CASE_FLOW.completedPrograms + (i > 6 ? 1 : 0),
  waitingList: BASE_CASE_FLOW.waitingList - Math.floor(i / 4),
  evaluationsCompleted: BASE_CASE_FLOW.evaluationsCompleted + (i % 2),
  evaluationsPending: BASE_CASE_FLOW.evaluationsPending - (i % 2),
  evalToProgramConversions: BASE_CASE_FLOW.evalToProgramConversions,
  exits: BASE_CASE_FLOW.exits,
  reactivations: BASE_CASE_FLOW.reactivations + (i % 4 === 0 ? 1 : 0),
}));

const THERAPIST_BASE: Omit<TherapistKpiRow, "id">[] = [
  { name: "Βασιλείου Ν.", specialty: "Λογοθεραπεία", center: "nikaia", scheduledHours: 32, completedSessions: 28, cancellations: 2, absences: 1, utilizationPct: 88, noteCompletionPct: 96, reportCompletionPct: 92, supervisionSessions: 2, avgCaseload: 14, groupSessions: 4 },
  { name: "Γεωργίου Ε.", specialty: "Ψυχολογία", center: "nikaia", scheduledHours: 28, completedSessions: 24, cancellations: 1, absences: 2, utilizationPct: 82, noteCompletionPct: 94, reportCompletionPct: 88, supervisionSessions: 3, avgCaseload: 12, groupSessions: 2 },
  { name: "Κωνσταντίνου Μ.", specialty: "Εργοθεραπεία", center: "evosmos", scheduledHours: 30, completedSessions: 26, cancellations: 3, absences: 1, utilizationPct: 85, noteCompletionPct: 98, reportCompletionPct: 90, supervisionSessions: 2, avgCaseload: 13, groupSessions: 3 },
  { name: "Δρ. Ανδρέου Π.", specialty: "Κλινική Διεύθυνση", center: "nikaia", scheduledHours: 20, completedSessions: 18, cancellations: 0, absences: 0, utilizationPct: 90, noteCompletionPct: 100, reportCompletionPct: 95, supervisionSessions: 8, avgCaseload: 6, groupSessions: 0 },
  { name: "Παπαδοπούλου Σ.", specialty: "Ειδική Εκπαίδευση", center: "evosmos", scheduledHours: 26, completedSessions: 22, cancellations: 2, absences: 2, utilizationPct: 79, noteCompletionPct: 91, reportCompletionPct: 85, supervisionSessions: 2, avgCaseload: 11, groupSessions: 5 },
  { name: "Νικολάου Κ.", specialty: "Φυσικοθεραπεία", center: "nikaia", scheduledHours: 24, completedSessions: 21, cancellations: 1, absences: 1, utilizationPct: 84, noteCompletionPct: 93, reportCompletionPct: 87, supervisionSessions: 1, avgCaseload: 10, groupSessions: 1 },
];

export function therapistRowsForPeriod(periodIndex: number): TherapistKpiRow[] {
  const factor = 0.92 + (periodIndex % 5) * 0.02;
  return THERAPIST_BASE.map((t, i) => ({
    ...t,
    id: `th-${i}`,
    scheduledHours: Math.round(t.scheduledHours * factor),
    completedSessions: Math.round(t.completedSessions * factor),
    utilizationPct: Math.min(98, Math.round(t.utilizationPct * factor)),
    noteCompletionPct: Math.min(100, t.noteCompletionPct),
    reportCompletionPct: Math.min(100, t.reportCompletionPct - (periodIndex % 3)),
  }));
}

export const MONTH_LABELS_EL = [
  "Ιανουάριος",
  "Φεβρουάριος",
  "Μάρτιος",
  "Απρίλιος",
  "Μάιος",
  "Ιούνιος",
  "Ιούλιος",
  "Αύγουστος",
  "Σεπτέμβριος",
  "Οκτώβριος",
  "Νοέμβριος",
  "Δεκέμβριος",
];
