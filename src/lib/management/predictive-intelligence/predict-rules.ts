/**
 * Rule-based predictive scoring (weighted factors → risk level).
 * Simulates forecasts without ML models.
 */

import type { PredictedRiskFactor, PredictiveRiskLevel } from "./types";

export function scoreFromFactors(factors: PredictedRiskFactor[]): number {
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0) || 1;
  const presentWeight = factors.filter((f) => f.present).reduce((s, f) => s + f.weight, 0);
  return Math.round((presentWeight / totalWeight) * 100);
}

export function riskFromScore(score: number): PredictiveRiskLevel {
  if (score >= 75) return "critical";
  if (score >= 55) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function confidenceFromFactorCount(factors: PredictedRiskFactor[], dataPoints: number): number {
  const present = factors.filter((f) => f.present).length;
  const base = 55 + present * 6 + Math.min(15, dataPoints);
  return Math.min(92, base);
}

export function combineRisk(...levels: PredictiveRiskLevel[]): PredictiveRiskLevel {
  const order: PredictiveRiskLevel[] = ["low", "medium", "high", "critical"];
  return levels.reduce((max, l) => (order.indexOf(l) > order.indexOf(max) ? l : max), "low");
}

export function trendFromScoreDelta(delta: number): "worsening" | "stable" | "improving" {
  if (delta > 5) return "worsening";
  if (delta < -5) return "improving";
  return "stable";
}
