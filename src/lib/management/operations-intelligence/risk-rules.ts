/**
 * Rule-based operational risk detection (workflow analytics — not ML/AI).
 */

import type { OpsRiskLevel, OpsTrend } from "./types";

export function riskFromThreshold(
  value: number,
  opts: { medium: number; high: number; critical?: number; higherIsWorse?: boolean }
): OpsRiskLevel {
  const { medium, high, critical, higherIsWorse = true } = opts;
  if (higherIsWorse) {
    if (critical !== undefined && value >= critical) return "critical";
    if (value >= high) return "high";
    if (value >= medium) return "medium";
    return "low";
  }
  if (critical !== undefined && value <= critical) return "critical";
  if (value <= high) return "high";
  if (value <= medium) return "medium";
  return "low";
}

export function scoreToRisk(score: number, max = 100): OpsRiskLevel {
  const pct = max > 0 ? (score / max) * 100 : 0;
  return riskFromThreshold(100 - pct, { medium: 15, high: 30, critical: 45, higherIsWorse: true });
}

export function trendFromDelta(deltaPct: number): OpsTrend {
  if (deltaPct > 1) return "up";
  if (deltaPct < -1) return "down";
  return "flat";
}

export function urgencyRank(level: OpsRiskLevel, base = 50): number {
  const boost = { low: 0, medium: 20, high: 40, critical: 60 }[level];
  return base + boost;
}

export function combineRisk(...levels: OpsRiskLevel[]): OpsRiskLevel {
  const order: OpsRiskLevel[] = ["low", "medium", "high", "critical"];
  return levels.reduce(
    (max, l) => (order.indexOf(l) > order.indexOf(max) ? l : max),
    "low" as OpsRiskLevel
  );
}
