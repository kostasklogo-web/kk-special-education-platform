/**
 * Static demo data for operational intelligence (no Supabase).
 */

import type {
  ChildOpsRow,
  HeatmapCell,
  OpsAlert,
  SchedulingInsight,
  SecretaryOpsSnapshot,
  SupervisionOpsRow,
  TherapistOpsRow,
  TrendComparisonRow,
  TrendSeriesPoint,
  InterdisciplinaryGap,
  FinancialOpsInsight,
} from "./types";

export const OPS_DEMO_THERAPISTS: TherapistOpsRow[] = [
  {
    id: "t1",
    name: "Βασιλείου Ν.",
    specialty: "Λογοθεραπεία",
    center: "nikaia",
    caseloadPressure: "high",
    completionConsistencyPct: 92,
    overdueNotes: 1,
    overdueReports: 0,
    supervisionDaysAgo: 12,
    attendanceStabilityPct: 94,
    cancellationRatePct: 4,
    workloadTrend: "up",
    workloadHours: 34,
  },
  {
    id: "t2",
    name: "Γεωργίου Ε.",
    specialty: "Ψυχολογία",
    center: "nikaia",
    caseloadPressure: "medium",
    completionConsistencyPct: 88,
    overdueNotes: 2,
    overdueReports: 1,
    supervisionDaysAgo: 21,
    attendanceStabilityPct: 89,
    cancellationRatePct: 6,
    workloadTrend: "flat",
    workloadHours: 28,
  },
  {
    id: "t3",
    name: "Κωνσταντίνου Μ.",
    specialty: "Εργοθεραπεία",
    center: "evosmos",
    caseloadPressure: "critical",
    completionConsistencyPct: 78,
    overdueNotes: 4,
    overdueReports: 2,
    supervisionDaysAgo: 35,
    attendanceStabilityPct: 82,
    cancellationRatePct: 11,
    workloadTrend: "up",
    workloadHours: 36,
  },
  {
    id: "t4",
    name: "Παπαδοπούλου Σ.",
    specialty: "Ειδική Εκπαίδευση",
    center: "evosmos",
    caseloadPressure: "low",
    completionConsistencyPct: 95,
    overdueNotes: 0,
    overdueReports: 0,
    supervisionDaysAgo: 8,
    attendanceStabilityPct: 96,
    cancellationRatePct: 2,
    workloadTrend: "down",
    workloadHours: 18,
  },
  {
    id: "t5",
    name: "Νικολάου Κ.",
    specialty: "Φυσικοθεραπεία",
    center: "nikaia",
    caseloadPressure: "medium",
    completionConsistencyPct: 90,
    overdueNotes: 1,
    overdueReports: 1,
    supervisionDaysAgo: 18,
    attendanceStabilityPct: 91,
    cancellationRatePct: 5,
    workloadTrend: "up",
    workloadHours: 26,
  },
];

export const OPS_DEMO_CHILDREN: ChildOpsRow[] = [
  {
    id: "c1",
    childName: "Παπαδόπουλος Ν.",
    center: "nikaia",
    regressionRisk: "low",
    attendanceDeterioration: "low",
    cancellationPattern: "low",
    reassessmentOverdue: false,
    reportsOverdue: 0,
    coordinationIssue: false,
    scheduleFragmentation: "low",
    parentCommsFrequency: "normal",
    financialContinuityRisk: "low",
  },
  {
    id: "c2",
    childName: "Τσίτσος Μ.",
    center: "nikaia",
    regressionRisk: "high",
    attendanceDeterioration: "high",
    cancellationPattern: "medium",
    reassessmentOverdue: true,
    reportsOverdue: 1,
    coordinationIssue: true,
    scheduleFragmentation: "high",
    parentCommsFrequency: "elevated",
    financialContinuityRisk: "high",
  },
  {
    id: "c3",
    childName: "Οικονομίδου Ε.",
    center: "evosmos",
    regressionRisk: "medium",
    attendanceDeterioration: "medium",
    cancellationPattern: "high",
    reassessmentOverdue: false,
    reportsOverdue: 0,
    coordinationIssue: false,
    scheduleFragmentation: "medium",
    parentCommsFrequency: "high",
    financialContinuityRisk: "medium",
  },
  {
    id: "c4",
    childName: "Φωτίου Κ.",
    center: "nikaia",
    regressionRisk: "medium",
    attendanceDeterioration: "low",
    cancellationPattern: "low",
    reassessmentOverdue: false,
    reportsOverdue: 2,
    coordinationIssue: true,
    scheduleFragmentation: "medium",
    parentCommsFrequency: "elevated",
    financialContinuityRisk: "critical",
  },
  {
    id: "c5",
    childName: "Αλεξίου Δ.",
    center: "evosmos",
    regressionRisk: "low",
    attendanceDeterioration: "medium",
    cancellationPattern: "medium",
    reassessmentOverdue: true,
    reportsOverdue: 0,
    coordinationIssue: false,
    scheduleFragmentation: "high",
    parentCommsFrequency: "normal",
    financialContinuityRisk: "low",
  },
];

