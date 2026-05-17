/**
 * Static demo data for HR Performance & Incentives (no Supabase / payroll).
 */

import { kpiStatusFromPct } from "./scoring";
import { scoreToRisk } from "./risk-rules";
import type {
  HrAuditEntry,
  HrIncentiveProposal,
  HrManagementAdjustment,
  HrSupervisorEvaluation,
  HrTherapistKpi,
  HrTherapistProfile,
} from "./types";

/** Dev user → demo therapist row (therapist self-view) */
export const HR_DEMO_USER_THERAPIST_MAP: Record<string, string> = {
  "00000000-0000-0000-0000-000000000000": "t1",
};

type RawTherapist = {
  id: string;
  name: string;
  specialty: string;
  center: "nikaia" | "evosmos";
  supervisorName: string;
  sessionConsistencyPct: number;
  noteCompletionPct: number;
  reportCompletionPct: number;
  supervisionParticipationPct: number;
  punctualityPct: number;
  cancellationRatePct: number;
  interdisciplinaryPct: number;
  parentResponseHours: number;
  actionPlanCompletionPct: number;
  adminCompliancePct: number;
  latenessCount: number;
  missingNotes: number;
  overdueReports: number;
  missedSupervision: number;
  unresolvedActionPlans: number;
  schedulingReliabilityPct: number;
  goalTrackingPct: number;
  protocolAdherencePct: number;
  caseContinuityPct: number;
  meetingParticipationPct: number;
  trainingParticipationPct: number;
  colleagueSupportScore: number;
  initiativeScore: number;
  workloadHours: number;
  supervisionDaysAgo: number;
  strengths: string[];
  growthAreas: string[];
  pendingObligations: string[];
  achievements: string[];
  incentiveEligible: boolean;
  incentiveTierLabel: string | null;
};

