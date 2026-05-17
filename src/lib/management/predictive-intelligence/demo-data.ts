/**
 * Static predictive intelligence demo scenarios.
 */

import type {
  CapacityForecast,
  ForecastCard,
  PredictedRiskFactor,
  PredictiveRiskItem,
  WaitingListForecast,
} from "./types";
import { confidenceFromFactorCount, riskFromScore, scoreFromFactors } from "./predict-rules";

function mkActions(overrides?: Partial<PredictiveRiskItem["actions"]>): PredictiveRiskItem["actions"] {
  return {
    management: "Έλεγχος διοίκησης & πλάνο παρέμβασης εντός 48ω",
    scheduling: "Αναδιανομή ωραρίου / εξέταση κενών slots",
    supervision: "Προγραμματισμός εποπτείας & case review",
    parentFollowUp: "Επικοινωνία γονέα & σαφής συμφωνία προγράμματος",
    ...overrides,
  };
}

function buildRisk(
  partial: Omit<PredictiveRiskItem, "score" | "maxScore" | "riskLevel" | "confidencePct"> & {
    factors: PredictedRiskFactor[];
    dataPoints?: number;
  }
): PredictiveRiskItem {
  const score = scoreFromFactors(partial.factors);
  return {
    ...partial,
    score,
    maxScore: 100,
    riskLevel: riskFromScore(score),
    confidencePct: confidenceFromFactorCount(partial.factors, partial.dataPoints ?? 8),
  };
}

const CHILD_FACTORS = {
  absences: { code: "abs", label: "Συχνές απουσίες", weight: 18, present: true },
  cancellations: { code: "can", label: "Ακυρώσεις", weight: 14, present: true },
  overdueBalance: { code: "bal", label: "Ανεξόφλητο", weight: 16, present: false },
  reducedFreq: { code: "freq", label: "Μειωμένη συχνότητα", weight: 15, present: false },
  reassessment: { code: "re", label: "Εκπρόθεσμη επανεκτίμηση", weight: 12, present: false },
  parentSilent: { code: "par", label: "Έλλειψη απάντησης γονέα", weight: 10, present: false },
  fragmented: { code: "frag", label: "Θραυσματικό πρόγραμμα", weight: 15, present: false },
};

export const DEMO_CHILD_CONTINUITY: PredictiveRiskItem[] = [
  buildRisk({
    id: "pc-1",
    subjectLabel: "Τσίτσος Μ.",
    subjectType: "child",
    center: "nikaia",
    horizon: "30d",
    predictionLabel: "Κίνδυνος διακοπής (dropout)",
    trendDirection: "worsening",
    factors: [
      { ...CHILD_FACTORS.absences, present: true },
      { ...CHILD_FACTORS.cancellations, present: true },
      { ...CHILD_FACTORS.reducedFreq, present: true },
      { ...CHILD_FACTORS.reassessment, present: true },
      { ...CHILD_FACTORS.fragmented, present: true },
      { ...CHILD_FACTORS.parentSilent, present: true },
    ],
    actions: mkActions({
      management: "Case conference εντός 5 ημερών · αξιολόγηση συνέχειας",
      parentFollowUp: "Άμεση κλήση γονέα — πρόγραμμα ρύθμισης",
    }),
    dataPoints: 12,
  }),
  buildRisk({
    id: "pc-2",
    subjectLabel: "Φωτίου Κ.",
    subjectType: "child",
    center: "nikaia",
    horizon: "30d",
    predictionLabel: "Οικονομικός κίνδυνος διακοπής",
    trendDirection: "worsening",
    factors: [
      { ...CHILD_FACTORS.overdueBalance, present: true },
      { ...CHILD_FACTORS.absences, present: false },
      { ...CHILD_FACTORS.parentSilent, present: true },
    ],
    actions: mkActions({
      management: "Έλεγχος διοίκησης · πλάνο δόσεων πριν αναστολή",
      scheduling: "Διατήρηση θεραπευτικού ραντεβού — όχι ακύρωση λόγω οφειλής χωρίς απόφαση",
    }),
    dataPoints: 10,
  }),
  buildRisk({
    id: "pc-3",
    subjectLabel: "Οικονομίδου Ε.",
    subjectType: "child",
    center: "evosmos",
    horizon: "7d",
    predictionLabel: "Αποδυνάμωση προσέλευσης",
    trendDirection: "worsening",
    factors: [
      { ...CHILD_FACTORS.cancellations, present: true },
      { ...CHILD_FACTORS.reducedFreq, present: true },
    ],
    actions: mkActions({ parentFollowUp: "SMS + τηλεφωνική επικοινωνία εντός 24ω" }),
    dataPoints: 7,
  }),
  buildRisk({
    id: "pc-4",
    subjectLabel: "Αλεξίου Δ.",
    subjectType: "child",
    center: "evosmos",
    horizon: "30d",
    predictionLabel: "Αστάθεια προγράμματος",
    trendDirection: "stable",
    factors: [
      { ...CHILD_FACTORS.fragmented, present: true },
      { ...CHILD_FACTORS.reassessment, present: true },
    ],
    actions: mkActions({ scheduling: "Ενοποίηση slots — 2 συνεχόμενες μέρες/εβδ." }),
    dataPoints: 6,
  }),
];

