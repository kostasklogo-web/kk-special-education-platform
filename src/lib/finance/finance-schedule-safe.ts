/**
 * Safe entry point for finance ↔ schedule read model (client + server).
 */

import {
  buildFinanceScheduleReadModel,
  type FinanceScheduleAggregates,
} from "./finance-schedule-read-model";
import { buildFallbackFinanceScheduleReadModel } from "./finance-schedule-fallback";
import type { FinanceScheduleReadModel } from "./types";

export type SafeFinanceScheduleResult = FinanceScheduleReadModel & {
  aggregates: FinanceScheduleAggregates;
  usedFallback: boolean;
  fallbackReason?: string;
};

export function safeBuildFinanceScheduleReadModel(
  monthYmdInput?: string
): SafeFinanceScheduleResult {
  try {
    const model = buildFinanceScheduleReadModel(monthYmdInput);
    if (!model.charges.length || !Number.isFinite(model.metrics.calculatedRevenue)) {
      throw new Error("Άδειο ή μη έγκυρο αποτέλεσμα read model.");
    }
    return { ...model, usedFallback: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    if (typeof console !== "undefined") {
      console.warn("[finance-schedule] fallback:", message);
    }
    return {
      ...buildFallbackFinanceScheduleReadModel(),
      usedFallback: true,
      fallbackReason: message,
    };
  }
}
