"use client";

import type { AuditLogEntry } from "../types";

const STORAGE_KEY = "gdpr-audit-log-v1";
const MAX_ENTRIES = 2000;

export const AUDIT_LOG_UPDATED_EVENT = "gdpr-audit-updated";

function load(): AuditLogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

function persist(entries: AuditLogEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  window.dispatchEvent(new CustomEvent(AUDIT_LOG_UPDATED_EVENT));
}

export function getAuditLogEntries(limit = 500): AuditLogEntry[] {
  return load()
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, limit);
}

export function appendAuditEntry(entry: AuditLogEntry): void {
  const list = load();
  list.unshift(entry);
  persist(list);
}

export function clearAuditLogDemo(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(AUDIT_LOG_UPDATED_EVENT));
}
