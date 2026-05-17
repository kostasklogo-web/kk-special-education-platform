import type { AuditLogEntry, GdprAction, GdprModule } from "../types";
import { appendAuditEntry } from "./store";

export type AuditLogParams = {
  organizationId: string;
  userId: string;
  userLabel: string;
  action: AuditLogEntry["action"];
  module: GdprModule;
  summary: string;
  entityType?: string | null;
  entityId?: string | null;
  childId?: string | null;
  childLabel?: string | null;
  staffId?: string | null;
  staffLabel?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
};

function clientMeta(): Pick<AuditLogEntry, "ipAddress" | "userAgent"> {
  if (typeof window === "undefined") {
    return { ipAddress: null, userAgent: null };
  }
  return {
    ipAddress: null,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 200) : null,
  };
}

export function logGdprAudit(params: AuditLogParams): AuditLogEntry {
  const entry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    organizationId: params.organizationId,
    userId: params.userId,
    userLabel: params.userLabel,
    action: params.action,
    module: params.module,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    childId: params.childId ?? null,
    childLabel: params.childLabel ?? null,
    staffId: params.staffId ?? null,
    staffLabel: params.staffLabel ?? null,
    summary: params.summary,
    metadata: params.metadata ?? {},
    occurredAt: new Date().toISOString(),
    ...clientMeta(),
  };

  if (typeof window !== "undefined") {
    appendAuditEntry(entry);
  }

  return entry;
}

export function logGdprView(
  params: Omit<AuditLogParams, "action"> & { action?: "view" | "view_list" }
): AuditLogEntry {
  return logGdprAudit({ ...params, action: params.action ?? "view" });
}

export function logGdprExport(params: Omit<AuditLogParams, "action">): AuditLogEntry {
  return logGdprAudit({ ...params, action: "export" });
}

export function logGdprEdit(params: Omit<AuditLogParams, "action">): AuditLogEntry {
  return logGdprAudit({ ...params, action: "edit" });
}

export function logGdprArchive(params: Omit<AuditLogParams, "action">): AuditLogEntry {
  return logGdprAudit({ ...params, action: "archive" });
}

export function auditActionLabel(action: GdprAction | AuditLogEntry["action"]): string {
  const labels: Record<string, string> = {
    view: "Προβολή",
    view_list: "Προβολή λίστας",
    edit: "Επεξεργασία",
    delete: "Διαγραφή",
    archive: "Αρχειοθέτηση",
    export: "Εξαγωγή",
    download: "Λήψη",
    upload: "Μεταφόρτωση",
    approve: "Έγκριση",
    send_reminder: "Αποστολή υπενθύμισης",
    share_parent: "Κοινοποίηση γονέα",
    login: "Σύνδεση",
    logout: "Αποσύνδεση",
  };
  return labels[action] ?? String(action);
}