export const OPS_SCHEDULING_INSIGHTS: SchedulingInsight[] = [
  {
    id: "sch-1",
    category: "therapist_overload",
    label: "Υπερφόρτωση θεραπευτή",
    subject: "Κωνσταντίνου Μ. (Εργοθεραπεία)",
    center: "evosmos",
    metricValue: 36,
    threshold: 32,
    riskLevel: "critical",
    detail: "Ωρές προγραμματισμένες > όριο 32h/εβδ. · 3 ακυρώσεις την Τρίτη",
  },
  {
    id: "sch-2",
    category: "therapist_underuse",
    label: "Υποαξιοποίηση",
    subject: "Παπαδοπούλου Σ. (ΕΕ)",
    center: "evosmos",
    metricValue: 18,
    threshold: 24,
    riskLevel: "medium",
    detail: "Αξιοποίηση 62% — διαθέσιμες θέσεις Πέμ-Παρ",
  },
  {
    id: "sch-3",
    category: "room_overload",
    label: "Υπερφόρτωση αίθουσας",
    subject: "Αίθουσα 3 — Νίκαια",
    center: "nikaia",
    metricValue: 94,
    threshold: 85,
    riskLevel: "high",
    detail: "Πληρότητα 94% Τρί-Πέμ 15:00–19:00",
  },
  {
    id: "sch-4",
    category: "empty_slot",
    label: "Κενά slots",
    subject: "Εύοσμος — πρωινό block",
    center: "evosmos",
    metricValue: 6,
    threshold: 2,
    riskLevel: "medium",
    detail: "6 κενές 45′ θέσεις Δευτ-Τετ 09:00–12:00",
  },
  {
    id: "sch-5",
    category: "bottleneck",
    label: "Επαναλαμβανόμενο bottleneck",
    subject: "Λογοθεραπεία — 17:30",
    center: "nikaia",
    metricValue: 5,
    threshold: 3,
    riskLevel: "high",
    detail: "5 αναμονές/εβδ. στην ίδια ώρα — καθυστέρηση >10 λεπτά",
  },
  {
    id: "sch-6",
    category: "late_overload",
    label: "Υπερφόρτωση απογευματινού",
    subject: "Νίκαια — 18:00–20:30",
    center: "nikaia",
    metricValue: 28,
    threshold: 24,
    riskLevel: "high",
    detail: "28 ενεργές συνεδρίες/εβδ. μετά τις 18:00",
  },
  {
    id: "sch-7",
    category: "cancellation_spike",
    label: "Αιχμή ακυρώσεων",
    subject: "Παρασκευή — και τα δύο κέντρα",
    center: "nikaia",
    metricValue: 9,
    threshold: 5,
    riskLevel: "medium",
    detail: "9 ακυρώσεις την τελευταία Παρασκευή (+80% vs μέσος όρος)",
  },
  {
    id: "sch-8",
    category: "inefficient_gap",
    label: "Αναποτελεσματικά κενά",
    subject: "Δρ. Ανδρέου — 50′ blocks",
    center: "nikaia",
    metricValue: 4,
    threshold: 2,
    riskLevel: "low",
    detail: "4 κενά 15′ μεταξύ κλινικών συναντήσεων",
  },
];

