/**
 * Operational Intelligence read model — rule-based detection on demo data.
 */

import {
  OPS_CENTER_COMPARISON,
  OPS_DEMO_CHILDREN,
  OPS_DEMO_THERAPISTS,
  OPS_FINANCIAL_INSIGHTS,
  OPS_INTERDISCIPLINARY,
  OPS_MONTHLY_TRENDS,
  OPS_SCHEDULING_INSIGHTS,
  OPS_SECRETARY,
  OPS_SPECIALTY_COMPARISON,
  OPS_SUPERVISION,
  OPS_THERAPIST_COMPARISON,
  OPS_WEEKLY_TRENDS,
  OPS_YEARLY_TRENDS,
  buildDemoAlerts,
  buildOccupancyHeatmap,
} from "./demo-data";
import { combineRisk, scoreToRisk, trendFromDelta, urgencyRank } from "./risk-rules";
import type { OpsHealthScore, OperationsIntelligenceModel, OpsRiskLevel } from "./types";

function buildHealthScores(): OpsHealthScore[] {
  const scores = [
    { id: "center", label: "Λειτουργική βαθμολογία κέντρου", score: 82, maxScore: 100, trendPct: 2.1, helper: "Σύνθετο σκορ Νίκαια + Εύοσμος" },
    { id: "occupancy", label: "Πληρότητα / κατάληψη", score: 88, maxScore: 100, trendPct: 1.4, helper: "Μέση πληρότητα αιθουσών 84%" },
    { id: "workload", label: "Φόρτος θεραπευτών", score: 71, maxScore: 100, trendPct: -3.2, helper: "1 κρίσιμη υπερφόρτωση · 1 υποαξιοποίηση" },
    { id: "reports", label: "Ολοκλήρωση αναφορών", score: 86, maxScore: 100, trendPct: -1.8, helper: "5 καθυστερημένες αναφορές" },
    { id: "attendance", label: "Σταθερότητα προσέλευσης", score: 91, maxScore: 100, trendPct: -2.4, helper: "2 παιδιά με πτώση >10%" },
    { id: "collection", label: "Είσπραξη / οικονομική συνέχεια", score: 78, maxScore: 100, trendPct: -1.1, helper: "86.8% είσπραξη · 4 οφειλές" },
    { id: "supervision", label: "Ολοκλήρωση εποπτείας", score: 74, maxScore: 100, trendPct: -4.5, helper: "2 θεραπευτές >21 ημέρες χωρίς εποπτεία" },
  ];
  return scores.map((s) => ({
    id: s.id,
    label: s.label,
    score: s.score,
    maxScore: s.maxScore,
    riskLevel: scoreToRisk(s.score, s.maxScore),
    trend: trendFromDelta(s.trendPct),
    trendLabel: `${s.trendPct > 0 ? "+" : ""}${s.trendPct.toFixed(1)}%`,
    helper: s.helper,
  }));
}

function overallFromHealth(scores: OpsHealthScore[]): { score: number; risk: OpsRiskLevel } {
  const avg = scores.reduce((s, x) => s + x.score, 0) / (scores.length || 1);
  return { score: Math.round(avg), risk: scoreToRisk(avg) };
}

export function buildOperationsIntelligenceModel(
  fullAccess: boolean
): OperationsIntelligenceModel {
  const healthScores = buildHealthScores();
  const overall = overallFromHealth(healthScores);
  const alerts = buildDemoAlerts().sort((a, b) => b.urgencyRank - a.urgencyRank);

  const schedulingInsights = OPS_SCHEDULING_INSIGHTS;
  const therapistRows = OPS_DEMO_THERAPISTS;
  const childRows = OPS_DEMO_CHILDREN;

  const financialInsights = fullAccess
    ? OPS_FINANCIAL_INSIGHTS
    : OPS_FINANCIAL_INSIGHTS.filter((f) => f.riskLevel !== "critical").slice(0, 2);

  const supervisionRows = OPS_SUPERVISION;
  const interdisciplinaryGaps = OPS_INTERDISCIPLINARY;

  const hasCriticalScheduling = schedulingInsights.some((i) => i.riskLevel === "critical");
  const overallRiskLevel = hasCriticalScheduling
    ? combineRisk(overall.risk, "critical")
    : overall.risk;

  return {
    generatedAt: new Date().toISOString(),
    centerLabel: "Νίκαια & Εύοσμος",
    healthScores,
    overallOperationalScore: overall.score,
    overallRiskLevel,
    schedulingInsights,
    therapistRows,
    childRows,
    financialInsights,
    secretaryOps: OPS_SECRETARY,
    supervisionRows,
    interdisciplinaryGaps,
    weeklyTrends: OPS_WEEKLY_TRENDS,
    monthlyTrends: OPS_MONTHLY_TRENDS,
    yearlyTrends: OPS_YEARLY_TRENDS,
    centerComparison: OPS_CENTER_COMPARISON,
    specialtyComparison: OPS_SPECIALTY_COMPARISON,
    therapistComparison: OPS_THERAPIST_COMPARISON,
    alerts,
    occupancyHeatmap: buildOccupancyHeatmap(),
  };
}

export { urgencyRank };
