import "server-only";

import { buildClinicalTimeline } from "@/lib/clinical/child-profile/timeline";
import { computeClinicalAlerts } from "@/lib/clinical/child-profile/alerts";
import {
  buildAssignedSpecialties,
  buildCollaborationBundle,
  buildEvaluationSummary,
  buildGoalProgressMap,
  buildSupervisionBundle,
} from "@/lib/clinical/child-profile/derive";
import type {
  AssignedTherapistSummary,
  ClinicalChildProfileBundle,
  TreatmentPlanSummary,
} from "@/lib/clinical/child-profile/types";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import {
  getChildWithCenter,
  listParentLinksForChild,
  listTherapyProgramsForChild,
} from "@/lib/data/children/queries";
import { listProgressReportsForOrganization } from "@/lib/data/progress-reports/queries";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import type { SessionListItem } from "@/lib/data/sessions/types";
import { listTherapyGoalsForOrganization } from "@/lib/data/therapy-goals/queries";
import { createClient } from "@/lib/supabase/server";
import { addDaysAthensCalendar, athensStartOfDayUtcIso, todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";

function clinicalDateRange(): { fromIso: string; toIso: string } {
  const today = todayAthensYmd();
  const fromYmd = addDaysAthensCalendar(today, -730);
  const toYmd = addDaysAthensCalendar(today, 90);
  return {
    fromIso: athensStartOfDayUtcIso(fromYmd),
    toIso: athensStartOfDayUtcIso(addDaysAthensCalendar(toYmd, 1)),
  };
}

async function listSessionNotesForChild(params: {
  organizationId: string;
  childId: string;
  sessions: SessionListItem[];
}): Promise<{ items: SessionNoteListItem[]; error: string | null }> {
  if (params.sessions.length === 0) {
    return { items: [], error: null };
  }

  const supabase = await createClient();
  const sessionIds = params.sessions.map((s) => s.id);
  const sessionById = new Map(params.sessions.map((s) => [s.id, s]));

  const { data: notes, error } = await supabase
    .from("session_notes")
    .select(
      "id, organization_id, session_id, author_user_id, status, linked_goal_ids, body, goals_worked, activities, child_response, observations, suggestions_next, visible_to_supervisor, visible_to_parent, finalized_at, created_at, updated_at, deleted_at"
    )
    .in("session_id", sessionIds)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listSessionNotesForChild", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης σημειώσεων." };
  }

  const authorIds = [...new Set((notes ?? []).map((n) => (n as { author_user_id: string }).author_user_id))];
  const profiles = new Map<string, string | null>();
  if (authorIds.length > 0) {
    const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", authorIds);
    for (const p of profs ?? []) {
      const row = p as { id: string; display_name: string | null };
      profiles.set(row.id, row.display_name);
    }
  }

  const items: SessionNoteListItem[] = [];
  for (const raw of notes ?? []) {
    const n = raw as Record<string, unknown>;
    const sessionId = n.session_id as string;
    const s = sessionById.get(sessionId);
    if (!s) continue;
    const linked = n.linked_goal_ids as string[] | null;
    items.push({
      id: n.id as string,
      organization_id: n.organization_id as string,
      session_id: sessionId,
      author_user_id: n.author_user_id as string,
      status: n.status as SessionNoteListItem["status"],
      linked_goal_ids: Array.isArray(linked) ? linked.filter((x) => typeof x === "string") : [],
      body: (n.body as string) ?? "",
      goals_worked: (n.goals_worked as string) ?? "",
      activities: (n.activities as string) ?? "",
      child_response: (n.child_response as string) ?? "",
      observations: (n.observations as string) ?? "",
      suggestions_next: (n.suggestions_next as string) ?? "",
      visible_to_supervisor: Boolean(n.visible_to_supervisor ?? true),
      visible_to_parent: Boolean(n.visible_to_parent ?? false),
      finalized_at: (n.finalized_at as string) ?? null,
      created_at: n.created_at as string,
      updated_at: n.updated_at as string,
      deleted_at: (n.deleted_at as string) ?? null,
      session_starts_at: s.starts_at,
      session_therapist_user_id: s.therapist_user_id,
      child_id: s.child_id,
      child_name: s.child_name,
      therapist_name: s.therapist_name,
      discipline_name_el: s.discipline_name_el,
      discipline_code: s.discipline_code,
      author_display_name: profiles.get(n.author_user_id as string) ?? null,
    });
  }

  return { items, error: null };
}

async function listTreatmentPlansForChild(childId: string): Promise<TreatmentPlanSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatment_plans")
    .select("id, title, status")
    .eq("child_id", childId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listTreatmentPlansForChild", error.message);
    return [];
  }

  return (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    title: (r.title as string) ?? "Πλάνο",
    status: (r.status as string) ?? null,
  }));
}