export const OPS_FINANCIAL_INSIGHTS: FinancialOpsInsight[] = [
  {
    id: "fin-1",
    label: "Χαμηλή είσπραξη",
    riskLevel: "high",
    currentValue: "86.8%",
    detail: "Είσπραξη/τζίρος κάτω από στόχο 90% — 4 οικογένειες σε καθυστέρηση",
  },
  {
    id: "fin-2",
    label: "Ανεξόφλητα σε αύξηση",
    riskLevel: "medium",
    currentValue: "€4.420",
    detail: "+12% vs προηγ. μήνα · κύρια οφειλή Φωτίου Κ.",
  },
  {
    id: "fin-3",
    label: "Ταμειακή αστάθεια",
    riskLevel: "medium",
    currentValue: "€18.500",
    detail: "Εκροές 12–15 Ιουνίου πριν εισπράξεις μήνα",
  },
  {
    id: "fin-4",
    label: "Αιχμή εξόδων",
    riskLevel: "medium",
    currentValue: "Marketing +18.8%",
    detail: "Υπέρβαση budget marketing · συντήρηση +24%",
  },
  {
    id: "fin-5",
    label: "Πρόγραμμα υποαπόδοσης",
    riskLevel: "low",
    currentValue: "Ομαδικά SE",
    detail: "Πληρότητα 68% vs έσοδα στόχος 85%",
  },
  {
    id: "fin-6",
    label: "Πληρότητα vs έσοδα",
    riskLevel: "high",
    currentValue: "Νίκαια 91% / +2% έσοδα",
    detail: "Υψηλή πληρότητα με χαμηλότερη είσπραξη — έλεγχος τιμολόγησης",
  },
];

export const OPS_SECRETARY: SecretaryOpsSnapshot = {
  overdueReminders: 7,
  unresolvedTasks: 14,
  overloadedDays: 3,
  communicationBacklog: 11,
  pendingReportCoordination: 5,
  unresolvedMeetingFollowups: 4,
};

export const OPS_SUPERVISION: SupervisionOpsRow[] = [
  { id: "s1", therapistName: "Κωνσταντίνου Μ.", daysSinceSupervision: 35, missingNotes: true, unresolvedActions: 2, riskLevel: "critical" },
  { id: "s2", therapistName: "Γεωργίου Ε.", daysSinceSupervision: 21, missingNotes: false, unresolvedActions: 1, riskLevel: "high" },
  { id: "s3", therapistName: "Νικολάου Κ.", daysSinceSupervision: 18, missingNotes: false, unresolvedActions: 0, riskLevel: "medium" },
  { id: "s4", therapistName: "Βασιλείου Ν.", daysSinceSupervision: 12, missingNotes: false, unresolvedActions: 0, riskLevel: "low" },
];

export const OPS_INTERDISCIPLINARY: InterdisciplinaryGap[] = [
  {
    childName: "Τσίτσος Μ.",
    daysSinceReview: 94,
    specialtiesInvolved: ["Εργοθεραπεία", "Λογοθεραπεία", "Ψυχολογία"],
    riskLevel: "critical",
  },
  {
    childName: "Φωτίου Κ.",
    daysSinceReview: 62,
    specialtiesInvolved: ["Λογοθεραπεία", "ΕΕ"],
    riskLevel: "high",
  },
];

export const OPS_WEEKLY_TRENDS: TrendSeriesPoint[] = [
  { label: "Εβδ. 1", value: 78 },
  { label: "Εβδ. 2", value: 81 },
  { label: "Εβδ. 3", value: 79 },
  { label: "Εβδ. 4", value: 84 },
];

export const OPS_MONTHLY_TRENDS: TrendSeriesPoint[] = [
  { label: "Ιαν", value: 74 },
  { label: "Φεβ", value: 76 },
  { label: "Μαρ", value: 78 },
  { label: "Απρ", value: 77 },
  { label: "Μάι", value: 82 },
];

export const OPS_YEARLY_TRENDS: TrendSeriesPoint[] = [
  { label: "2023", value: 72 },
  { label: "2024", value: 78 },
  { label: "2025", value: 82 },
];

export const OPS_CENTER_COMPARISON: TrendComparisonRow[] = [
  { id: "c-nik", label: "Νίκαια", weekly: 84, monthly: 83, yearly: 81, trend: "up" },
  { id: "c-evo", label: "Εύοσμος", weekly: 76, monthly: 74, yearly: 72, trend: "flat" },
];

export const OPS_SPECIALTY_COMPARISON: TrendComparisonRow[] = [
  { id: "sp-log", label: "Λογοθεραπεία", weekly: 86, monthly: 85, yearly: 84, trend: "up" },
  { id: "sp-erg", label: "Εργοθεραπεία", weekly: 72, monthly: 70, yearly: 68, trend: "down" },
  { id: "sp-psy", label: "Ψυχολογία", weekly: 80, monthly: 79, yearly: 78, trend: "flat" },
];

