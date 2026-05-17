"use client";

import { SECRETARY_DEMO_MEETINGS } from "@/lib/demo/secretary-demo-data";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import { enrichMeeting } from "./calculations";
import { migrateLegacyMeeting, normalizeMeeting } from "./normalize";
import { syncAutoTasksFromMeeting } from "./sync-auto-tasks";
import { syncDecisionLinkedTask } from "./meeting-governance";
import { applyDemoGovernanceSeed } from "./demo-governance-seed";

const STORAGE_KEY = "secretary-meetings-v1";

export const MEETINGS_UPDATED_EVENT = "secretary-meetings-updated";

function loadStored(): SecretaryMeeting[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<SecretaryMeeting>[];
    const today = new Date().toISOString().slice(0, 10);
    return parsed.map((p) => normalizeMeeting(p as Partial<SecretaryMeeting> & Pick<SecretaryMeeting, "id">, today));
  } catch {
    return [];
  }
}

function persist(list: SecretaryMeeting[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(MEETINGS_UPDATED_EVENT));
}

export function getAllMeetings(todayYmd: string): SecretaryMeeting[] {
  const stored = loadStored();
  const demoIds = new Set(SECRETARY_DEMO_MEETINGS.map((m) => m.id));
  const byId = new Map<string, SecretaryMeeting>();

  for (const demo of SECRETARY_DEMO_MEETINGS) {
    const override = stored.find((s) => s.id === demo.id);
    const base = override
      ? normalizeMeeting(override, todayYmd)
      : migrateLegacyMeeting(demo, todayYmd);
    let seeded = applyDemoGovernanceSeed(base, Boolean(override));
    let enriched = enrichMeeting(seeded, todayYmd);
    if (!override) {
      for (const d of enriched.decisions) {
        enriched = syncDecisionLinkedTask(enriched, d, todayYmd);
      }
    }
    byId.set(demo.id, enriched);
  }
  for (const s of stored) {
    if (!demoIds.has(s.id)) {
      byId.set(s.id, enrichMeeting(s, todayYmd));
    }
  }

  return [...byId.values()].sort((a, b) => {
    const da = `${a.meetingDate}T${a.startTime}`;
    const db = `${b.meetingDate}T${b.startTime}`;
    return da.localeCompare(db);
  });
}

export function upsertMeeting(meeting: SecretaryMeeting, todayYmd: string): SecretaryMeeting {
  let linked = meeting;
  for (const d of linked.decisions) {
    linked = syncDecisionLinkedTask(linked, d, todayYmd);
  }
  const enriched = enrichMeeting(linked, todayYmd);
  const stored = loadStored();
  const idx = stored.findIndex((m) => m.id === enriched.id);
  if (idx >= 0) stored[idx] = enriched;
  else stored.unshift(enriched);
  persist(stored);
  syncAutoTasksFromMeeting(enriched, todayYmd);
  return enriched;
}

export function createMeetingDraft(
  partial: Partial<SecretaryMeeting> & Pick<SecretaryMeeting, "title" | "meetingTypeCode">,
  todayYmd: string
): SecretaryMeeting {
  const now = new Date().toISOString();
  const id = partial.id ?? `meet-${Date.now()}`;
  return normalizeMeeting(
    {
      ...partial,
      id,
      organizationId: partial.organizationId ?? "",
      createdAt: now,
      updatedAt: now,
      createdByLabel: partial.createdByLabel ?? "Γραμματεία",
      updatedByLabel: partial.updatedByLabel ?? "Γραμματεία",
    },
    todayYmd
  );
}
