import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  isSupabaseFetchFailure,
  shouldUseClinicalAccessDemoFallback,
  warnClinicalAccessDemoFallback,
} from "@/lib/clinical/access/clinical-access-demo-fallback";
import { filterActiveAssignments, isAssignmentActive } from "./active";
import { disciplineLabelEl } from "./disciplines";
import {
  demoCreateAssignment,
  demoEndAssignment,
  getDemoAssignmentStore,
} from "./demo-store";
import type {
  CreateTherapistAssignmentInput,
  EndTherapistAssignmentInput,
  ListAssignmentsFilters,
  TherapistChildAssignment,
} from "./types";
import { logAssignmentChange } from "./assignment-change-log";

function mapRow(r: Record<string, unknown>): TherapistChildAssignment {
  const disciplineCode = (r.discipline_code as string) ?? null;
  return {
    id: r.id as string,
    organizationId: r.organization_id as string,
    childId: r.child_id as string,
    therapistUserId: r.therapist_user_id as string,
    therapistDisplayName: (r.therapist_display_name as string) ?? null,
    disciplineCode,
    disciplineLabelEl:
      (r.discipline_label_el as string) ?? disciplineLabelEl(disciplineCode),
    assignmentRole: (r.assignment_role as TherapistChildAssignment["assignmentRole"]) ?? "primary_therapist",
    status: (r.status as TherapistChildAssignment["status"]) ?? "active",
    startsAt: r.starts_at as string,
    endsAt: (r.ends_at as string) ?? null,
    assignmentSource:
      (r.assignment_source as TherapistChildAssignment["assignmentSource"]) ?? "manual",
    assignedByUserId: (r.assigned_by_user_id as string) ?? null,
    assignedByDisplayName: (r.assigned_by_display_name as string) ?? null,
    assignmentReason: (r.assignment_reason as string) ?? null,
    endedReason: (r.ended_reason as string) ?? null,
    notes: (r.notes as string) ?? null,
    supervisorUserId: (r.supervisor_user_id as string) ?? null,
    supervisorDisplayName: (r.supervisor_display_name as string) ?? null,
    canViewConfidential: Boolean(r.can_view_confidential),
    createdAt: r.created_at as string,
    updatedAt: r.updated_at as string,
  };
}

async function tryListFromSupabase(
  organizationId: string,
  filters: ListAssignmentsFilters
): Promise<{ items: TherapistChildAssignment[]; fromDb: boolean; failed: boolean }> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("therapist_child_assignments")
      .select(
        "id, organization_id, child_id, therapist_user_id, therapist_display_name, discipline_code, discipline_label_el, assignment_role, status, starts_at, ends_at, assignment_source, assigned_by_user_id, assigned_by_display_name, assignment_reason, ended_reason, notes, supervisor_user_id, supervisor_display_name, can_view_confidential, created_at, updated_at"
      )
      .eq("organization_id", organizationId)
      .is("deleted_at", null);

    if (filters.childId) q = q.eq("child_id", filters.childId);
    if (filters.therapistUserId) q = q.eq("therapist_user_id", filters.therapistUserId);
    if (filters.status && filters.status !== "all" && filters.status !== "active_only") {
      q = q.eq("status", filters.status);
    }

    const { data, error } = await q.order("starts_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        return { items: [], fromDb: false, failed: false };
      }
      if (isSupabaseFetchFailure(error)) {
        return { items: [], fromDb: false, failed: true };
      }
      console.error("listTherapistAssignments supabase", error.message);
      return { items: [], fromDb: false, failed: true };
    }

    let items = (data ?? []).map((r) => mapRow(r as Record<string, unknown>));
    if (filters.status === "active_only") {
      items = filterActiveAssignments(items);
    } else if (!filters.includeEnded) {
      items = items.filter((r) => r.status !== "ended" || isAssignmentActive(r));
    }
    return { items, fromDb: true, failed: false };
  } catch (err) {
    if (isSupabaseFetchFailure(err)) {
      return { items: [], fromDb: false, failed: true };
    }
    throw err;
  }
}