const RAW: RawTherapist[] = [
  {
    id: "t1",
    name: "Βασιλείου Ν.",
    specialty: "Λογοθεραπεία",
    center: "nikaia",
    supervisorName: "Δρ. Αλεξίου",
    sessionConsistencyPct: 92,
    noteCompletionPct: 94,
    reportCompletionPct: 96,
    supervisionParticipationPct: 88,
    punctualityPct: 97,
    cancellationRatePct: 4,
    interdisciplinaryPct: 85,
    parentResponseHours: 18,
    actionPlanCompletionPct: 90,
    adminCompliancePct: 95,
    latenessCount: 1,
    missingNotes: 1,
    overdueReports: 0,
    missedSupervision: 0,
    unresolvedActionPlans: 0,
    schedulingReliabilityPct: 93,
    goalTrackingPct: 91,
    protocolAdherencePct: 94,
    caseContinuityPct: 92,
    meetingParticipationPct: 90,
    trainingParticipationPct: 88,
    colleagueSupportScore: 4.2,
    initiativeScore: 4.0,
    workloadHours: 34,
    supervisionDaysAgo: 12,
    strengths: ["Σταθερή τεκμηρίωση", "Άμεση επικοινωνία γονέων", "Διεπιστημονική συνεργασία"],
    growthAreas: ["Μείωση 1 εκκρεμούς σημείωσης"],
    pendingObligations: ["1 σημείωση εντός 48ω"],
    achievements: ["100% αναφορές Q1", "Μέντορας νέου θεραπευτή"],
    incentiveEligible: true,
    incentiveTierLabel: "Αναγνώριση Q2",
  },
  {
    id: "t2",
    name: "Γεωργίου Ε.",
    specialty: "Ψυχολογία",
    center: "nikaia",
    supervisorName: "Δρ. Αλεξίου",
    sessionConsistencyPct: 88,
    noteCompletionPct: 82,
    reportCompletionPct: 85,
    supervisionParticipationPct: 72,
    punctualityPct: 91,
    cancellationRatePct: 6,
    interdisciplinaryPct: 78,
    parentResponseHours: 28,
    actionPlanCompletionPct: 76,
    adminCompliancePct: 88,
    latenessCount: 2,
    missingNotes: 2,
    overdueReports: 1,
    missedSupervision: 1,
    unresolvedActionPlans: 1,
    schedulingReliabilityPct: 86,
    goalTrackingPct: 84,
    protocolAdherencePct: 86,
    caseContinuityPct: 88,
    meetingParticipationPct: 82,
    trainingParticipationPct: 75,
    colleagueSupportScore: 3.8,
    initiativeScore: 3.5,
    workloadHours: 28,
    supervisionDaysAgo: 21,
    strengths: ["Συνέπεια συνεδριών", "Καλή συνέχεια περιστατικών"],
    growthAreas: ["Εποπτεία — τακτικότητα", "Ταχύτερη απάντηση γονέων"],
    pendingObligations: ["2 σημειώσεις", "1 αναφορά", "Σχέδιο δράσης #12"],
    achievements: ["Ολοκλήρωση εκπαίδευσης GDPR"],
    incentiveEligible: false,
    incentiveTierLabel: null,
  },
  {
    id: "t3",
    name: "Κωνσταντίνου Μ.",
    specialty: "Εργοθεραπεία",
    center: "evosmos",
    supervisorName: "Καπ. Παπαδάκη",
    sessionConsistencyPct: 78,
    noteCompletionPct: 71,
    reportCompletionPct: 74,
    supervisionParticipationPct: 58,
    punctualityPct: 84,
    cancellationRatePct: 11,
    interdisciplinaryPct: 65,
    parentResponseHours: 42,
    actionPlanCompletionPct: 68,
    adminCompliancePct: 79,
    latenessCount: 4,
    missingNotes: 4,
    overdueReports: 2,
    missedSupervision: 2,
    unresolvedActionPlans: 2,
    schedulingReliabilityPct: 72,
    goalTrackingPct: 70,
    protocolAdherencePct: 75,
    caseContinuityPct: 76,
    meetingParticipationPct: 68,
    trainingParticipationPct: 60,
    colleagueSupportScore: 3.2,
    initiativeScore: 3.0,
    workloadHours: 36,
    supervisionDaysAgo: 35,
    strengths: ["Προσαρμογή σε δύσκολα περιστατικά"],
    growthAreas: [
      "Τεκμηρίωση — κρίσιμη καθυστέρηση",
      "Εποπτεία & ακυρώματα",
      "Διεπιστημονική συμμετοχή",
    ],
    pendingObligations: ["4 σημειώσεις", "2 αναφορές", "2 σχέδια δράσης", "Εποπτεία >21 ημ"],
    achievements: [],
    incentiveEligible: false,
    incentiveTierLabel: null,
  },
  {
    id: "t4",
    name: "Παπαδοπούλου Σ.",
    specialty: "Ειδική Εκπαίδευση",
    center: "evosmos",
    supervisorName: "Καπ. Παπαδάκη",
    sessionConsistencyPct: 95,
    noteCompletionPct: 98,
    reportCompletionPct: 97,
    supervisionParticipationPct: 94,
    punctualityPct: 99,
    cancellationRatePct: 2,
    interdisciplinaryPct: 92,
    parentResponseHours: 12,
    actionPlanCompletionPct: 96,
    adminCompliancePct: 98,
    latenessCount: 0,
    missingNotes: 0,
    overdueReports: 0,
    missedSupervision: 0,
    unresolvedActionPlans: 0,
    schedulingReliabilityPct: 97,
    goalTrackingPct: 95,
    protocolAdherencePct: 96,
    caseContinuityPct: 94,
    meetingParticipationPct: 95,
    trainingParticipationPct: 92,
    colleagueSupportScore: 4.8,
    initiativeScore: 4.6,
    workloadHours: 18,
    supervisionDaysAgo: 8,
    strengths: [
      "Υψηλή ποιότητα τεκμηρίωσης",
      "Μέντορας & εκπαιδευτικό υλικό",
      "Πρότυπο διεπιστημονικής συνεργασίας",
    ],
    growthAreas: ["Αξιοποίηση διαθέσιμης χωρητικότητας caseload"],
    pendingObligations: [],
    achievements: ["Βραβείο συνεργασίας 2026", "3 εκπαιδευτικά modules"],
    incentiveEligible: true,
    incentiveTierLabel: "Τριμηνιαίο bonus — έγκριση",
  },
];

