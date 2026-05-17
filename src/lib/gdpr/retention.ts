import type { RetentionPolicy } from "./types";

const STORAGE_KEY = "gdpr-retention-policy-v1";

export const DEFAULT_RETENTION: RetentionPolicy = {
  inactiveChildMonths: 24,
  archivedReportYears: 7,
  communicationLogYears: 5,
  hrRecordYears: 10,
  auditLogYears: 7,
};

export function getRetentionPolicy(): RetentionPolicy {
  if (typeof window === "undefined") return DEFAULT_RETENTION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_RETENTION, ...(JSON.parse(raw) as RetentionPolicy) } : DEFAULT_RETENTION;
  } catch {
    return DEFAULT_RETENTION;
  }
}

export function saveRetentionPolicy(policy: RetentionPolicy): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
}