function filterDemoRows(
  organizationId: string,
  filters: ListAssignmentsFilters
): TherapistChildAssignment[] {
  let items = [...getDemoAssignmentStore(organizationId)];
  if (filters.childId) items = items.filter((r) => r.childId === filters.childId);
  if (filters.therapistUserId) {
    items = items.filter((r) => r.therapistUserId === filters.therapistUserId);
  }
  if (filters.status === "active_only") {
    items = filterActiveAssignments(items);
  } else if (filters.status && filters.status !== "all") {
    items = items.filter((r) => r.status === filters.status);
  } else if (!filters.includeEnded) {
    items = items.filter((r) => r.status !== "ended");
  }
  return items.sort((a, b) => b.startsAt.localeCompare(a.startsAt));
}

export async function listTherapistAssignments(params: {
  organizationId: string;
  filters?: ListAssignmentsFilters;
}): Promise<{ items: TherapistChildAssignment[]; error: string | null; source: "database" | "demo" }> {
  const filters = params.filters ?? {};
  const useDemoFallback = await shouldUseClinicalAccessDemoFallback();

  if (useDemoFallback) {
    warnClinicalAccessDemoFallback();
    return {
      items: filterDemoRows(params.organizationId, filters),
      error: null,
      source: "demo",
    };
  }

  const { items: dbItems, fromDb, failed } = await tryListFromSupabase(
    params.organizationId,
    filters
  );

  if (fromDb && dbItems.length > 0) {
    return { items: dbItems, error: null, source: "database" };
  }

  if (fromDb && dbItems.length === 0) {
    return { items: [], error: null, source: "database" };
  }

  if (failed) {
    return { items: [], error: "Αποτυχία φόρτωσης αναθέσεων.", source: "database" };
  }

  return {
    items: filterDemoRows(params.organizationId, filters),
    error: null,
    source: "demo",
  };
}

export async function listActiveAssignmentsForTherapist(params: {
  organizationId: string;
  therapistUserId: string;
}): Promise<TherapistChildAssignment[]> {
  const { items } = await listTherapistAssignments({
    organizationId: params.organizationId,
    filters: { therapistUserId: params.therapistUserId, status: "active_only" },
  });
  return items;
}

export async function listAssignmentsForChild(params: {
  organizationId: string;
  childId: string;
  includeEnded?: boolean;
}): Promise<TherapistChildAssignment[]> {
  const { items } = await listTherapistAssignments({
    organizationId: params.organizationId,
    filters: {
      childId: params.childId,
      includeEnded: params.includeEnded ?? true,
      status: params.includeEnded ? "all" : "active_only",
    },
  });
  return items;
}

export async function listAssignedChildIdsForTherapist(params: {
  organizationId: string;
  therapistUserId: string;
}): Promise<string[]> {
  const rows = await listActiveAssignmentsForTherapist(params);
  const ids = new Set<string>();
  for (const r of rows) {
    if (r.assignmentRole !== "supervisor_oversight") {
      ids.add(r.childId);
    }
  }
  return [...ids];
}

export async function listChildIdsInSupervisorScope(params: {
  organizationId: string;
  supervisorUserId: string;
  superviseeUserIds: string[];
}): Promise<string[]> {
  const { items } = await listTherapistAssignments({
    organizationId: params.organizationId,
    filters: { status: "active_only" },
  });
  const supervisees = new Set(params.superviseeUserIds);
  const ids = new Set<string>();
  for (const r of items) {
    if (r.supervisorUserId === params.supervisorUserId) ids.add(r.childId);
    if (supervisees.has(r.therapistUserId)) ids.add(r.childId);
  }
  return [...ids];
}

export async function getActiveAssignmentForTherapistChild(params: {
  organizationId: string;
  therapistUserId: string;
  childId: string;
}): Promise<TherapistChildAssignment | null> {
  const rows = await listActiveAssignmentsForTherapist({
    organizationId: params.organizationId,
    therapistUserId: params.therapistUserId,
  });
  return rows.find((r) => r.childId === params.childId) ?? null;
}

