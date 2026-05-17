/**
 * Operational Intelligence read-model types (rule-based workflow analytics — not AI).
 */

export type OpsRiskLevel = "low" | "medium" | "high" | "critical";

export type OpsTrend = "up" | "down" | "flat";

export type OpsSectionId =
  | "health"
  | "scheduling"
  | "therapists"
  | "cases"
  | "financial"
  | "secretary"
  | "supervision"
  | "trends"
  | "alerts";

export type OpsHealthScore = {
  id: string;
  label: string;
  score: number;
  maxScore: number;
  riskLevel: OpsRiskLevel;
  trend: OpsTrend;
  trendLabel: string;
  helper: string;
};

export type OpsAlert = {
  id: string;
  kind: OpsAlertKind;
  level: OpsRiskLevel;
  title: string;
  detail: string;
  center?: "nikaia" | "evosmos" | "omilos";
  urgencyRank: number;
  detectedAt: string;
  suggestedAction: string;
};

export type OpsAlertKind =
  | "low_attendance"
  | "therapist_overload"
  | "revenue_decline"
  | "report_delay"
  | "room_capacity"
  | "parent_followup"
  | "waiting_list"
  | "clinical_coordination";

export type SchedulingInsight = {
  id: string;
  category:
    | "therapist_overload"
    | "therapist_underuse"
    | "room_overload"
    | "room_underuse"
    | "empty_slot"
    | "bottleneck"
    | "inefficient_gap"
    | "late_overload"
    | "cancellation_spike";
  label: string;
  subject: string;
  center: "nikaia" | "evosmos";
  metricValue: number;
  threshold: number;
  riskLevel: OpsRiskLevel;
  detail: string;
};

export type TherapistOpsRow = {
  id: string;
  name: string;
  specialty: string;
  center: "nikaia" | "evosmos";
  caseloadPressure: OpsRiskLevel;
  completionConsistencyPct: number;
  overdueNotes: number;
  overdueReports: number;
  supervisionDaysAgo: number;
  attendanceStabilityPct: number;
  cancellationRatePct: number;
  workloadTrend: OpsTrend;
  workloadHours: number;
};

export type ChildOpsRow = {
  id: string;
  childName: string;
  center: "nikaia" | "evosmos";
  regressionRisk: OpsRiskLevel;
  attendanceDeterioration: OpsRiskLevel;
  cancellationPattern: OpsRiskLevel;
  reassessmentOverdue: boolean;
  reportsOverdue: number;
  coordinationIssue: boolean;
  scheduleFragmentation: OpsRiskLevel;
  parentCommsFrequency: "normal" | "elevated" | "high";
  financialContinuityRisk: OpsRiskLevel;
};

export type FinancialOpsInsight = {
  id: string;
  label: string;
  riskLevel: OpsRiskLevel;
  currentValue: string;
  detail: string;
};

export type SecretaryOpsSnapshot = {
  overdueReminders: number;
  unresolvedTasks: number;
  overloadedDays: number;
  communicationBacklog: number;
  pendingReportCoordination: number;
  unresolvedMeetingFollowups: number;
};

export type SupervisionOpsRow = {
  id: string;
  therapistName: string;
  daysSinceSupervision: number;
  missingNotes: boolean;
  unresolvedActions: number;
  riskLevel: OpsRiskLevel;
};

export type InterdisciplinaryGap = {
  childName: string;
  daysSinceReview: number;
  specialtiesInvolved: string[];
  riskLevel: OpsRiskLevel;
};

export type TrendSeriesPoint = {
  label: string;
  value: number;
};

export type TrendComparisonRow = {
  id: string;
  label: string;
  weekly: number;
  monthly: number;
  yearly: number;
  trend: OpsTrend;
};

export type HeatmapCell = {
  day: string;
  hour: string;
  intensity: number;
  label: string;
};

export type OperationsIntelligenceModel = {
  generatedAt: string;
  centerLabel: string;
  healthScores: OpsHealthScore[];
  overallOperationalScore: number;
  overallRiskLevel: OpsRiskLevel;
  schedulingInsights: SchedulingInsight[];
  therapistRows: TherapistOpsRow[];
  childRows: ChildOpsRow[];
  financialInsights: FinancialOpsInsight[];
  secretaryOps: SecretaryOpsSnapshot;
  supervisionRows: SupervisionOpsRow[];
  interdisciplinaryGaps: InterdisciplinaryGap[];
  weeklyTrends: TrendSeriesPoint[];
  monthlyTrends: TrendSeriesPoint[];
  yearlyTrends: TrendSeriesPoint[];
  centerComparison: TrendComparisonRow[];
  specialtyComparison: TrendComparisonRow[];
  therapistComparison: TrendComparisonRow[];
  alerts: OpsAlert[];
  occupancyHeatmap: HeatmapCell[];
};
