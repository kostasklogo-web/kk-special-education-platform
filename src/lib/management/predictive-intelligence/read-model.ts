/**
 * Predictive Intelligence read model — assembles demo predictions & scoring.
 */

import {
  DEMO_CAPACITY,
  DEMO_CHILD_CONTINUITY,
  DEMO_CLINICAL_WORKFLOW,
  DEMO_FINANCIAL_FORECASTS,
  DEMO_FORECAST_SERIES,
  DEMO_HEATMAP,
  DEMO_THERAPIST_BURNOUT,
  DEMO_WAITING_LIST,
} from "./demo-data";
import { combineRisk, riskFromScore } from "./predict-rules";
import type { PredictiveIntelligenceModel, PredictiveRiskItem } from "./types";

function sortByRisk(items: PredictiveRiskItem[]): PredictiveRiskItem[] {
  const order = { critical: 4, high: 3, medium: 2, low: 1 };
  return [...items].sort((a, b) => order[b.riskLevel] - order[a.riskLevel] || b.score - a.score);
}

export function buildPredictiveIntelligenceModel(): PredictiveIntelligenceModel {
  const childContinuityRisks = sortByRisk(DEMO_CHILD_CONTINUITY);
  const therapistBurnoutRisks = sortByRisk(DEMO_THERAPIST_BURNOUT);
  const clinicalWorkflowRisks = sortByRisk(DEMO_CLINICAL_WORKFLOW);

  const allRisks = [...childContinuityRisks, ...therapistBurnoutRisks, ...clinicalWorkflowRisks];
  const avgScore =
    allRisks.length > 0 ? Math.round(allRisks.reduce((s, r) => s + r.score, 0) / allRisks.length) : 0;
  const overallRiskLevel = combineRisk(
    riskFromScore(avgScore),
    ...allRisks.filter((r) => r.riskLevel === "critical").map((r) => "critical" as const)
  );

  const distribution: PredictiveIntelligenceModel["riskDistribution"] = [
    { level: "critical", count: allRisks.filter((r) => r.riskLevel === "critical").length },
    { level: "high", count: allRisks.filter((r) => r.riskLevel === "high").length },
    { level: "medium", count: allRisks.filter((r) => r.riskLevel === "medium").length },
    { level: "low", count: allRisks.filter((r) => r.riskLevel === "low").length },
  ];

  return {
    generatedAt: new Date().toISOString(),
    centerLabel: "Νίκαια & Εύοσμος",
    overallRiskLevel,
    overallPredictiveScore: avgScore,
    childContinuityRisks,
    therapistBurnoutRisks,
    capacityForecasts: DEMO_CAPACITY,
    financialForecasts: DEMO_FINANCIAL_FORECASTS,
    clinicalWorkflowRisks,
    waitingListForecasts: DEMO_WAITING_LIST,
    forecastDashboard: DEMO_FORECAST_SERIES,
    riskDistribution: distribution,
    topInterventions: sortByRisk(allRisks).slice(0, 6),
    heatmapRows: DEMO_HEATMAP,
  };
}
