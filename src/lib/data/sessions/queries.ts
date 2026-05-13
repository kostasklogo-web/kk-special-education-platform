import "server-only";

import { createClient } from "@/lib/supabase/server";
import { embedSingleWithCode } from "@/lib/supabase/postgrest-embeds";
import type { SessionFilters, SessionListItem, SessionRow } from "@/lib/data/sessions/types";

export type TherapistOption = {
  user_id: string;
  display_name: string | null;
};

export type ChildOption = {
  id: string;
  first_name: string;
  last_name: string;
};

export type RoomOption = { id: string; name: string; center_id: string };

export type DisciplineOption = {
  code: string;
  name_el: string;
};

function mapSessionRows(
  rows: SessionRow[],
  extras: {
    children: Map<string, string>;
    profiles: Map<string, string | null>;
    centers: Map<string, string>;
    rooms: Map<string, string>;
    disciplines: Map<string, string>;
  }
): SessionListItem[] {
  return rows.map((r) => ({
    ...r,
    session_kind: (r as SessionRow & { session_kind?: string }).session_kind ?? "individual",
    child_name: extras.children.get(r.child_id) ?? "—",
    therapist_name: extras.profiles.get(r.therapist_user_id) ?? null,
    center_name: extras.centers.get(r.center_id) ?? null,
    room_name: r.room_id ? extras.rooms.get(r.room_id) ?? null : null,
    discipline_name_el: extras.disciplines.get(r.discipline_code) ?? null,
  })) as SessionListItem[];
}