function buildKpis(r: RawTherapist): HrTherapistKpi[] {
  const mk = (
    id: string,
    labelEl: string,
    value: number,
    unit: HrTherapistKpi["unit"],
    invert = false,
    trend: HrTherapistKpi["trend"] = "flat",
    trendLabel = "—"
  ): HrTherapistKpi => ({
    id,
    labelEl,
    value,
    unit,
    status: unit === "%" ? kpiStatusFromPct(value, invert) : kpiStatusFromPct(value >= 3.5 ? 90 : value >= 2.5 ? 75 : 55),
    trend,
    trendLabel,
    helper: "",
  });

  return [
    { ...mk("sess", "Συνέπεια ολοκλήρωσης συνεδριών", r.sessionConsistencyPct, "%"), helper: "Ολοκληρωμένες vs προγραμματισμένες" },
    { ...mk("notes", "Ολοκλήρωση σημειώσεων", r.noteCompletionPct, "%"), helper: "Εντός SLA 48ω" },
    { ...mk("reports", "Ολοκλήρωση αναφορών", r.reportCompletionPct, "%"), helper: "Περιοδικές & αξιολογικές" },
    { ...mk("sup", "Συμμετοχή εποπτείας", r.supervisionParticipationPct, "%"), helper: "Παρουσία & ενεργή συμμετοχή" },
    { ...mk("punct", "Παρουσία / ακρίβεια", r.punctualityPct, "%"), helper: "Έγκαιρη άφιξη" },
    { ...mk("cancel", "Ποσοστό ακυρώσεων", r.cancellationRatePct, "%", true, "down", r.cancellationRatePct > 8 ? "+2% μ.μ." : "σταθερό"), helper: "Όχι κίνητρο αύξησης συνεδριών" },
    { ...mk("inter", "Διεπιστημονική συμμετοχή", r.interdisciplinaryPct, "%"), helper: "Συναντήσεις & συντονισμός" },
    { ...mk("parent", "Απόκριση γονέων (ώρες)", r.parentResponseHours, "hours", true), helper: "Μέσος χρόνος απάντησης" },
    { ...mk("action", "Ολοκλήρωση σχεδίων δράσης", r.actionPlanCompletionPct, "%"), helper: "" },
    { ...mk("admin", "Διοικητική συμμόρφωση", r.adminCompliancePct, "%"), helper: "Φόρμες, GDPR, ωράρια" },
  ];
}

function computeOverall(r: RawTherapist): number {
  const doc = (r.noteCompletionPct + r.reportCompletionPct) / 2;
  const rel = (r.punctualityPct + r.schedulingReliabilityPct + (100 - r.cancellationRatePct * 3)) / 3;
  const collab = (r.interdisciplinaryPct + (r.parentResponseHours <= 24 ? 90 : 70)) / 2;
  const sup = r.supervisionParticipationPct;
  const workflow = (r.actionPlanCompletionPct + r.adminCompliancePct) / 2;
  const quality = (r.goalTrackingPct + r.protocolAdherencePct + r.caseContinuityPct) / 3;
  const weighted =
    doc * 0.22 + rel * 0.22 + collab * 0.16 + sup * 0.14 + workflow * 0.14 + quality * 0.12;
  return Math.round(Math.min(100, Math.max(0, weighted)));
}

export function buildDemoTherapistProfiles(): HrTherapistProfile[] {
  return RAW.map((r) => {
    const overall = computeOverall(r);
    return {
      id: r.id,
      name: r.name,
      specialty: r.specialty,
      center: r.center,
      supervisorName: r.supervisorName,
      employmentStatus: "active",
      overallScore: overall,
      riskLevel: scoreToRisk(overall),
      kpis: buildKpis(r),
      strengths: r.strengths,
      growthAreas: r.growthAreas,
      pendingObligations: r.pendingObligations,
      achievements: r.achievements,
      incentiveEligible: r.incentiveEligible,
      incentiveTierLabel: r.incentiveTierLabel,
    };
  });
}

export function getRawTherapistBurnoutInputs() {
  return RAW.map((r) => ({
    therapistId: r.id,
    therapistName: r.name,
    workloadHours: r.workloadHours,
    overdueNotes: r.missingNotes,
    overdueReports: r.overdueReports,
    supervisionDaysAgo: r.supervisionDaysAgo,
    cancellationRatePct: r.cancellationRatePct,
    noteCompletionPct: r.noteCompletionPct,
    supervisionParticipationPct: r.supervisionParticipationPct,
  }));
}

export const HR_RELIABILITY_SUMMARY = [
  { label: "Καθυστερήσεις άφιξης (μήνας)", count: 7, level: "medium" as const },
  { label: "Εκκρεμείς σημειώσεις", count: 7, level: "high" as const },
  { label: "Καθυστερημένες αναφορές", count: 3, level: "medium" as const },
  { label: "Χαμένη εποπτεία", count: 3, level: "high" as const },
  { label: "Ανοιχτά σχέδια δράσης", count: 3, level: "medium" as const },
  { label: "Αστοχίες προγραμματισμού", count: 2, level: "low" as const },
];