export const OPS_THERAPIST_COMPARISON: TrendComparisonRow[] = OPS_DEMO_THERAPISTS.map((t) => ({
  id: t.id,
  label: t.name,
  weekly: t.completionConsistencyPct,
  monthly: t.attendanceStabilityPct,
  yearly: Math.round((t.completionConsistencyPct + t.attendanceStabilityPct) / 2),
  trend: t.workloadTrend,
}));

const DAYS = ["Δευ", "Τρι", "Τετ", "Πέμ", "Παρ"];
const HOURS = ["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export function buildOccupancyHeatmap(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (const day of DAYS) {
    for (const hour of HOURS) {
      const h = parseInt(hour, 10);
      const base = h >= 18 ? 85 : h >= 16 ? 70 : 45;
      const jitter = (day.charCodeAt(0) + h) % 25;
      const intensity = Math.min(100, base + jitter);
      cells.push({
        day,
        hour,
        intensity,
        label: `${intensity}%`,
      });
    }
  }
  return cells;
}

export function buildDemoAlerts(): OpsAlert[] {
  return [
    {
      id: "al-1",
      kind: "therapist_overload",
      level: "critical",
      title: "Υπερφόρτωση — Κωνσταντίνου Μ.",
      detail: "36h/εβδ. · 4 εκκρεμείς σημειώσεις · εποπτεία 35 ημέρες",
      center: "evosmos",
      urgencyRank: 98,
      detectedAt: "2026-05-15T08:00:00",
      suggestedAction: "Αναδιανομή caseload & επείγουσα εποπτεία",
    },
    {
      id: "al-2",
      kind: "low_attendance",
      level: "high",
      title: "Υποβαθμισμένη προσέλευση — Τσίτσος Μ.",
      detail: "Πτώση προσέλευσης 18% τις τελευταίες 3 εβδομάδες",
      center: "nikaia",
      urgencyRank: 88,
      detectedAt: "2026-05-14T14:30:00",
      suggestedAction: "Επικοινωνία γονέων & επανεκτίμηση προγράμματος",
    },
    {
      id: "al-3",
      kind: "report_delay",
      level: "high",
      title: "Καθυστέρηση αναφορών",
      detail: "5 αναφορές >14 ημέρες · 2 παιδιά χωρίς διεπιστημονική",
      center: "nikaia",
      urgencyRank: 85,
      detectedAt: "2026-05-15T09:15:00",
      suggestedAction: "Προτεραιότητα στη γραμματεία & KPI θεραπευτών",
    },
    {
      id: "al-4",
      kind: "revenue_decline",
      level: "medium",
      title: "Πίεση εισπράξεων",
      detail: "Είσπραξη 86.8% vs στόχος 90%",
      center: "omilos",
      urgencyRank: 72,
      detectedAt: "2026-05-13T11:00:00",
      suggestedAction: "Follow-up οφειλών & πρόβλεψη ταμειακής ροής",
    },
    {
      id: "al-5",
      kind: "room_capacity",
      level: "medium",
      title: "Χωρητικότητα Αίθουσα 3",
      detail: "Πληρότητα 94% απογευματινό block",
      center: "nikaia",
      urgencyRank: 68,
      detectedAt: "2026-05-12T16:45:00",
      suggestedAction: "Μετακίνηση ομαδικών ή επέκταση ωραρίου",
    },
    {
      id: "al-6",
      kind: "parent_followup",
      level: "high",
      title: "Οικονομικός κίνδυνος συνέχειας — Φωτίου Κ.",
      detail: "€360 ανεξόφλητα · 32 ημέρες καθυστέρηση",
      center: "nikaia",
      urgencyRank: 90,
      detectedAt: "2026-05-15T07:30:00",
      suggestedAction: "Έλεγχος διοίκησης & πλάνο ρύθμισης",
    },
    {
      id: "al-7",
      kind: "waiting_list",
      level: "medium",
      title: "Πίεση λίστας αναμονής",
      detail: "18 αναμονές · μέσος χρόνος 6.2 εβδομάδες",
      center: "evosmos",
      urgencyRank: 65,
      detectedAt: "2026-05-11T10:00:00",
      suggestedAction: "Αξιολόγηση προτεραιοτήτων & κενών slots",
    },
    {
      id: "al-8",
      kind: "clinical_coordination",
      level: "high",
      title: "Έλλειψη διεπιστημονικής — Τσίτσος Μ.",
      detail: "94 ημέρες χωρίς review · 3 ειδικότητες",
      center: "nikaia",
      urgencyRank: 86,
      detectedAt: "2026-05-14T11:20:00",
      suggestedAction: "Προγραμματισμός case conference",
    },
  ];
}