export const DEMO_THERAPIST_BURNOUT: PredictiveRiskItem[] = [
  buildRisk({
    id: "tb-1",
    subjectLabel: "Κωνσταντίνου Μ.",
    subjectType: "therapist",
    center: "evosmos",
    horizon: "7d",
    predictionLabel: "Υπερφόρτωση / burnout",
    trendDirection: "worsening",
    factors: [
      { code: "hrs", label: "Ώρες > ορίου", weight: 20, present: true },
      { code: "brk", label: "Ανεπαρκή διαλείμματα", weight: 12, present: true },
      { code: "case", label: "Υψηλό caseload", weight: 18, present: true },
      { code: "emo", label: "Συναισθηματικά απαιτητικά cases", weight: 14, present: true },
      { code: "rep", label: "Backlog αναφορών", weight: 16, present: true },
      { code: "grp", label: "Πολλές ομαδικές", weight: 10, present: true },
      { code: "sup", label: "Καθυστέρηση εποπτείας", weight: 10, present: true },
    ],
    actions: mkActions({
      management: "Μείωση νέων αναθέσεων 2 εβδομάδες",
      scheduling: "Μείωση 4 ωρών/εβδ. · προστασία διαλειμμάτων",
      supervision: "Επείγουσα εποπτεία εντός 7 ημερών",
    }),
    dataPoints: 14,
  }),
  buildRisk({
    id: "tb-2",
    subjectLabel: "Γεωργίου Ε.",
    subjectType: "therapist",
    center: "nikaia",
    horizon: "30d",
    predictionLabel: "Κίνδυνος burnout (μέτριος)",
    trendDirection: "stable",
    factors: [
      { code: "rep", label: "Backlog αναφορών", weight: 18, present: true },
      { code: "sup", label: "Καθυστέρηση εποπτείας", weight: 12, present: true },
      { code: "emo", label: "Συναισθηματικά απαιτητικά cases", weight: 14, present: true },
    ],
    actions: mkActions({ supervision: "Εβδομαδιαία εποπτεία · προτεραιότητα αναφορών" }),
    dataPoints: 9,
  }),
];

