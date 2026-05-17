"use client";

import { SECRETARY_DEMO_DIAGNOSES } from "@/lib/demo/secretary-demo-data";
import type { DiagnosisDocument } from "@/lib/secretary/types";
import { enrichDiagnosis } from "./calculations";
import { normalizeDiagnosisDocument } from "./normalize";
import { syncAutoTasksFromDiagnosis } from "./sync-auto-tasks";

const STORAGE_KEY = "secretary-diagnoses-v1";

export const DIAGNOSES_UPDATED_EVENT = "secretary-diagnoses-updated";

function loadStored(): DiagnosisDocument[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<DiagnosisDocument>[];
    const today = new Date().toISOString().slice(0, 10);
    return parsed.map((p) =>
      normalizeDiagnosisDocument(
        p as Partial<DiagnosisDocument> & Pick<DiagnosisDocument, "id" | "childId" | "childLabel" | "expiryDate">,
        today
      )
    );
  } catch {
    return [];
  }
}

function persist(list: DiagnosisDocument[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(DIAGNOSES_UPDATED_EVENT));
}

export function getAllDiagnoses(todayYmd: string): DiagnosisDocument[] {
  const stored = loadStored();
  const demoIds = new Set(SECRETARY_DEMO_DIAGNOSES.map((d) => d.id));
  const byId = new Map<string, DiagnosisDocument>();

  for (const demo of SECRETARY_DEMO_DIAGNOSES) {
    const override = stored.find((s) => s.id === demo.id);
    const base = override ?? demo;
    byId.set(demo.id, enrichDiagnosis(normalizeDiagnosisDocument(base, todayYmd), todayYmd));
  }
  for (const s of stored) {
    if (!demoIds.has(s.id)) {
      byId.set(s.id, enrichDiagnosis(s, todayYmd));
    }
  }

  return [...byId.values()].sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
}

export function upsertDiagnosis(doc: DiagnosisDocument, todayYmd: string): DiagnosisDocument {
  const enriched = enrichDiagnosis(doc, todayYmd);
  const stored = loadStored();
  const idx = stored.findIndex((d) => d.id === enriched.id);
  if (idx >= 0) stored[idx] = enriched;
  else stored.unshift(enriched);
  persist(stored);
  syncAutoTasksFromDiagnosis(enriched, todayYmd);
  return enriched;
}

export function createDiagnosisDraft(
  partial: Partial<DiagnosisDocument> &
    Pick<DiagnosisDocument, "childId" | "childLabel" | "expiryDate" | "documentTypeCode">,
  todayYmd: string
): DiagnosisDocument {
  const now = new Date().toISOString();
  const draft = normalizeDiagnosisDocument(
    {
      id: partial.id ?? `diag-${Date.now()}`,
      ...partial,
      createdAt: partial.createdAt ?? now,
      updatedAt: partial.updatedAt ?? now,
    },
    todayYmd
  );
  return upsertDiagnosis(draft, todayYmd);
}
