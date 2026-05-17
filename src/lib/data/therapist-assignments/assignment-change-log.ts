import "server-only";

export type AssignmentChangeAction =
  | "created"
  | "ended"
  | "suspended"
  | "resumed"
  | "updated";

export type AssignmentChangeLogEntry = {
  id: string;
  organizationId: string;
  assignmentId: string;
  childId: string;
  therapistUserId: string;
  action: AssignmentChangeAction;
  actorUserId: string | null;
  summary: string;
  occurredAt: string;
  metadata: Record<string, string | null>;
};

const log: AssignmentChangeLogEntry[] = [];

export function logAssignmentChange(
  entry: Omit<AssignmentChangeLogEntry, "id" | "occurredAt">
): AssignmentChangeLogEntry {
  const full: AssignmentChangeLogEntry = {
    ...entry,
    id: `asglog-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    occurredAt: new Date().toISOString(),
  };
  log.unshift(full);
  if (log.length > 500) log.length = 500;
  return full;
}

export function listAssignmentChangeLog(params: {
  organizationId: string;
  childId?: string;
  limit?: number;
}): AssignmentChangeLogEntry[] {
  let rows = log.filter((e) => e.organizationId === params.organizationId);
  if (params.childId) rows = rows.filter((e) => e.childId === params.childId);
  return rows.slice(0, params.limit ?? 50);
}
