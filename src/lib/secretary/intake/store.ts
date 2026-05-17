"use client";

import type { ClientIntake } from "@/lib/secretary/types";
import { SECRETARY_DEMO_INTAKES } from "@/lib/demo/secretary-demo-data";
import type { IntakeFormValues } from "./types";
import { formFromIntake } from "./mapper";

const STORAGE_KEY = "secretary-intakes-v1";
const DRAFT_KEY = "secretary-intake-draft-v1";

function loadStored(): ClientIntake[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ClientIntake[];
  } catch {
    return [];
  }
}

function persist(list: ClientIntake[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getAllIntakes(): ClientIntake[] {
  const stored = loadStored();
  const demoIds = new Set(SECRETARY_DEMO_INTAKES.map((i) => i.id));
  const merged = [
    ...SECRETARY_DEMO_INTAKES,
    ...stored.filter((i) => !demoIds.has(i.id)),
  ];
  return merged.sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export const INTAKE_UPDATED_EVENT = "secretary-intakes-updated";

export function upsertIntake(intake: ClientIntake): ClientIntake {
  const stored = loadStored();
  const idx = stored.findIndex((i) => i.id === intake.id);
  if (idx >= 0) stored[idx] = intake;
  else stored.unshift(intake);
  persist(stored);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(INTAKE_UPDATED_EVENT));
  }
  return intake;
}

export function loadDraft(): IntakeFormValues | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IntakeFormValues;
  } catch {
    return null;
  }
}

export function saveDraft(values: IntakeFormValues) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(values));
}

export function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function countByStatuses(intakes: ClientIntake[], statuses: ClientIntake["leadStatus"][]): number {
  return intakes.filter((i) => statuses.includes(i.leadStatus)).length;
}
