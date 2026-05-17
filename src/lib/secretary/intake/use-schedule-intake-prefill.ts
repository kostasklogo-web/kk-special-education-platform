"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { SecretaryScheduleTypeCode } from "@/lib/secretary/schedule-catalog";
import {
  findIntakeForSchedule,
  prefillFromIntake,
  type IntakeSchedulePrefill,
} from "./schedule-prefill";

const SCHEDULE_TYPE_CODES = new Set([
  "parent_info",
  "history_taking",
  "evaluation",
  "reevaluation",
  "initial_inquiry",
]);

function parseTypeCode(raw: string | null): SecretaryScheduleTypeCode {
  if (raw && SCHEDULE_TYPE_CODES.has(raw)) return raw as SecretaryScheduleTypeCode;
  return "evaluation";
}

/** Resolves intake prefill from `?action=new&intake=…&type=…` once intakes are available client-side. */
export function useScheduleIntakePrefill() {
  const searchParams = useSearchParams();
  const [prefill, setPrefill] = useState<IntakeSchedulePrefill | null>(null);

  const intakeId = searchParams.get("intake");
  const actionNew = searchParams.get("action") === "new";
  const typeCode = parseTypeCode(searchParams.get("type"));

  useEffect(() => {
    if (!actionNew || !intakeId) {
      setPrefill(null);
      return;
    }
    const intake = findIntakeForSchedule(intakeId);
    if (!intake) {
      setPrefill(null);
      return;
    }
    setPrefill(prefillFromIntake(intake, typeCode));
  }, [actionNew, intakeId, typeCode]);

  return {
    prefill,
    shouldOpenNewModal: actionNew && !!intakeId,
    typeCode,
    intakeId,
    clearPrefill: () => setPrefill(null),
  };
}
