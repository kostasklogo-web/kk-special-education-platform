import "server-only";

import { createClient } from "@/lib/supabase/server";
import type {
  CenterSummary,
  ChildListItem,
  ChildRow,
  ParentLinkRow,
  TherapyProgramSummary,
} from "@/lib/data/children/types";
import {
  DEMO_PRIMARY_CENTER_ID,
  DEMO_SECONDARY_CENTER_ID,
  getAuthGatingTemporarilyDisabled,
  getDemoOrganizationId,
} from "@/lib/config/demo";

async function mapCentersForChildren(
  rows: ChildRow[]
): Promise<Pick<ChildListItem, "center">[]> {
  if (rows.length === 0) return [];
  const supabase = await createClient();
  const ids = [...new Set(rows.map((r) => r.primary_center_id).filter(Boolean))] as string[];
  if (ids.length === 0) {
    return rows.map(() => ({ center: null }));
  }
  const { data: centers, error } = await supabase
    .from("centers")
    .select("id, name")
    .in("id", ids)
    .is("deleted_at", null);

  if (error) {
    console.error("mapCentersForChildren", error.message);
  }

  const byId = new Map<string, CenterSummary>(
    (centers ?? []).map((c) => [c.id as string, c as CenterSummary])
  );

  return rows.map((r) => ({
    center: r.primary_center_id ? byId.get(r.primary_center_id) ?? null : null,
  }));
}

export type ListChildrenParams = {
  search?: string | null;
};

export async function listChildren(params: ListChildrenParams = {}): Promise<{
  items: ChildListItem[];
  error: string | null;
}> {
  const supabase = await createClient();
  let q = supabase
    .from("children")
    .select(
      "id, organization_id, primary_center_id, first_name, last_name, date_of_birth, gender, preferred_language, status, school_name, school_grade, enrollment_start_date, notes, created_at, updated_at, deleted_at"
    )
    .is("deleted_at", null)
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true });

  const term = params.search?.trim().replace(/,/g, " ");
  if (term) {
    const escaped = term.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
    const pattern = `%${escaped}%`;
    q = q.or(`first_name.ilike.${pattern},last_name.ilike.${pattern}`);
  }

  const { data, error } = await q;

  if (error) {
    console.error("listChildren", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης λίστας παιδιών." };
  }

  const rows = (data ?? []) as ChildRow[];
  const centers = await mapCentersForChildren(rows);
  const items: ChildListItem[] = rows.map((row, i) => ({
    ...row,
    center: centers[i]?.center ?? null,
  }));

  return { items, error: null };
}

export async function getChildById(id: string): Promise<{
  child: ChildRow | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select(
      "id, organization_id, primary_center_id, first_name, last_name, date_of_birth, gender, preferred_language, status, school_name, school_grade, enrollment_start_date, notes, created_at, updated_at, deleted_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getChildById", error.message);
    return { child: null, error: "Αποτυχία φόρτωσης παιδιού." };
  }

  return { child: (data as ChildRow) ?? null, error: null };
}

export async function getChildWithCenter(id: string): Promise<{
  item: ChildListItem | null;
  error: string | null;
}> {
  const { child, error } = await getChildById(id);
  if (error || !child) return { item: null, error };
  const [mapped] = await mapCentersForChildren([child]);
  return {
    item: { ...child, center: mapped?.center ?? null },
    error: null,
  };
}

