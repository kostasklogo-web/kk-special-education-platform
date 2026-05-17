import "server-only";

import { getDemoOrganizationId } from "@/lib/config/demo";
import { buildDemoTherapistAssignmentsSeed } from "@/lib/demo/therapist-assignments-demo";
import { disciplineLabelEl } from "./disciplines";
import type {
  CreateTherapistAssignmentInput,
  EndTherapistAssignmentInput,
  TherapistChildAssignment,
} from "./types";

/** In-memory assignment store (prototype until Supabase table is live). */
const storeByOrg = new Map<string, TherapistChildAssignment[]>();

function cloneSeed(orgId: string): TherapistChildAssignment[] {
  return buildDemoTherapistAssignmentsSeed(orgId).map((row) => ({ ...row }));
}

export function getDemoAssignmentStore(orgId: string): TherapistChildAssignment[] {
  let rows = storeByOrg.get(orgId);
  if (!rows) {
    rows = cloneSeed(orgId);
    storeByOrg.set(orgId, rows);
  }
  return rows;
}

export function resetDemoAssignmentStoreForTests(orgId?: string): void {
  const id = orgId ?? getDemoOrganizationId();
  storeByOrg.set(id, cloneSeed(id));
}

export function demoCreateAssignment(
  input: CreateTherapistAssignmentInput
): TherapistChildAssignment {
  const rows = getDemoAssignmentStore(input.organizationId);
  const now = new Date().toISOString();
  const row: TherapistChildAssignment = {
    id: `asg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    organizationId: input.organizationId,
    childId: input.childId,
    therapistUserId: input.therapistUserId,
    therapistDisplayName: input.therapistDisplayName ?? null,
    disciplineCode: input.disciplineCode ?? null,
    disciplineLabelEl:
      input.disciplineLabelEl ?? disciplineLabelEl(input.disciplineCode ?? null),
    assignmentRole: input.assignmentRole ?? "primary_therapist",
    status: "active",
    startsAt: input.startsAt ?? now,
    endsAt: input.endsAt ?? null,
    assignmentSource: input.assignmentSource ?? "manual",
    assignedByUserId: input.assignedByUserId ?? null,
    assignedByDisplayName: input.assignedByDisplayName ?? null,
    assignmentReason: input.assignmentReason ?? null,
    endedReason: null,
    notes: input.notes ?? null,
    supervisorUserId: input.supervisorUserId ?? null,
    supervisorDisplayName: input.supervisorDisplayName ?? null,
    canViewConfidential: input.canViewConfidential ?? false,
    createdAt: now,
    updatedAt: now,
  };
  rows.push(row);
  return row;
}

export function demoEndAssignment(
  organizationId: string,
  input: EndTherapistAssignmentInput
): TherapistChildAssignment | null {
  const rows = getDemoAssignmentStore(organizationId);
  const row = rows.find((r) => r.id === input.assignmentId);
  if (!row) return null;
  const now = input.endsAt ?? new Date().toISOString();
  row.status = "ended";
  row.endsAt = now;
  row.endedReason = input.endedReason ?? "manual_end";
  row.updatedAt = now;
  return row;
}