export async function createTherapistAssignment(
  input: CreateTherapistAssignmentInput,
  actorUserId: string | null
): Promise<{ assignment: TherapistChildAssignment | null; error: string | null }> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const payload = {
    organization_id: input.organizationId,
    child_id: input.childId,
    therapist_user_id: input.therapistUserId,
    therapist_display_name: input.therapistDisplayName ?? null,
    discipline_code: input.disciplineCode ?? null,
    discipline_label_el:
      input.disciplineLabelEl ?? disciplineLabelEl(input.disciplineCode ?? null),
    assignment_role: input.assignmentRole ?? "primary_therapist",
    status: "active",
    starts_at: input.startsAt ?? now,
    ends_at: input.endsAt ?? null,
    assignment_source: input.assignmentSource ?? "manual",
    assigned_by_user_id: input.assignedByUserId ?? actorUserId,
    assigned_by_display_name: input.assignedByDisplayName ?? null,
    assignment_reason: input.assignmentReason ?? null,
    notes: input.notes ?? null,
    supervisor_user_id: input.supervisorUserId ?? null,
    supervisor_display_name: input.supervisorDisplayName ?? null,
    can_view_confidential: input.canViewConfidential ?? false,
  };

  const { data, error } = await supabase
    .from("therapist_child_assignments")
    .insert(payload)
    .select()
    .single();

  if (!error && data) {
    const assignment = mapRow(data as Record<string, unknown>);
    logAssignmentChange({
      organizationId: input.organizationId,
      assignmentId: assignment.id,
      childId: input.childId,
      therapistUserId: input.therapistUserId,
      action: "created",
      actorUserId,
      summary: "Δημιουργία ανάθεσης θεραπευτή",
      metadata: { disciplineCode: input.disciplineCode ?? null },
    });
    return { assignment, error: null };
  }

  const assignment = demoCreateAssignment(input);
  logAssignmentChange({
    organizationId: input.organizationId,
    assignmentId: assignment.id,
    childId: input.childId,
    therapistUserId: input.therapistUserId,
    action: "created",
    actorUserId,
    summary: "Δημιουργία ανάθεσης (πρωτότυπο)",
    metadata: { disciplineCode: input.disciplineCode ?? null },
  });
  return { assignment, error: null };
}

export async function endTherapistAssignment(
  organizationId: string,
  input: EndTherapistAssignmentInput,
  actorUserId: string | null
): Promise<{ assignment: TherapistChildAssignment | null; error: string | null }> {
  const now = input.endsAt ?? new Date().toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapist_child_assignments")
    .update({
      status: "ended",
      ends_at: now,
      ended_reason: input.endedReason ?? "manual_end",
      updated_at: now,
    })
    .eq("id", input.assignmentId)
    .eq("organization_id", organizationId)
    .select()
    .single();

  if (!error && data) {
    const assignment = mapRow(data as Record<string, unknown>);
    logAssignmentChange({
      organizationId,
      assignmentId: assignment.id,
      childId: assignment.childId,
      therapistUserId: assignment.therapistUserId,
      action: "ended",
      actorUserId,
      summary: "Λήξη ανάθεσης",
      metadata: { endedReason: input.endedReason ?? null },
    });
    return { assignment, error: null };
  }

  const assignment = demoEndAssignment(organizationId, input);
  if (assignment) {
    logAssignmentChange({
      organizationId,
      assignmentId: assignment.id,
      childId: assignment.childId,
      therapistUserId: assignment.therapistUserId,
      action: "ended",
      actorUserId,
      summary: "Λήξη ανάθεσης (πρωτότυπο)",
      metadata: { endedReason: input.endedReason ?? null },
    });
  }
  return { assignment, error: assignment ? null : "Η ανάθεση δεν βρέθηκε." };
}
