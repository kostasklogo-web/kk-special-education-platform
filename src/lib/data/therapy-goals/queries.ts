import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  TherapyGoalFilters,
  TherapyGoalListItem,
  TherapyGoalRow,
  TreatmentPlanOption,
} from "@/lib/data/therapy-goals/types";

function normalizeStatus(s: string | undefined): TherapyGoalRow["status"] {
  if (s === "discontinued") return "cancelled";
  if (s === "active" || s === "in_progress" || s === "met" || s === "on_hold" || s === "cancelled") {
    return s;
  }
  return "active";
}

function mapGoalRow(r: Record<string, unknown>): TherapyGoalRow {
  return {
    id: r.id as string,
    organization_id: r.organization_id as string,
    child_id: r.child_id as string,
    treatment_plan_id: (r.treatment_plan_id as string) ?? null,
    discipline_code: r.discipline_code as string,
    therapist_user_id: (r.therapist_user_id as string) ?? null,
    title: r.title as string,
    description: (r.description as string) ?? null,
    success_criterion: (r.success_criterion as string) ?? "",
    start_date: (r.start_date as string) ?? null,
    target_completion_date: (r.target_completion_date as string) ?? null,
    status: normalizeStatus(r.status as string | undefined),
    priority: ((r.priority as TherapyGoalRow["priority"]) ?? "medium") as TherapyGoalRow["priority"],
    observations: (r.observations as string) ?? "",
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted_at: (r.deleted_at as string) ?? null,
  };
}

export async function listTherapyGoalsForOrganization(params: {
  organizationId: string;
  filters?: TherapyGoalFilters;
}): Promise<{ items: TherapyGoalListItem[]; error: string | null }> {
  const supabase = await createClient();
  let q = supabase
    .from("therapy_goals")
    .select(
      "id, organization_id, child_id, treatment_plan_id, discipline_code, therapist_user_id, title, description, success_criterion, start_date, target_completion_date, status, priority, observations, created_at, updated_at, deleted_at"
    )
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  const f = params.filters;
  if (f?.childId) q = q.eq("child_id", f.childId);
  if (f?.therapistId) q = q.eq("therapist_user_id", f.therapistId);
  if (f?.disciplineCode) q = q.eq("discipline_code", f.disciplineCode);
  if (f?.status) q = q.eq("status", f.status);
  if (f?.priority) q = q.eq("priority", f.priority);

  const { data, error } = await q;

  if (error) {
    console.error("listTherapyGoalsForOrganization", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης στόχων." };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  if (rows.length === 0) return { items: [], error: null };

  const childIds = [...new Set(rows.map((r) => r.child_id as string))];
  const planIds = [...new Set(rows.map((r) => r.treatment_plan_id as string | null).filter(Boolean))] as string[];
  const therapistIds = [...new Set(rows.map((r) => r.therapist_user_id as string | null).filter(Boolean))] as string[];
  const discCodes = [...new Set(rows.map((r) => r.discipline_code as string))];

  const [ch, pl, pr, di] = await Promise.all([
    supabase.from("children").select("id, first_name, last_name").in("id", childIds),
    planIds.length
      ? supabase.from("treatment_plans").select("id, title").in("id", planIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[], error: null }),
    therapistIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", therapistIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string | null }[], error: null }),
    supabase.from("therapy_disciplines").select("code, name_el").in("code", discCodes),
  ]);

  const children = new Map<string, string>(
    (ch.data ?? []).map((c: { id: string; first_name: string; last_name: string }) => [
      c.id,
      `${c.last_name} ${c.first_name}`.trim(),
    ])
  );
  const plans = new Map<string, string>(
    ((pl as { data?: { id: string; title: string }[] }).data ?? []).map((p) => [p.id, p.title])
  );
  const profiles = new Map<string, string | null>(
    ((pr as { data?: { id: string; display_name: string | null }[] }).data ?? []).map((p) => [
      p.id,
      p.display_name,
    ])
  );
  const disciplines = new Map<string, string>(
    (di.data ?? []).map((d: { code: string; name_el: string }) => [d.code, d.name_el])
  );

  const items: TherapyGoalListItem[] = rows.map((raw) => {
    const g = mapGoalRow(raw);
    return {
      ...g,
      child_name: children.get(g.child_id) ?? "—",
      plan_title: g.treatment_plan_id ? plans.get(g.treatment_plan_id) ?? null : null,
      discipline_name_el: disciplines.get(g.discipline_code) ?? null,
      therapist_name: g.therapist_user_id ? profiles.get(g.therapist_user_id) ?? null : null,
    };
  });

  return { items, error: null };
}

export async function getTherapyGoalById(id: string): Promise<{
  goal: TherapyGoalRow | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapy_goals")
    .select(
      "id, organization_id, child_id, treatment_plan_id, discipline_code, therapist_user_id, title, description, success_criterion, start_date, target_completion_date, status, priority, observations, created_at, updated_at, deleted_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getTherapyGoalById", error.message);
    return { goal: null, error: "Αποτυχία φόρτωσης στόχου." };
  }
  if (!data) return { goal: null, error: null };
  return { goal: mapGoalRow(data as Record<string, unknown>), error: null };
}