function buildAssignedTherapists(
  sessions: SessionListItem[],
  goals: { therapist_user_id: string | null; therapist_name: string | null; discipline_code: string; discipline_name_el: string | null }[]
): AssignedTherapistSummary[] {
  const map = new Map<string, AssignedTherapistSummary>();

  for (const s of sessions) {
    const id = s.therapist_user_id;
    const cur = map.get(id) ?? {
      userId: id,
      displayName: s.therapist_name ?? "Θεραπευτής",
      disciplines: [],
      sessionCount: 0,
    };
    cur.sessionCount += 1;
    if (s.discipline_name_el && !cur.disciplines.includes(s.discipline_name_el)) {
      cur.disciplines.push(s.discipline_name_el);
    }
    map.set(id, cur);
  }

  for (const g of goals) {
    if (!g.therapist_user_id) continue;
    const id = g.therapist_user_id;
    const cur = map.get(id) ?? {
      userId: id,
      displayName: g.therapist_name ?? "Θεραπευτής",
      disciplines: [],
      sessionCount: 0,
    };
    if (g.discipline_name_el && !cur.disciplines.includes(g.discipline_name_el)) {
      cur.disciplines.push(g.discipline_name_el);
    }
    map.set(id, cur);
  }

  return [...map.values()].sort((a, b) => b.sessionCount - a.sessionCount);
}

export async function getClinicalChildProfileBundle(childId: string): Promise<{
  bundle: ClinicalChildProfileBundle | null;
  error: string | null;
}> {
  const { organizationId } = await getDefaultOrganizationIdForUser();
  const org = organizationId ?? "";
  if (!org) {
    return { bundle: null, error: "Δεν βρέθηκε οργανισμός." };
  }

  const { item: child, error: childErr } = await getChildWithCenter(childId);
  if (childErr || !child) {
    return { bundle: null, error: childErr ?? "Το παιδί δεν βρέθηκε." };
  }

  const { fromIso, toIso } = clinicalDateRange();

  const [
    { links, error: linkErr },
    { programs, error: progErr },
    { items: goals, error: goalsErr },
    { items: sessions, error: sessErr },
    { items: reports, error: repErr },
  ] = await Promise.all([
    listParentLinksForChild(childId),
    listTherapyProgramsForChild(childId),
    listTherapyGoalsForOrganization({ organizationId: org, filters: { childId } }),
    listSessionsInRange({ organizationId: org, fromIso, toIso, filters: { childId } }),
    listProgressReportsForOrganization({ organizationId: org, filters: { childId } }),
  ]);

  const loadError =
    linkErr ?? progErr ?? goalsErr ?? sessErr ?? repErr ?? null;
  if (loadError) {
    return { bundle: null, error: loadError };
  }

  const { items: sessionNotes, error: notesErr } = await listSessionNotesForChild({
    organizationId: org,
    childId,
    sessions,
  });
  if (notesErr) {
    return { bundle: null, error: notesErr };
  }

  const treatmentPlans = await listTreatmentPlansForChild(childId);
  const assignedTherapists = buildAssignedTherapists(sessions, goals);
  const assignedSpecialties = buildAssignedSpecialties(sessions, goals);
  const goalProgress = buildGoalProgressMap(goals, sessionNotes);
  const evaluationSummary = buildEvaluationSummary(sessions, reports);
  const collaboration = buildCollaborationBundle(sessionNotes, sessions);
  const supervision = buildSupervisionBundle(sessions, sessionNotes, child.notes);
  const timeline = buildClinicalTimeline({ childId, sessions, sessionNotes, goals, reports });
  const alerts = computeClinicalAlerts({ childId, goals, sessions, sessionNotes, reports });

  const activeGoals = goals.filter((g) => ["active", "in_progress", "on_hold"].includes(g.status));
  const completedGoals = goals.filter((g) => g.status === "met");
  const evaluations = sessions.filter((s) => s.session_kind === "assessment");

  return {
    bundle: {
      child,
      parentLinks: links,
      programs,
      treatmentPlans,
      assignedTherapists,
      assignedSpecialties,
      goals,
      goalProgress,
      sessions,
      sessionNotes,
      progressReports: reports,
      evaluationSummary,
      collaboration,
      timeline,
      alerts,
      interdisciplinary: collaboration.crossDisciplineObservations,
      supervision,
      counts: {
        activeGoals: activeGoals.length,
        completedGoals: completedGoals.length,
        sessions: sessions.length,
        sessionNotes: sessionNotes.length,
        reports: reports.length,
        evaluations: evaluations.length,
      },
    },
    error: null,
  };
}