export const DEMO_CAPACITY: CapacityForecast[] = [
  { id: "cap-1", label: "Έλλειψη αιθουσών", dayOrPeriod: "Εβδ. 20–26 Μαΐου", predictedLoadPct: 96, riskLevel: "critical", detail: "Πρόβλεψη πληρότητας 96% Τρί-Πέμ 17:00–20:00" },
  { id: "cap-2", label: "Υπερφορτωμένη Παρασκευή", dayOrPeriod: "Κάθε Παρασκευή (30ημ.)", predictedLoadPct: 88, riskLevel: "high", detail: "Αιχμή ακυρώσεων + αναμονές" },
  { id: "cap-3", label: "Υποαξιοποίηση πρωινού", dayOrPeriod: "Εύοσμος Δευτ-Τετ", predictedLoadPct: 42, riskLevel: "medium", detail: "6+ κενά slots/εβδ. — ευκαιρία intake" },
  { id: "cap-4", label: "Πίεση λίστας αναμονής", dayOrPeriod: "Τρίμηνο Q2", predictedLoadPct: 78, riskLevel: "high", detail: "18 αναμονές → πρόβλεψη 24 σε 30 ημέρες" },
  { id: "cap-5", label: "Staffing bottleneck", dayOrPeriod: "Ιούνιος", predictedLoadPct: 82, riskLevel: "high", detail: "Άδειες θεραπευτών + αυξημένη ζήτηση αξιολογήσεων" },
];

export const DEMO_FINANCIAL_FORECASTS: ForecastCard[] = [
  { id: "ff-1", title: "Πίεση ταμειακής ροής", horizon: "30d", currentValue: "€18.500", predictedValue: "€12.200", changeLabel: "-34% ρευστότητα", riskLevel: "high", warning: "Εκροές πριν εισπράξεις Ιουνίου" },
  { id: "ff-2", title: "Πρόβλημα είσπραξης", horizon: "30d", currentValue: "86.8%", predictedValue: "84.2%", changeLabel: "-2.6 π.μ.", riskLevel: "medium" },
  { id: "ff-3", title: "Ανεξόφλητα", horizon: "30d", currentValue: "€4.420", predictedValue: "€5.800", changeLabel: "+31%", riskLevel: "high" },
  { id: "ff-4", title: "Απόκλιση budget", horizon: "quarter", currentValue: "+€1.100", predictedValue: "+€2.400", changeLabel: "Έξοδα", riskLevel: "medium" },
  { id: "ff-5", title: "Πληρότητα vs έσοδα", horizon: "30d", currentValue: "91% / +2%", predictedValue: "93% / +0.5%", changeLabel: "Αναντιστοιχία", riskLevel: "high", warning: "Υψηλή πληρότητα, χαμηλότερη είσπραξη" },
  { id: "ff-6", title: "Εποχικότητα εσόδων", horizon: "year", currentValue: "Μάιος +4%", predictedValue: "Ιούλιος -8%", changeLabel: "Καλοκαίρι", riskLevel: "medium" },
];

export const DEMO_CLINICAL_WORKFLOW: PredictiveRiskItem[] = [
  buildRisk({
    id: "cw-1",
    subjectLabel: "Αναφορές — Νίκαια",
    subjectType: "workflow",
    center: "nikaia",
    horizon: "7d",
    predictionLabel: "Καθυστέρηση αναφορών",
    trendDirection: "worsening",
    factors: [
      { code: "rep", label: "Εκπρόθεσμες αναφορές", weight: 25, present: true },
      { code: "coord", label: "Αποτυχία διεπιστημονικής", weight: 20, present: true },
    ],
    actions: mkActions({ management: "KPI deadline · γραμματεία chase" }),
    dataPoints: 11,
  }),
  buildRisk({
    id: "cw-2",
    subjectLabel: "Τσίτσος Μ. — επανεκτίμηση",
    subjectType: "child",
    center: "nikaia",
    horizon: "30d",
    predictionLabel: "Καθυστέρηση reassessment",
    trendDirection: "worsening",
    factors: [{ code: "re", label: "Εκπρόθεσμη επανεκτίμηση", weight: 30, present: true }],
    actions: mkActions({ supervision: "Προγραμματισμός reassessment εντός 10 ημερών" }),
    dataPoints: 5,
  }),
  buildRisk({
    id: "cw-3",
    subjectLabel: "Στόχοι — στάσιμη πρόοδος",
    subjectType: "child",
    center: "evosmos",
    horizon: "30d",
    predictionLabel: "Στασιμότητα στόχων",
    trendDirection: "stable",
    factors: [
      { code: "goal", label: "Στάσιμοι στόχοι 6+ εβδ.", weight: 22, present: true },
      { code: "prog", label: "Ασυνεπής πρόοδος", weight: 18, present: true },
    ],
    actions: mkActions({ supervision: "Αναθεώρηση στόχων & πλάνο παρέμβασης" }),
    dataPoints: 8,
  }),
];

