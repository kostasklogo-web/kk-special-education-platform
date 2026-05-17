"use client";

import { SECRETARY_DEMO_REPORTS } from "@/lib/demo/secretary-demo-data";
import type { ReportRequest } from "@/lib/secretary/types";
import { autoLogReportReceived } from "@/lib/secretary/communications/auto-log";
import { enrichReport } from "./calculations";
import { normalizeReportRequest } from "./normalize";
import { syncAutoTasksFromReport } from "./sync-auto-tasks";

const STORAGE_KEY = "secretary-reports-v1";

export const REPORTS_UPDATED_EVENT = "secretary-reports-updated";

function loadStored(): ReportRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<ReportRequest>[];
    const today = new Date().toISOString().slice(0, 10);
    return parsed.map((p) =>
      normalizeReportRequest(
        p as Partial<ReportRequest> & Pick<ReportRequest, "id" | "childId" | "childLabel">,
        today
      )
    );
  } catch {
    return [];
  }
}

function persist(list: ReportRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT));
}

export function getAllReports(todayYmd: string): ReportRequest[] {
  const stored = loadStored();
  const demoIds = new Set(SECRETARY_DEMO_REPORTS.map((r) => r.id));
  const byId = new Map<string, ReportRequest>();

  for (const demo of SECRETARY_DEMO_REPORTS) {
    const override = stored.find((s) => s.id === demo.id);
    const base = normalizeReportRequest(
      (override ?? demo) as Partial<ReportRequest> & Pick<ReportRequest, "id" | "childId" | "childLabel">,
      todayYmd
    );
    byId.set(demo.id, enrichReport(base, todayYmd));
  }
  for (const s of stored) {
    if (!demoIds.has(s.id)) {
      byId.set(s.id, enrichReport(s, todayYmd));
    }
  }

  return [...byId.values()].sort((a, b) => {
    const da = a.dueDate ?? "9999-99-99";
    const db = b.dueDate ?? "9999-99-99";
    if (da !== db) return da.localeCompare(db);
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export function upsertReport(report: ReportRequest, todayYmd: string): ReportRequest {
  const enriched = enrichReport(report, todayYmd);
  const stored = loadStored();
  const idx = stored.findIndex((r) => r.id === enriched.id);
  if (idx >= 0) stored[idx] = enriched;
  else stored.unshift(enriched);
  persist(stored);
  syncAutoTasksFromReport(enriched, todayYmd);
  return enriched;
}

export function createReportDraft(
  partial: Partial<ReportRequest> & Pick<ReportRequest, "childId" | "childLabel" | "reportTypeCode">,
  todayYmd: string
): ReportRequest {
  const now = new Date().toISOString();
  const draft = normalizeReportRequest(
    {
      id: partial.id ?? `rep-${Date.now()}`,
      ...partial,
      createdAt: partial.createdAt ?? now,
      updatedAt: partial.updatedAt ?? now,
    },
    todayYmd
  );
  const saved = upsertReport(draft, todayYmd);
  if (["parent", "school", "doctor"].includes(saved.requestSource)) {
    autoLogReportReceived(saved, todayYmd);
  }
  return saved;
}

export function addReportFileVersion(
  report: ReportRequest,
  kind: "draft" | "final",
  fileName: string,
  uploadedByLabel: string,
  todayYmd: string
): ReportRequest {
  const version = {
    id: `rfv-${Date.now()}`,
    kind,
    fileName,
    uploadedAt: new Date().toISOString(),
    uploadedByLabel,
  };
  const next: ReportRequest = {
    ...report,
    fileVersions: [...report.fileVersions, version],
    finalFileName: kind === "final" ? fileName : report.finalFileName,
    updatedAt: new Date().toISOString(),
    updatedByLabel: uploadedByLabel,
  };
  return upsertReport(next, todayYmd);
}