export async function listTreatmentPlansForOrganization(
  organizationId: string
): Promise<{ plans: TreatmentPlanOption[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("treatment_plans")
    .select("id, title, child_id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listTreatmentPlansForOrganization", error.message);
    return { plans: [], error: "Αποτυχία φόρτωσης πλάνων." };
  }

  return {
    plans: (data as TreatmentPlanOption[]) ?? [],
    error: null,
  };
}

/** Στόχοι για σύνδεση με σημείωση συνεδρίας (ίδιο παιδί, ενεργοί / σε εξέλιξη). */
export async function listLinkableTherapyGoalsForChild(childId: string): Promise<{
  goals: { id: string; title: string }[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapy_goals")
    .select("id, title")
    .eq("child_id", childId)
    .is("deleted_at", null)
    .in("status", ["active", "in_progress"])
    .order("title", { ascending: true });

  if (error) {
    console.error("listLinkableTherapyGoalsForChild", error.message);
    return { goals: [], error: "Αποτυχία φόρτωσης στόχων για σύνδεση." };
  }

  return { goals: (data as { id: string; title: string }[]) ?? [], error: null };
}

/** Όλοι οι μη διαγραμμένοι στόχοι παιδιού για επιλογή σε σημείωση (MVP). */
export async function listTherapyGoalsForSessionNoteSelection(childId: string): Promise<{
  goals: { id: string; title: string }[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapy_goals")
    .select("id, title")
    .eq("child_id", childId)
    .is("deleted_at", null)
    .order("title", { ascending: true });

  if (error) {
    console.error("listTherapyGoalsForSessionNoteSelection", error.message);
    return { goals: [], error: "Αποτυχία φόρτωσης στόχων για σύνδεση." };
  }

  return { goals: (data as { id: string; title: string }[]) ?? [], error: null };
}

export async function getTherapyGoalListItemById(id: string): Promise<{
  item: TherapyGoalListItem | null;
  error: string | null;
}> {
  const { goal, error } = await getTherapyGoalById(id);
  if (error) return { item: null, error };
  if (!goal) return { item: null, error: null };

  const supabase = await createClient();
  const [ch, pl, pr, di] = await Promise.all([
    supabase.from("children").select("first_name, last_name").eq("id", goal.child_id).maybeSingle(),
    goal.treatment_plan_id
      ? supabase.from("treatment_plans").select("title").eq("id", goal.treatment_plan_id).maybeSingle()
      : Promise.resolve({ data: null as { title: string } | null, error: null }),
    goal.therapist_user_id
      ? supabase.from("profiles").select("display_name").eq("id", goal.therapist_user_id).maybeSingle()
      : Promise.resolve({ data: null as { display_name: string | null } | null, error: null }),
    supabase.from("therapy_disciplines").select("name_el").eq("code", goal.discipline_code).maybeSingle(),
  ]);

  const c = ch.data as { first_name: string; last_name: string } | null;
  const child_name = c ? `${c.last_name} ${c.first_name}`.trim() : "—";
  const plan_title =
    goal.treatment_plan_id && pl.data
      ? (pl.data as { title: string }).title
      : null;
  const therapist_name =
    goal.therapist_user_id && pr.data
      ? (pr.data as { display_name: string | null }).display_name
      : null;
  const discipline_name_el = di.data ? (di.data as { name_el: string }).name_el : null;

  return {
    item: {
      ...goal,
      child_name,
      plan_title,
      discipline_name_el,
      therapist_name,
    },
    error: null,
  };
}

export async function getTherapyGoalTitlesByIds(
  ids: string[]
): Promise<{ titles: Map<string, string>; error: string | null }> {
  if (ids.length === 0) return { titles: new Map(), error: null };
  const supabase = await createClient();
  const { data, error } = await supabase.from("therapy_goals").select("id, title").in("id", ids);

  if (error) {
    console.error("getTherapyGoalTitlesByIds", error.message);
    return { titles: new Map(), error: "Αποτυχία φόρτωσης τίτλων στόχων." };
  }

  const titles = new Map<string, string>(
    (data ?? []).map((r: { id: string; title: string }) => [r.id, r.title])
  );
  return { titles, error: null };
}
