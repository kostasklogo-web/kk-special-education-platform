import type { HrBurnoutRisk, HrRiskLevel, HrTherapistProfile } from "./types";

export function scoreToRisk(score: number, maxScore = 100): HrRiskLevel {
  const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  if (pct >= 85) return "low";
  if (pct >= 70) return "medium";
  if (pct >= 55) return "high";
  return "critical";
}

type BurnoutInput = {
  therapistId: string;
  therapistName: string;
  workloadHours: number;
  overdueNotes: number;
  overdueReports: number;
  supervisionDaysAgo: number;
  cancellationRatePct: number;
  noteCompletionPct: number;
  supervisionParticipationPct: number;
};

export function detectBurnoutRisks(inputs: BurnoutInput[]): HrBurnoutRisk[] {
  const out: HrBurnoutRisk[] = [];
  const now = "2026-05-15T10:00:00Z";

  for (const t of inputs) {
    const signals: string[] = [];
    let severity = 0;

    if (t.workloadHours >= 34) {
      signals.push(`Υψηλός φόρτος (${t.workloadHours} ώρες/εβδ.)`);
      severity += 2;
    }
    if (t.overdueNotes >= 3) {
      signals.push(`Υποβολή σημειώσεων: ${t.overdueNotes} εκκρεμείς`);
      severity += 2;
    }
    if (t.noteCompletionPct < 80) {
      signals.push(`Πτώση τεκμηρίωσης (${t.noteCompletionPct}%)`);
      severity += 2;
    }
    if (t.supervisionDaysAgo > 28) {
      signals.push(`Αποστασιοποίηση εποπτείας (${t.supervisionDaysAgo} ημέρες)`);
      severity += 2;
    }
    if (t.supervisionParticipationPct < 70) {
      signals.push(`Χαμηλή συμμετοχή εποπτείας (${t.supervisionParticipationPct}%)`);
      severity += 1;
    }
    if (t.cancellationRatePct >= 10) {
      signals.push(`Αυξημένα ακυρώματα (${t.cancellationRatePct}%)`);
      severity += 1;
    }
    if (t.overdueReports >= 2) {
      signals.push(`${t.overdueReports} καθυστερημένες αναφορές`);
      severity += 1;
    }

    if (signals.length < 2) continue;

    const level: HrRiskLevel =
      severity >= 5 ? "critical" : severity >= 3 ? "high" : severity >= 2 ? "medium" : "low";

    const suggestedActions: string[] = [];
    if (t.workloadHours >= 34) suggestedActions.push("Αναδιανομή φόρτου / προσωρινή μείωση caseload");
    if (t.overdueNotes >= 2) suggestedActions.push("Προτεραιότητα τεκμηρίωσης — υποστήριξη γραμματείας");
    if (t.supervisionDaysAgo > 21) suggestedActions.push("Άμεση συνάντηση εποπτείας");
    if (t.cancellationRatePct >= 8) suggestedActions.push("Έλεγχος προγράμματος & επικοινωνία με γονείς");

    out.push({
      id: `burnout-${t.therapistId}`,
      therapistId: t.therapistId,
      therapistName: t.therapistName,
      level,
      signals,
      suggestedActions: suggestedActions.length ? suggestedActions : ["Παρακολούθηση από επόπτη"],
      detectedAt: now,
    });
  }
  return out.sort((a, b) => {
    const rank: Record<HrRiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return rank[b.level] - rank[a.level];
  });
}

export function overallRiskFromTherapists(therapists: HrTherapistProfile[]): HrRiskLevel {
  if (!therapists.length) return "low";
  const worst = therapists.reduce((w, t) => {
    const order: Record<HrRiskLevel, number> = { critical: 4, high: 3, medium: 2, low: 1 };
    return order[t.riskLevel] > order[w] ? t.riskLevel : w;
  }, "low" as HrRiskLevel);
  return worst;
}
