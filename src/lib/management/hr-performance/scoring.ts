/**
 * Balanced performance scoring — clinical documentation & reliability first.
 * Explicitly excludes revenue and raw session volume from weights.
 */

import type { HrScoreDimension, HrTherapistKpi } from "./types";
import { scoreToRisk } from "./risk-rules";

export const SCORE_WEIGHTS = {
  clinicalDocumentation: 22,
  reliability: 22,
  collaboration: 16,
  supervisionParticipation: 14,
  workflowCompletion: 14,
  qualityConsistency: 12,
} as const;

export const SCORING_PHILOSOPHY_EL =
  "Η βαθμολογία συνθέτει τεκμηρίωση, αξιοπιστία λειτουργίας, συνεργασία και εποπτεία — όχι έσοδα ή αριθμό συνεδριών.";

export function computeWeightedOverall(dimensions: HrScoreDimension[]): number {
  const totalWeight = dimensions.reduce((s, d) => s + d.weightPct, 0);
  if (totalWeight === 0) return 0;
  const weighted = dimensions.reduce((s, d) => s + (d.score / d.maxScore) * 100 * (d.weightPct / totalWeight), 0);
  return Math.round(weighted);
}

export function buildOrgScoreDimensions(): HrScoreDimension[] {
  const dims: Omit<HrScoreDimension, "riskLevel">[] = [
    {
      id: "clinical_documentation",
      labelEl: "Κλινική τεκμηρίωση",
      weightPct: SCORE_WEIGHTS.clinicalDocumentation,
      score: 86,
      maxScore: 100,
      helper: "Σημειώσεις, αναφορές, στόχοι — όχι ποσότητα συνεδριών",
    },
    {
      id: "reliability",
      labelEl: "Αξιοπιστία λειτουργίας",
      weightPct: SCORE_WEIGHTS.reliability,
      score: 81,
      maxScore: 100,
      helper: "Παρουσία, χρονοδιάγραμμα, ολοκλήρωση υποχρεώσεων",
    },
    {
      id: "collaboration",
      labelEl: "Διεπιστημονική συνεργασία",
      weightPct: SCORE_WEIGHTS.collaboration,
      score: 78,
      maxScore: 100,
      helper: "Συντονισμός ομάδας, συναντήσεις, επικοινωνία γονέων",
    },
    {
      id: "supervision",
      labelEl: "Συμμετοχή εποπτείας",
      weightPct: SCORE_WEIGHTS.supervisionParticipation,
      score: 74,
      maxScore: 100,
      helper: "Τακτική εποπτεία & ενεργή συμμετοχή",
    },
    {
      id: "workflow",
      labelEl: "Ολοκλήρωση ροής εργασίας",
      weightPct: SCORE_WEIGHTS.workflowCompletion,
      score: 83,
      maxScore: 100,
      helper: "Σχέδια δράσης, διοικητική συμμόρφωση",
    },
    {
      id: "quality",
      labelEl: "Συνέπεια ποιότητας",
      weightPct: SCORE_WEIGHTS.qualityConsistency,
      score: 88,
      maxScore: 100,
      helper: "Σταθερότητα KPIs χωρίς απότομες πτώσεις",
    },
  ];
  return dims.map((d) => ({
    ...d,
    riskLevel: scoreToRisk(d.score, d.maxScore),
  }));
}

export function kpiStatusFromPct(pct: number, invert = false): HrTherapistKpi["status"] {
  const v = invert ? 100 - pct : pct;
  if (v >= 90) return "strong";
  if (v >= 75) return "on_track";
  if (v >= 60) return "attention";
  return "critical";
}