export async function listSessionsInRange(params: {
  organizationId: string;
  fromIso: string;
  toIso: string;
  filters?: SessionFilters;
}): Promise<{ items: SessionListItem[]; error: string | null }> {
  const supabase = await createClient();
  let q = supabase
    .from("sessions")
    .select(
      "id, organization_id, center_id, room_id, child_id, therapist_user_id, discipline_code, starts_at, ends_at, status, session_kind, internal_notes, created_at, updated_at, deleted_at"
    )
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .gte("starts_at", params.fromIso)
    .lte("starts_at", params.toIso)
    .order("starts_at", { ascending: true });

  const f = params.filters;
  if (f?.centerId) q = q.eq("center_id", f.centerId);
  if (f?.therapistId) q = q.eq("therapist_user_id", f.therapistId);
  if (f?.childId) q = q.eq("child_id", f.childId);
  if (f?.disciplineCode) q = q.eq("discipline_code", f.disciplineCode);
  if (f?.roomId) q = q.eq("room_id", f.roomId);
  if (f?.status) q = q.eq("status", f.status);

  const { data, error } = await q;

  if (error) {
    console.error("listSessionsInRange", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης συνεδριών." };
  }

  const rows = (data ?? []) as SessionRow[];
  if (rows.length === 0) return { items: [], error: null };

  const childIds = [...new Set(rows.map((r) => r.child_id))];
  const therapistIds = [...new Set(rows.map((r) => r.therapist_user_id))];
  const centerIds = [...new Set(rows.map((r) => r.center_id))];
  const roomIds = [...new Set(rows.map((r) => r.room_id).filter(Boolean))] as string[];
  const discCodes = [...new Set(rows.map((r) => r.discipline_code))];

  const [ch, pr, ce, ro, di] = await Promise.all([
    supabase.from("children").select("id, first_name, last_name").in("id", childIds),
    supabase.from("profiles").select("id, display_name").in("id", therapistIds),
    supabase.from("centers").select("id, name").in("id", centerIds),
    roomIds.length
      ? supabase.from("rooms").select("id, name").in("id", roomIds)
      : Promise.resolve({ data: [] as { id: string; name: string }[], error: null }),
    supabase.from("therapy_disciplines").select("code, name_el").in("code", discCodes),
  ]);

  const children = new Map<string, string>(
    (ch.data ?? []).map((c: { id: string; first_name: string; last_name: string }) => [
      c.id,
      `${c.last_name} ${c.first_name}`.trim(),
    ])
  );
  const profiles = new Map<string, string | null>(
    (pr.data ?? []).map((p: { id: string; display_name: string | null }) => [p.id, p.display_name])
  );
  const centers = new Map<string, string>(
    (ce.data ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  );
  const rooms = new Map<string, string>(
    ((ro as { data?: { id: string; name: string }[] }).data ?? []).map((r) => [r.id, r.name])
  );
  const disciplines = new Map<string, string>(
    (di.data ?? []).map((d: { code: string; name_el: string }) => [d.code, d.name_el])
  );

  return {
    items: mapSessionRows(rows, { children, profiles, centers, rooms, disciplines }),
    error: null,
  };
}

export async function getSessionById(id: string): Promise<{
  session: SessionListItem | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select(
      "id, organization_id, center_id, room_id, child_id, therapist_user_id, discipline_code, starts_at, ends_at, status, session_kind, internal_notes, created_at, updated_at, deleted_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getSessionById", error.message);
    return { session: null, error: "Αποτυχία φόρτωσης συνεδρίας." };
  }

  if (!data) return { session: null, error: null };

  const row = {
    ...(data as SessionRow),
    session_kind: ((data as SessionRow & { session_kind?: string }).session_kind ??
      "individual") as SessionRow["session_kind"],
  };

  const [ch, pr, ce, ro, di] = await Promise.all([
    supabase.from("children").select("id, first_name, last_name").eq("id", row.child_id).maybeSingle(),
    supabase.from("profiles").select("id, display_name").eq("id", row.therapist_user_id).maybeSingle(),
    supabase.from("centers").select("id, name").eq("id", row.center_id).maybeSingle(),
    row.room_id
      ? supabase.from("rooms").select("id, name").eq("id", row.room_id).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from("therapy_disciplines").select("code, name_el").eq("code", row.discipline_code).maybeSingle(),
  ]);

  const c = ch.data as { first_name: string; last_name: string } | null;
  const p = pr.data as { display_name: string | null } | null;
  const cen = ce.data as { name: string } | null;
  const rm = (ro as { data: { name: string } | null }).data;
  const disc = di.data as { name_el: string } | null;

  const item: SessionListItem = {
    ...row,
    child_name: c ? `${c.last_name} ${c.first_name}`.trim() : "—",
    therapist_name: p?.display_name ?? null,
    center_name: cen?.name ?? null,
    room_name: rm?.name ?? null,
    discipline_name_el: disc?.name_el ?? null,
  };

  return { session: item, error: null };
}

export async function listTherapistsForOrganization(
  organizationId: string
): Promise<{ therapists: TherapistOption[]; error: string | null }> {
  const supabase = await createClient();
  const { data: staffRows, error: sErr } = await supabase
    .from("staff")
    .select("user_id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (sErr) {
    console.error("listTherapistsForOrganization staff", sErr.message);
    return { therapists: [], error: "Αποτυχία φόρτωσης προσωπικού." };
  }

  const userIds = [...new Set((staffRows ?? []).map((s: { user_id: string }) => s.user_id))];
  if (userIds.length === 0) return { therapists: [], error: null };

  const { data: rolesData } = await supabase
    .from("user_roles")
    .select("user_id, roles(code)")
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  const therapistUserIds = new Set<string>();
  for (const ur of rolesData ?? []) {
    const r = ur as { user_id: string; roles: unknown };
    const code = embedSingleWithCode(r.roles)?.code;
    if (code === "THERAPIST" && userIds.includes(r.user_id)) therapistUserIds.add(r.user_id);
  }

  if (therapistUserIds.size === 0) {
    userIds.forEach((uid) => therapistUserIds.add(uid));
  }

  const ids = [...therapistUserIds];
  if (ids.length === 0) return { therapists: [], error: null };

  const { data: profs, error: pErr } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", ids);

  if (pErr) {
    console.error("listTherapistsForOrganization profiles", pErr.message);
    return { therapists: [], error: "Αποτυχία φόρτωσης προφίλ." };
  }

  const therapists: TherapistOption[] = (profs ?? []).map((p: { id: string; display_name: string | null }) => ({
    user_id: p.id,
    display_name: p.display_name,
  }));

  therapists.sort((a, b) => (a.display_name ?? "").localeCompare(b.display_name ?? "", "el"));
  return { therapists, error: null };
}

export async function listChildrenOptionsForOrganization(
  organizationId: string
): Promise<{ children: ChildOption[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("children")
    .select("id, first_name, last_name")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("listChildrenOptionsForOrganization", error.message);
    return { children: [], error: "Αποτυχία φόρτωσης παιδιών." };
  }

  return { children: (data as ChildOption[]) ?? [], error: null };
}

export async function listRoomsForOrganization(
  organizationId: string
): Promise<{ rooms: RoomOption[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, center_id")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("listRoomsForOrganization", error.message);
    return { rooms: [], error: "Αποτυχία φόρτωσης αιθουσών." };
  }

  return { rooms: (data as RoomOption[]) ?? [], error: null };
}

export async function listDisciplines(): Promise<{
  disciplines: DisciplineOption[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("therapy_disciplines")
    .select("code, name_el")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("listDisciplines", error.message);
    return { disciplines: [], error: "Αποτυχία φόρτωσης ειδικοτήτων." };
  }

  return { disciplines: (data as DisciplineOption[]) ?? [], error: null };
}
