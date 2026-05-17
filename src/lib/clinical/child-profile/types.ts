import type { ChildListItem, ParentLinkRow, TherapyProgramSummary } from "@/lib/data/children/types";
import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";

/** Clinical profile tab identifiers. */
export type ClinicalProfileTab =
  | "overview"
  | "alerts"
  | "timeline"
  | "goals"
  | "notes"
  | "reports"
  | "evaluations"
  | "interdisciplinary"
  | "supervision";

export type AssignedTherapistSummary = {
  userId: string;
  displayName: string;
  disciplines: string[];
  sessionCount: number;
};

export type AssignedSpecialtySummary = {
  disciplineCode: string;
  disciplineLabel: string;
  therapistNames: string[];
  activeGoalCount: number;
  sessionCount: number;
};

export type TreatmentPlanSummary = {
  id: string;
  title: string;
  status: string | null;
};

export type GoalProgressSummary = {
  goalId: string;
  title: string;
  disciplineCode: string;
  disciplineLabel: string;
  status: TherapyGoalListItem["status"];
  progressPercent: number;
  measurableIndicator: string | null;
  linkedSessionNoteCount: number;
  isInterdisciplinary: boolean;
};

export type EvaluationSummary = {
  lastEvaluationDate: string | null;
  lastEvaluationDiscipline: string | null;
  nextEvaluationDate: string | null;
  totalAssessments: number;
  evaluationReportCount: number;
  clinicalSummary: string | null;
};

export type ClinicalAlertKind =
  | "no_active_goals"
  | "missing_session_notes"
  | "pending_reassessment"
  | "regression_concern"
  | "attendance_impact"
  | "supervision_urgent"
  | "interdisciplinary_review"
  | "stale_goal"
  | "draft_report_overdue";

export type ClinicalAlert = {
  id: string;
  kind: ClinicalAlertKind;
  severity: "info" | "warning" | "urgent";
  title: string;
  detail: string;
  href?: string;
};

export type ClinicalTimelineEventKind =
  | "evaluation"
  | "session"
  | "session_note"
  | "goal"
  | "report"
  | "supervision"
  | "parent_guidance"
  | "school_collaboration"
  | "therapeutic_change"
  | "interdisciplinary";

export type ClinicalTimelineEvent = {
  id: string;
  kind: ClinicalTimelineEventKind;
  occurredAt: string;
  title: string;
  summary: string;
  disciplineLabel?: string | null;
  therapistName?: string | null;
  href?: string;
  meta?: Record<string, string | number | null>;
};

export type InterdisciplinaryObservation = {
  id: string;
  disciplineCode: string;
  disciplineLabel: string;
  therapistName: string | null;
  occurredAt: string;
  excerpt: string;
  sessionId: string;
  noteId: string;
};

export type SupervisionAudience = "therapist" | "supervisor" | "director";

export type SupervisionEntry = {
  id: string;
  occurredAt: string;
  title: string;
  summary: string;
  therapistName: string | null;
  sessionId: string | null;
  audience: SupervisionAudience;
  href?: string;
};

export type ClinicalCollaborationBundle = {
  crossDisciplineObservations: InterdisciplinaryObservation[];
  sharedConcerns: {
    id: string;
    disciplineLabel: string;
    occurredAt: string;
    excerpt: string;
    therapistName: string | null;
  }[];
  clinicalDecisions: {
    id: string;
    disciplineLabel: string;
    occurredAt: string;
    excerpt: string;
    therapistName: string | null;
  }[];
  collaborationNotes: {
    id: string;
    disciplineLabel: string;
    occurredAt: string;
    excerpt: string;
    therapistName: string | null;
  }[];
  schoolCollaborationNotes: {
    id: string;
    occurredAt: string;
    excerpt: string;
    source: "session_note" | "session";
  }[];
};

export type SupervisionBundle = {
  recommendations: SupervisionEntry[];
  actionPlans: SupervisionEntry[];
  directorComments: SupervisionEntry[];
};

export type ClinicalChildProfileBundle = {
  child: ChildListItem;
  parentLinks: ParentLinkRow[];
  programs: TherapyProgramSummary[];
  treatmentPlans: TreatmentPlanSummary[];
  assignedTherapists: AssignedTherapistSummary[];
  assignedSpecialties: AssignedSpecialtySummary[];
  goals: TherapyGoalListItem[];
  goalProgress: GoalProgressSummary[];
  sessions: SessionListItem[];
  sessionNotes: SessionNoteListItem[];
  progressReports: ProgressReportListItem[];
  evaluationSummary: EvaluationSummary;
  collaboration: ClinicalCollaborationBundle;
  supervision: SupervisionBundle;
  timeline: ClinicalTimelineEvent[];
  alerts: ClinicalAlert[];
  /** @deprecated use collaboration.crossDisciplineObservations */
  interdisciplinary: InterdisciplinaryObservation[];
  counts: {
    activeGoals: number;
    completedGoals: number;
    sessions: number;
    sessionNotes: number;
    reports: number;
    evaluations: number;
  };
};