export const DEMO_WAITING_LIST: WaitingListForecast[] = [
  { specialty: "Λογοθεραπεία", currentWait: 8, predicted30d: 11, saturationRisk: "high", weeksToSlot: 5.2 },
  { specialty: "Εργοθεραπεία", currentWait: 6, predicted30d: 9, saturationRisk: "critical", weeksToSlot: 6.8 },
  { specialty: "Ψυχολογία", currentWait: 4, predicted30d: 5, saturationRisk: "medium", weeksToSlot: 3.1 },
  { specialty: "Αξιολογήσεις (intake)", currentWait: 12, predicted30d: 16, saturationRisk: "high", weeksToSlot: 4.5 },
];

export const DEMO_FORECAST_SERIES = {
  sevenDay: [
    { label: "Δευ", predicted: 78, baseline: 82, unit: "score" as const },
    { label: "Τρι", predicted: 82, baseline: 81, unit: "score" as const },
    { label: "Τετ", predicted: 85, baseline: 80, unit: "score" as const },
    { label: "Πέμ", predicted: 88, baseline: 83, unit: "score" as const },
    { label: "Παρ", predicted: 91, baseline: 79, unit: "score" as const },
    { label: "Σαβ", predicted: 45, baseline: 50, unit: "score" as const },
    { label: "Κυρ", predicted: 20, baseline: 20, unit: "score" as const },
  ],
  thirtyDay: [
    { label: "Εβδ.1", predicted: 80, baseline: 82, unit: "score" as const },
    { label: "Εβδ.2", predicted: 83, baseline: 81, unit: "score" as const },
    { label: "Εβδ.3", predicted: 86, baseline: 80, unit: "score" as const },
    { label: "Εβδ.4", predicted: 89, baseline: 79, unit: "score" as const },
  ],
  quarter: [
    { label: "Μάι", predicted: 82, baseline: 80, unit: "score" as const },
    { label: "Ιούν", predicted: 85, baseline: 81, unit: "score" as const },
    { label: "Ιούλ", predicted: 72, baseline: 78, unit: "score" as const },
  ],
  year: [
    { label: "Q1", predicted: 76, baseline: 74, unit: "score" as const },
    { label: "Q2", predicted: 84, baseline: 79, unit: "score" as const },
    { label: "Q3", predicted: 71, baseline: 77, unit: "score" as const },
    { label: "Q4", predicted: 80, baseline: 78, unit: "score" as const },
  ],
};

export const DEMO_HEATMAP = [
  {
    label: "Dropout risk",
    cells: [
      { period: "7ημ", score: 42 },
      { period: "30ημ", score: 58 },
      { period: "Τρίμ", score: 65 },
      { period: "Έτος", score: 48 },
    ],
  },
  {
    label: "Burnout risk",
    cells: [
      { period: "7ημ", score: 72 },
      { period: "30ημ", score: 68 },
      { period: "Τρίμ", score: 55 },
      { period: "Έτος", score: 50 },
    ],
  },
  {
    label: "Capacity pressure",
    cells: [
      { period: "7ημ", score: 88 },
      { period: "30ημ", score: 82 },
      { period: "Τρίμ", score: 75 },
      { period: "Έτος", score: 70 },
    ],
  },
  {
    label: "Cash-flow risk",
    cells: [
      { period: "7ημ", score: 35 },
      { period: "30ημ", score: 62 },
      { period: "Τρίμ", score: 58 },
      { period: "Έτος", score: 45 },
    ],
  },
];