export const HR_INCENTIVE_PROPOSALS: HrIncentiveProposal[] = [
  {
    id: "inc1",
    therapistId: "t4",
    therapistName: "Παπαδοπούλου Σ.",
    period: "quarterly",
    type: "financial",
    amountEur: 450,
    labelEl: "Τριμηνιαίο bonus — συνέπεια & συνεργασία",
    status: "approved",
    basedOn: ["Τεκμηρίωση 98%", "Διεπιστημονική 92%", "Αξιολόγηση επόπτη"],
    supervisorRecommendation: true,
    managementApproved: true,
  },
  {
    id: "inc2",
    therapistId: "t1",
    therapistName: "Βασιλείου Ν.",
    period: "monthly",
    type: "recognition",
    amountEur: null,
    labelEl: "Αναγνώριση συνεργασίας — Μάιος",
    status: "proposed",
    basedOn: ["Μέντορας", "Σταθερή τεκμηρίωση"],
    supervisorRecommendation: true,
    managementApproved: false,
  },
  {
    id: "inc3",
    therapistId: "t1",
    therapistName: "Βασιλείου Ν.",
    period: "annual",
    type: "non_financial",
    amountEur: null,
    labelEl: "Επιπλέον ημέρα CE / εκπαίδευση",
    status: "proposed",
    basedOn: ["Στόχοι κέντρου", "Συνέπεια KPIs"],
    supervisorRecommendation: false,
    managementApproved: false,
  },
];

export const HR_MANAGEMENT_ADJUSTMENTS: HrManagementAdjustment[] = [
  {
    id: "adj1",
    therapistId: "t2",
    therapistName: "Γεωργίου Ε.",
    adjustedBy: "Διοίκηση ΚΔ",
    adjustedAt: "2026-05-10T14:00:00Z",
    previousScore: 74,
    newScore: 78,
    reason: "Προσωρινή άδεια ασθενείας — εξαίρεση καθυστέρησης αναφοράς",
    approved: true,
  },
];

export const HR_SUPERVISOR_EVALUATIONS: HrSupervisorEvaluation[] = [
  {
    id: "ev1",
    therapistId: "t1",
    therapistName: "Βασιλείου Ν.",
    supervisorName: "Δρ. Αλεξίου",
    periodLabel: "Α' τρίμηνο 2026",
    qualitativeFeedback:
      "Σταθερή κλινική πρακτική και άριστη συνεργασία με γονείς. Συνεχίζει υποστήριξη νέου συναδέλφου.",
    recommendedActions: ["Διατήρηση ρυθμού τεκμηρίωσης"],
    incentiveRecommendation: "recognition",
    submittedAt: "2026-04-28T09:00:00Z",
  },
  {
    id: "ev2",
    therapistId: "t3",
    therapistName: "Κωνσταντίνου Μ.",
    supervisorName: "Καπ. Παπαδάκη",
    periodLabel: "Α' τρίμηνο 2026",
    qualitativeFeedback:
      "Αυξημένος φόρτος και πίεση τεκμηρίωσης. Απαιτείται σχέδιο υποστήριξης — όχι ποινή πριν την ανάκαμψη.",
    recommendedActions: [
      "Εβδομαδιαία εποπτεία 4 εβδομάδες",
      "Μείωση νέων αναθέσεων",
      "Βοήθεια γραμματείας για σημειώσεις",
    ],
    incentiveRecommendation: "none",
    submittedAt: "2026-05-12T11:30:00Z",
  },
];

export const HR_AUDIT_LOG: HrAuditEntry[] = [
  {
    id: "aud1",
    action: "score_override",
    actor: "Διοίκηση ΚΔ",
    occurredAt: "2026-05-10T14:00:00Z",
    detail: "Γεωργίου Ε.: 74→78 — εξαίρεση άδειας",
    visibility: "management",
  },
  {
    id: "aud2",
    action: "incentive_approved",
    actor: "ORG_OWNER",
    occurredAt: "2026-05-08T16:00:00Z",
    detail: "Τριμηνιαίο bonus Παπαδοπούλου Σ. — €450",
    visibility: "hr",
  },
  {
    id: "aud3",
    action: "supervisor_evaluation",
    actor: "Καπ. Παπαδάκη",
    occurredAt: "2026-05-12T11:30:00Z",
    detail: "Αξιολόγηση Κωνσταντίνου Μ. — σχέδιο υποστήριξης",
    visibility: "supervisor",
  },
];
