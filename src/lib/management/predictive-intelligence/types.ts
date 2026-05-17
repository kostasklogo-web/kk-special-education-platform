/**
 * Predictive Intelligence types — rule-based forecasts (prototype, not ML).
 */

export type PredictiveRiskLevel = "low" | "medium" | "high" | "critical";

export type PredictiveHorizon = "7d" | "30d" | "quarter" | "year";

export type PredictiveSectionId =
  | "dashboard"
  | "child"
  | "burnout"
  | "capacity"
  | "financial"
  | "clinical"
  | "waiting"
  | "scoring";

export type PredictedRiskFactor = {
  code: string;
  label: string;
  weight: number;
  present: boolean;
};

export type SuggestedActions = {
  management: string;
  scheduling: string;
  supervision: string;
  parentFollowUp: string;
};

export type PredictiveRiskItem = {
  id: string;
  subjectLabel: string;
  subjectType: "child" | "therapist" | "center" | "program" | "workflow";
  center?: "nikaia" | "evosmos";
  riskLevel: PredictiveRiskLevel;
  score: number;
  maxScore: number;
  confidencePct: number;
  horizon: PredictiveHorizon;
  predictionLabel: string;
  factors: PredictedRiskFactor[];
  trendDirection: "worsening" | "stable" | "improving";
  actions: SuggestedActions;
};

export type ForecastPoint = {
  label: string;
  predicted: number;
  baseline: number;
  unit: "score" | "pct" | "euro" | "count";
};

export type ForecastCard = {
  id: string;
  title: string;
  horizon: PredictiveHorizon;
  currentValue: string;
  predictedValue: string;
  changeLabel: string;
  riskLevel: PredictiveRiskLevel;
  warning?: string;
};

export type CapacityForecast = {
  id: string;
  label: string;
  dayOrPeriod: string;
  predictedLoadPct: number;
  riskLevel: PredictiveRiskLevel;
  detail: string;
};

export type WaitingListForecast = {
  specialty: string;
  currentWait: number;
  predicted30d: number;
  saturationRisk: PredictiveRiskLevel;
  weeksToSlot: number;
};

export type PredictiveIntelligenceModel = {
  generatedAt: string;
  centerLabel: string;
  overallRiskLevel: PredictiveRiskLevel;
  overallPredictiveScore: number;
  childContinuityRisks: PredictiveRiskItem[];
  therapistBurnoutRisks: PredictiveRiskItem[];
  capacityForecasts: CapacityForecast[];
  financialForecasts: ForecastCard[];
  clinicalWorkflowRisks: PredictiveRiskItem[];
  waitingListForecasts: WaitingListForecast[];
  forecastDashboard: {
    sevenDay: ForecastPoint[];
    thirtyDay: ForecastPoint[];
    quarter: ForecastPoint[];
    year: ForecastPoint[];
  };
  riskDistribution: { level: PredictiveRiskLevel; count: number }[];
  topInterventions: PredictiveRiskItem[];
  heatmapRows: { label: string; cells: { period: string; score: number }[] }[];
};
