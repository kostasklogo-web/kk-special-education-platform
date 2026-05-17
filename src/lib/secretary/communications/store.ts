"use client";

import { SECRETARY_DEMO_COMMUNICATIONS } from "@/lib/demo/secretary-demo-data";
import type { CommunicationLog } from "@/lib/secretary/types";
import { enrichCommunication } from "./calculations";
import { normalizeCommunicationLog } from "./normalize";

const STORAGE_KEY = "secretary-communications-v1";

export const COMMUNICATIONS_UPDATED_EVENT = "secretary-communications-updated";

function loadStored(): CommunicationLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<CommunicationLog>[];
    const today = new Date().toISOString().slice(0, 10);
    return parsed.map((p) =>
      normalizeCommunicationLog(
        p as Partial<CommunicationLog> & Pick<CommunicationLog, "id" | "contactPerson" | "summary">,
        today
      )
    );
  } catch {
    return [];
  }
}

function persist(list: CommunicationLog[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(COMMUNICATIONS_UPDATED_EVENT));
}

export function getAllCommunications(todayYmd: string): CommunicationLog[] {
  const stored = loadStored();
  const demoIds = new Set(SECRETARY_DEMO_COMMUNICATIONS.map((c) => c.id));
  const byId = new Map<string, CommunicationLog>();

  for (const demo of SECRETARY_DEMO_COMMUNICATIONS) {
    const override = stored.find((s) => s.id === demo.id);
    const base = override ?? demo;
    byId.set(demo.id, enrichCommunication(normalizeCommunicationLog(base, todayYmd), todayYmd));
  }
  for (const s of stored) {
    if (!demoIds.has(s.id)) {
      byId.set(s.id, enrichCommunication(s, todayYmd));
    }
  }

  return [...byId.values()].sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)
  );
}

export function upsertCommunication(log: CommunicationLog, todayYmd: string): CommunicationLog {
  const enriched = enrichCommunication(log, todayYmd);
  const stored = loadStored();
  const idx = stored.findIndex((c) => c.id === enriched.id);
  if (idx >= 0) stored[idx] = enriched;
  else stored.unshift(enriched);
  persist(stored);
  return enriched;
}

/** When a linked follow-up task is completed, mark the communication log entry completed. */
export function syncCommunicationOnTaskComplete(
  taskId: string,
  outcome: string | null,
  todayYmd: string
): void {
  const stored = loadStored();
  const idx = stored.findIndex((c) => c.linkedTaskId === taskId);
  if (idx < 0) return;
  const comm = stored[idx];
  if (comm.status === "completed" || comm.status === "cancelled") return;
  stored[idx] = enrichCommunication(
    {
      ...comm,
      status: "completed",
      outcome: outcome?.trim() || comm.outcome,
      nextActionRequired: false,
    },
    todayYmd
  );
  persist(stored);
}

export function createCommunicationDraft(
  partial: Partial<CommunicationLog> & Pick<CommunicationLog, "contactPerson" | "summary">,
  todayYmd: string
): CommunicationLog {
  const now = new Date().toISOString();
  const draft = normalizeCommunicationLog(
    {
      id: partial.id ?? `comm-${Date.now()}`,
      ...partial,
      occurredAt: partial.occurredAt ?? now,
      createdAt: partial.createdAt ?? now,
    },
    todayYmd
  );
  return upsertCommunication(draft, todayYmd);
}