export async function listCentersForOrganization(
  organizationId: string
): Promise<{ centers: CenterSummary[]; error: string | null }> {
  if (getAuthGatingTemporarilyDisabled() && organizationId === getDemoOrganizationId()) {
    return {
      centers: [
        { id: DEMO_PRIMARY_CENTER_ID, name: "Εύοσμος Θεσσαλονίκης" },
        { id: DEMO_SECONDARY_CENTER_ID, name: "Νίκαια" },
      ],
      error: null,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centers")
    .select("id, name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("listCentersForOrganization", error.message);
    return { centers: [], error: "Αποτυχία φόρτωσης κέντρων." };
  }

  return { centers: (data as CenterSummary[]) ?? [], error: null };
}

export async function getDefaultOrganizationIdForUser(): Promise<{
  organizationId: string | null;
  error: string | null;
}> {
  if (getAuthGatingTemporarilyDisabled()) {
    return { organizationId: getDemoOrganizationId(), error: null };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { organizationId: null, error: "Δεν υπάρχει συνδεδεμένος χρήστης." };
  }

  const { data, error } = await supabase
    .from("user_roles")
    .select("organization_id")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) {
    console.error("getDefaultOrganizationIdForUser", error.message);
    return { organizationId: null, error: "Αποτυχία ανάλυσης οργανισμού." };
  }

  const organizationId = data?.[0]?.organization_id ?? null;
  if (!organizationId) {
    return {
      organizationId: null,
      error: "Δεν έχει ρυθμιστεί οργανισμός για αυτό το περιβάλλον. Προσθέστε demo δεδομένα για να συνεχίσετε.",
    };
  }

  return { organizationId, error: null };
}

export async function listParentLinksForChild(
  childId: string
): Promise<{ links: ParentLinkRow[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("child_parent_relationships")
    .select(
      "id, relationship, is_primary, parents ( id, first_name, last_name, email, phone )"
    )
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (error) {
    console.error("listParentLinksForChild", error.message);
    return { links: [], error: "Αποτυχία φόρτωσης συσχετίσεων γονέων." };
  }

  const links: ParentLinkRow[] = (data ?? []).map((row: Record<string, unknown>) => {
    const raw = row.parents as ParentLinkRow["parent"] | ParentLinkRow["parent"][] | null;
    const parent = Array.isArray(raw) ? raw[0] ?? null : raw;
    return {
      relationship_id: row.id as string,
      relationship: (row.relationship as string) ?? "guardian",
      is_primary: Boolean(row.is_primary),
      parent: parent ?? {
        id: "",
        first_name: "",
        last_name: "",
        email: null,
        phone: null,
      },
    };
  });

  return { links, error: null };
}

export async function listTherapyProgramsForChild(
  childId: string
): Promise<{ programs: TherapyProgramSummary[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapy_programs")
    .select("id, title, status")
    .eq("child_id", childId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listTherapyProgramsForChild", error.message);
    return { programs: [], error: "Αποτυχία φόρτωσης προγραμμάτων." };
  }

  const programs: TherapyProgramSummary[] = (data ?? []).map((p: Record<string, unknown>) => ({
    id: p.id as string,
    title: (p.title as string) ?? null,
    discipline_code: null,
  }));

  return { programs, error: null };
}

export async function countTherapyGoalsForChild(childId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("therapy_goals")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (error) {
    console.error("countTherapyGoalsForChild", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countSessionsForChild(childId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (error) {
    console.error("countSessionsForChild", error.message);
    return 0;
  }
  return count ?? 0;
}

export async function countSessionNotesForChild(childId: string): Promise<number> {
  const supabase = await createClient();
  const { data: sessionIds, error: sErr } = await supabase
    .from("sessions")
    .select("id")
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (sErr || !sessionIds?.length) return 0;

  const ids = sessionIds.map((s: { id: string }) => s.id);
  const { count, error } = await supabase
    .from("session_notes")
    .select("id", { count: "exact", head: true })
    .in("session_id", ids)
    .is("deleted_at", null);

  if (error) return 0;
  return count ?? 0;
}

export async function countProgressReportsForChild(childId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("progress_reports")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (error) return 0;
  return count ?? 0;
}

export async function countFilesForChild(childId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("files")
    .select("id", { count: "exact", head: true })
    .eq("child_id", childId)
    .is("deleted_at", null);

  if (error) return 0;
  return count ?? 0;
}
