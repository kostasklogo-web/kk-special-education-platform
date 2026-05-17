/**
 * HR Performance & Incentive read-model types (clinical-safe — not sales KPIs).
 */

export type HrRiskLevel = "low" | "medium" | "high" | "critical";

export type HrTrend = "up" | "down" | "flat";

export type HrSectionId =
  | "overview"
  | "reliability"
  | "clinical"
  | "team"
  | "scoring"
  | "incentives"
  | "management"
  | "supervisor"
  | "therapist_self"
  | "risks";

export type HrKpiStatus = "strong" | "on_track" | "attention" | "critical";

export type HrTherapistKpi = {
  id: string;
  labelEl: string;
  value: number;
  unit: "%" | "count" | "days" | "hours" | "score";
  status: HrKpiStatus;
  trend: HrTrend;
  trendLabel: string;
  helper: string;
};

export type HrTherapistProfile = {
  id: string;
  name: string;
  specialty: string;
  center: "nikaia" | "evosmos";
  supervisorName: string;
  employmentStatus: "active" | "on_leave";
  /** Composite 0–100 — not revenue-based */
  overallScore: number;
  riskLevel: HrRiskLevel;
  kpis: HrTherapistKpi[];
  strengths: string[];
  growthAreas: string[];
  pendingObligations: string[];
  achievements: string[];
  incentiveEligible: boolean;
  incentiveTierLabel: string | null;
};

export type HrScoreDimension = {
  id: string;
  labelEl: string;
  weightPct: number;
  score: number;
  maxScore: number;
  riskLevel: HrRiskLevel;
  helper: string;
};

export type HrIncentivePeriod = "monthly" | "quarterly" | "annual";

export type HrIncentiveProposal = {
  id: string;
  therapistId: string;
  therapistName: string;
  period: HrIncentivePeriod;
  type: "financial" | "recognition" | "non_financial";
  amountEur: number | null;
  labelEl: string;
  status: "proposed" | "approved" | "paid" | "rejected";
  basedOn: string[];
  supervisorRecommendation: boolean;
  managementApproved: boolean;
};

export type HrManagementAdjustment = {
  id: string;
  therapistId: string;
  therapistName: string;
  adjustedBy: string;
  adjustedAt: string;
  previousScore: number;
  newScore: number;
  reason: string;
  approved: boolean;
};

export type HrSupervisorEvaluation = {
  id: string;
  therapistId: string;
  therapistName: string;
  supervisorName: string;
  periodLabel: string;
  qualitativeFeedback: string;
  recommendedActions: string[];
  incentiveRecommendation: "none" | "recognition" | "bonus_review";
  submittedAt: string;
};

export type HrBurnoutRisk = {
  id: string;
  therapistId: string;
  therapistName: string;
  level: HrRiskLevel;
  signals: string[];
  suggestedActions: string[];
  detectedAt: string;
};

export type HrAuditEntry = {
  id: string;
  action: string;
  actor: string;
  occurredAt: string;
  detail: string;
  visibility: "hr" | "management" | "supervisor";
};

export type HrPerformanceModel = {
  periodLabel: string;
  centerLabel: string;
  philosophyNote: string;
  /** Current viewer */
  viewerMode: "management" | "supervisor" | "therapist_self";
  viewerTherapistId: string | null;
  therapists: HrTherapistProfile[];
  scoreDimensions: HrScoreDimension[];
  organizationOverallScore: number;
  incentiveProposals: HrIncentiveProposal[];
  managementAdjustments: HrManagementAdjustment[];
  supervisorEvaluations: HrSupervisorEvaluation[];
  burnoutRisks: HrBurnoutRisk[];
  auditLog: HrAuditEntry[];
  reliabilitySummary: { label: string; count: number; level: HrRiskLevel }[];
  showFinancialAmounts: boolean;
  showAllTherapists: boolean;
};
