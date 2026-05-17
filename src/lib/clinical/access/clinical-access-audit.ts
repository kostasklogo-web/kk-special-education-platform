import "server-only";

export type ClinicalAccessResourceType =
  | "child_profile"
  | "session_note"
  | "evaluation"
  | "progress_report"
  | "confidential_addendum"
  | "therapy_goal"
  | "children_list";

export type ClinicalAccessAuditAction = "view" | "list" | "export" | "denied";

export type ClinicalAccessAuditEntry = {
  id: string;
  organizationId: string;
  userId: string | null;
  childId: string | null;
  resourceType: ClinicalAccessResourceType;
  resourceId: string | null;
  action: ClinicalAccessAuditAction;
  denialReason: string | null;
  occurredAt: string;
  metadata: Record<string, string | null>;
};

const auditLog: ClinicalAccessAuditEntry[] = [];

export function logClinicalAccessAttempt(params: {
  organizationId: string;
  userId: string | null;
  childId: string | null;
  resourceType: ClinicalAccessResourceType;
  resourceId?: string | null;
  action: ClinicalAccessAuditAction;
  denialReason?: string | null;
  metadata?: Record<string, string | null>;
}): ClinicalAccessAuditEntry {
  const entry: ClinicalAccessAuditEntry = {
    id: `clin-audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    organizationId: params.organizationId,
    userId: params.userId,
    childId: params.childId,
    resourceType: params.resourceType,
    resourceId: params.resourceId ?? null,
    action: params.action,
    denialReason: params.denialReason ?? null,
    occurredAt: new Date().toISOString(),
    metadata: params.metadata ?? {},
  };
  auditLog.unshift(entry);
  if (auditLog.length > 1000) auditLog.length = 1000;
  return entry;
}

export function listClinicalAccessAudit(params: {
  organizationId: string;
  childId?: string;
  userId?: string;
  limit?: number;
}): ClinicalAccessAuditEntry[] {
  let rows = auditLog.filter((e) => e.organizationId === params.organizationId);
  if (params.childId) rows = rows.filter((e) => e.childId === params.childId);
  if (params.userId) rows = rows.filter((e) => e.userId === params.userId);
  return rows.slice(0, params.limit ?? 100);
}
