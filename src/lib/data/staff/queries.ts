import "server-only";

import {
  isSupabaseFetchFailure,
  shouldUseClinicalAccessDemoFallback,
  warnClinicalAccessDemoFallback,
} from "@/lib/clinical/access/clinical-access-demo-fallback";
import { getDemoSuperviseeUserIds } from "@/lib/demo/therapist-assignments-demo";
import type { RoleCode } from "@/lib/auth/roles";
import { ROLE_CODES } from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/server";
import { embedSingleWithCode } from "@/lib/supabase/postgrest-embeds";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import type { SessionListItem } from "@/lib/data/sessions/types";
import {
  addDaysAthensCalendar,
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import type {
  EligibleStaffUser,
  EmploymentStatus,
  StaffFilters,
  StaffListItem,
  StaffRow,
} from "@/lib/data/staff/types";

function parseRoleCode(code: string | undefined): RoleCode | null {
  if (!code) return null;
  return (ROLE_CODES as readonly string[]).includes(code) ? (code as RoleCode) : null;
}

function mapEmploymentStatus(s: string | undefined): EmploymentStatus {
  if (s === "inactive" || s === "on_leave") return s;
  return "active";
}

function mapStaffRow(r: Record<string, unknown>): StaffRow {
  return {
    id: r.id as string,
    organization_id: r.organization_id as string,
    user_id: r.user_id as string,
    first_name: (r.first_name as string) ?? "",
    last_name: (r.last_name as string) ?? "",
    work_email: (r.work_email as string) ?? "",
    phone: (r.phone as string) ?? "",
    job_title: (r.job_title as string) ?? null,
    hire_date: (r.hire_date as string) ?? null,
    discipline_code: (r.discipline_code as string) ?? null,
    supervisor_user_id: (r.supervisor_user_id as string) ?? null,
    employment_status: mapEmploymentStatus(r.employment_status as string | undefined),
    observations: (r.observations as string) ?? "",
    primary_center_id: (r.primary_center_id as string) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted_at: (r.deleted_at as string) ?? null,
  };
}

export async function listSuperviseeUserIds(params: {
  organizationId: string;
  supervisorUserId: string;
}): Promise<{ ids: Set<string>; error: string | null }> {
  const useDemoFallback = await shouldUseClinicalAccessDemoFallback();
  if (useDemoFallback) {
    warnClinicalAccessDemoFallback();
    return {
      ids: new Set(getDemoSuperviseeUserIds(params.supervisorUserId)),
      error: null,
    };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("supervision_relationships")
      .select("supervisee_user_id")
      .eq("organization_id", params.organizationId)
      .eq("supervisor_user_id", params.supervisorUserId)
      .is("deleted_at", null);

    if (error) {
      if (isSupabaseFetchFailure(error)) {
        return { ids: new Set(), error: "Αποτυχία φόρτωσης ομάδας εποπτείας." };
      }
      console.error("listSuperviseeUserIds", error.message);
      return { ids: new Set(), error: "Αποτυχία φόρτωσης ομάδας εποπτείας." };
    }

    const ids = new Set<string>(
      (data ?? []).map((row: { supervisee_user_id: string }) => row.supervisee_user_id)
    );
    return { ids, error: null };
  } catch (err) {
    if (isSupabaseFetchFailure(err)) {
      return { ids: new Set(), error: "Αποτυχία φόρτωσης ομάδας εποπτείας." };
    }
    throw err;
  }
}

export async function listStaffForOrganization(params: {
  organizationId: string;
  filters?: StaffFilters;
  /** Αν οριστεί (κενό Set = κανένας), φιλτράρει κατά user_id (π.χ. ομάδα επόπτη). undefined = χωρίς φίλτρο. */
  restrictToUserIds?: Set<string>;
}): Promise<{ items: StaffListItem[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select(
      "id, organization_id, user_id, first_name, last_name, work_email, phone, job_title, hire_date, discipline_code, supervisor_user_id, employment_status, observations, primary_center_id, created_at, updated_at, deleted_at"
    )
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("listStaffForOrganization", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης προσωπικού." };
  }

  let rows = (data ?? []) as Record<string, unknown>[];
  if (params.restrictToUserIds !== undefined) {
    rows = rows.filter((r) => params.restrictToUserIds!.has(r.user_id as string));
  }

  if (rows.length === 0) return { items: [], error: null };

  const userIds = [...new Set(rows.map((r) => r.user_id as string))];
  const { data: urData, error: urErr } = await supabase
    .from("user_roles")
    .select("id, user_id, role_id, roles(code)")
    .eq("organization_id", params.organizationId)
    .in("user_id", userIds)
    .is("deleted_at", null);

  if (urErr) {
    console.error("listStaffForOrganization user_roles", urErr.message);
    return { items: [], error: "Αποτυχία φόρτωσης ρόλων." };
  }

  const roleByUser = new Map<string, { user_role_id: string; role_id: string; code: RoleCode | null }>();
  for (const ur of urData ?? []) {
    const row = ur as {
      id: string;
      user_id: string;
      role_id: string;
      roles: unknown;
    };
    const code = parseRoleCode(embedSingleWithCode(row.roles)?.code);
    if (code === "PARENT") continue;
    roleByUser.set(row.user_id, { user_role_id: row.id, role_id: row.role_id, code });
  }

  const centerIds = [...new Set(rows.map((r) => r.primary_center_id as string | null).filter(Boolean))] as string[];
  const discCodes = [...new Set(rows.map((r) => r.discipline_code as string | null).filter(Boolean))] as string[];
  const supIds = [...new Set(rows.map((r) => r.supervisor_user_id as string | null).filter(Boolean))] as string[];

  const [centersRes, discsRes, supProf] = await Promise.all([
    centerIds.length
      ? supabase.from("centers").select("id, name").in("id", centerIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
    discCodes.length
      ? supabase.from("therapy_disciplines").select("code, name_el").in("code", discCodes)
      : Promise.resolve({ data: [] as { code: string; name_el: string }[], error: null }),
    supIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", supIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string | null }[], error: null }),
  ]);

  const centerNames = new Map<string, string>(
    (centersRes.data ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  );
  const discNames = new Map<string, string>(
    (discsRes.data ?? []).map((d: { code: string; name_el: string }) => [d.code, d.name_el])
  );
  const supNames = new Map<string, string | null>(
    (supProf.data ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  );

  let items: StaffListItem[] = rows.map((raw) => {
    const s = mapStaffRow(raw);
    const rr = roleByUser.get(s.user_id);
    return {
      ...s,
      role_code: rr?.code ?? null,
      role_id: rr?.role_id ?? null,
      user_role_id: rr?.user_role_id ?? null,
      center_name: s.primary_center_id ? centerNames.get(s.primary_center_id) ?? null : null,
      discipline_name_el: s.discipline_code ? discNames.get(s.discipline_code) ?? null : null,
      supervisor_name: s.supervisor_user_id ? supNames.get(s.supervisor_user_id) ?? null : null,
    };
  });

  items = items.filter((i) => i.role_code !== "PARENT");

  const f = params.filters;
  if (f?.centerId) items = items.filter((i) => i.primary_center_id === f.centerId);
  if (f?.roleCode) items = items.filter((i) => i.role_code === f.roleCode);
  if (f?.disciplineCode) items = items.filter((i) => i.discipline_code === f.disciplineCode);
  if (f?.employmentStatus) items = items.filter((i) => i.employment_status === f.employmentStatus);

  return { items, error: null };
}

export async function getStaffById(staffId: string): Promise<{
  item: StaffListItem | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: raw, error } = await supabase
    .from("staff")
    .select(
      "id, organization_id, user_id, first_name, last_name, work_email, phone, job_title, hire_date, discipline_code, supervisor_user_id, employment_status, observations, primary_center_id, created_at, updated_at, deleted_at"
    )
    .eq("id", staffId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getStaffById", error.message);
    return { item: null, error: "Αποτυχία φόρτωσης προφίλ." };
  }
  if (!raw) return { item: null, error: null };

  const s = mapStaffRow(raw as Record<string, unknown>);
  const { data: ur } = await supabase
    .from("user_roles")
    .select("id, role_id, roles(code)")
    .eq("organization_id", s.organization_id)
    .eq("user_id", s.user_id)
    .is("deleted_at", null)
    .maybeSingle();

  const urRow = ur as { id: string; role_id: string; roles: { code: string } | null } | null;
  const role_code = parseRoleCode(urRow?.roles?.code);

  let center_name: string | null = null;
  if (s.primary_center_id) {
    const { data: cen } = await supabase.from("centers").select("name").eq("id", s.primary_center_id).maybeSingle();
    center_name = (cen as { name: string } | null)?.name ?? null;
  }

  let discipline_name_el: string | null = null;
  if (s.discipline_code) {
    const { data: di } = await supabase
      .from("therapy_disciplines")
      .select("name_el")
      .eq("code", s.discipline_code)
      .maybeSingle();
    discipline_name_el = (di as { name_el: string } | null)?.name_el ?? null;
  }

  let supervisor_name: string | null = null;
  if (s.supervisor_user_id) {
    const { data: sp } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", s.supervisor_user_id)
      .maybeSingle();
    supervisor_name = (sp as { display_name: string | null } | null)?.display_name ?? null;
  }

  if (role_code === "PARENT") {
    return { item: null, error: null };
  }

  return {
    item: {
      ...s,
      role_code,
      role_id: urRow?.role_id ?? null,
      user_role_id: urRow?.id ?? null,
      center_name,
      discipline_name_el,
      supervisor_name,
    },
    error: null,
  };
}

export async function listEligibleUsersForNewStaff(organizationId: string): Promise<{
  users: EligibleStaffUser[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: urData, error: urErr } = await supabase
    .from("user_roles")
    .select("id, user_id, roles(code)")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (urErr) {
    console.error("listEligibleUsersForNewStaff", urErr.message);
    return { users: [], error: "Αποτυχία φόρτωσης χρηστών." };
  }

  const { data: existingStaff } = await supabase
    .from("staff")
    .select("user_id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  const taken = new Set((existingStaff ?? []).map((r: { user_id: string }) => r.user_id));

  const candidates: EligibleStaffUser[] = [];
  for (const ur of urData ?? []) {
    const row = ur as { id: string; user_id: string; roles: unknown };
    const code = parseRoleCode(embedSingleWithCode(row.roles)?.code);
    if (!code || code === "PARENT") continue;
    if (taken.has(row.user_id)) continue;
    candidates.push({
      user_id: row.user_id,
      display_name: null,
      role_code: code,
      user_role_id: row.id,
    });
  }

  if (candidates.length === 0) return { users: [], error: null };

  const ids = [...new Set(candidates.map((c) => c.user_id))];
  const { data: profs, error: pErr } = await supabase.from("profiles").select("id, display_name").in("id", ids);

  if (pErr) {
    console.error("listEligibleUsersForNewStaff profiles", pErr.message);
    return { users: [], error: "Αποτυχία φόρτωσης ονομάτων." };
  }

  const names = new Map<string, string | null>(
    (profs ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  );

  const users = candidates.map((c) => ({
    ...c,
    display_name: names.get(c.user_id) ?? null,
  }));

  users.sort((a, b) => (a.display_name ?? a.user_id).localeCompare(b.display_name ?? b.user_id, "el"));
  return { users, error: null };
}

export async function listRoleRows(): Promise<{
  roles: { id: string; code: RoleCode }[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("roles").select("id, code").order("sort_order", { ascending: true });

  if (error) {
    console.error("listRoleRows", error.message);
    return { roles: [], error: "Αποτυχία φόρτωσης ρόλων." };
  }

  const roles = (data ?? [])
    .map((r: { id: string; code: string }) => ({ id: r.id, code: parseRoleCode(r.code) }))
    .filter((r): r is { id: string; code: RoleCode } => Boolean(r.code) && r.code !== "PARENT");

  return { roles, error: null };
}

export async function listSupervisionForUser(params: {
  organizationId: string;
  userId: string;
}): Promise<{
  rows: {
    id: string;
    supervisor_user_id: string;
    supervisee_user_id: string;
    starts_on: string;
    ends_on: string | null;
  }[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("supervision_relationships")
    .select("id, supervisor_user_id, supervisee_user_id, starts_on, ends_on")
    .eq("organization_id", params.organizationId)
    .or(`supervisor_user_id.eq.${params.userId},supervisee_user_id.eq.${params.userId}`)
    .is("deleted_at", null)
    .order("starts_on", { ascending: false });

  if (error) {
    console.error("listSupervisionForUser", error.message);
    return { rows: [], error: "Αποτυχία φόρτωσης εποπτείας." };
  }

  return { rows: (data ?? []) as { id: string; supervisor_user_id: string; supervisee_user_id: string; starts_on: string; ends_on: string | null }[], error: null };
}

export async function listSessionsForStaffTherapist(params: {
  organizationId: string;
  therapistUserId: string;
}): Promise<{ items: SessionListItem[]; error: string | null }> {
  const anchor = todayAthensYmd();
  const fromYmd = addDaysAthensCalendar(anchor, -14);
  const toYmd = addDaysAthensCalendar(anchor, 42);
  const fromIso = athensStartOfDayUtcIso(fromYmd);
  const toIso = athensEndOfDayUtcIso(toYmd);

  return listSessionsInRange({
    organizationId: params.organizationId,
    fromIso,
    toIso,
    filters: { therapistId: params.therapistUserId },
  });
}

export async function getProfileNamesByIds(
  ids: string[]
): Promise<{ names: Map<string, string | null>; error: string | null }> {
  if (ids.length === 0) return { names: new Map(), error: null };
  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("id, display_name").in("id", ids);

  if (error) {
    console.error("getProfileNamesByIds", error.message);
    return { names: new Map(), error: "Αποτυχία φόρτωσης ονομάτων." };
  }

  const names = new Map<string, string | null>(
    (data ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  );
  return { names, error: null };
}
