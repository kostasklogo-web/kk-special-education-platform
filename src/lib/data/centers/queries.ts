import "server-only";

import { createClient } from "@/lib/supabase/server";
import { embedSingleWithCode } from "@/lib/supabase/postgrest-embeds";
import type { CenterListItem, CenterRoomSummary, CenterRow, CenterStaffSummary } from "@/lib/data/centers/types";

function mapCenterRow(r: Record<string, unknown>): CenterRow {
  return {
    id: r.id as string,
    organization_id: r.organization_id as string,
    name: r.name as string,
    timezone: (r.timezone as string) ?? "Europe/Athens",
    address_line: (r.address_line as string) ?? null,
    city: (r.city as string) ?? "",
    phone: (r.phone as string) ?? null,
    contact_email: (r.contact_email as string) ?? "",
    description: (r.description as string) ?? "",
    is_active: Boolean(r.is_active ?? true),
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted_at: (r.deleted_at as string) ?? null,
  };
}

export async function listCentersForSettings(params: {
  organizationId: string;
}): Promise<{ items: CenterListItem[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("centers")
    .select(
      "id, organization_id, name, timezone, address_line, city, phone, contact_email, description, is_active, created_at, updated_at, deleted_at"
    )
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("listCentersForSettings", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης κέντρων." };
  }

  return { items: (data ?? []).map((raw) => mapCenterRow(raw as Record<string, unknown>)), error: null };
}

export async function getCenterById(centerId: string): Promise<{
  center: CenterRow | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: raw, error } = await supabase
    .from("centers")
    .select(
      "id, organization_id, name, timezone, address_line, city, phone, contact_email, description, is_active, created_at, updated_at, deleted_at"
    )
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getCenterById", error.message);
    return { center: null, error: "Αποτυχία φόρτωσης κέντρου." };
  }
  if (!raw) return { center: null, error: null };
  return { center: mapCenterRow(raw as Record<string, unknown>), error: null };
}

export async function listRoomsForCenter(centerId: string): Promise<{
  items: CenterRoomSummary[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rooms")
    .select("id, name, room_code, status")
    .eq("center_id", centerId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (error) {
    console.error("listRoomsForCenter", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης αιθουσών." };
  }

  const items: CenterRoomSummary[] = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    name: r.name as string,
    room_code: (r.room_code as string) ?? "",
    status: (r.status as string) ?? "active",
  }));

  return { items, error: null };
}

export async function listStaffForPrimaryCenter(params: {
  organizationId: string;
  centerId: string;
}): Promise<{ items: CenterStaffSummary[]; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .select("id, first_name, last_name, user_id, primary_center_id")
    .eq("organization_id", params.organizationId)
    .eq("primary_center_id", params.centerId)
    .is("deleted_at", null)
    .order("last_name", { ascending: true });

  if (error) {
    console.error("listStaffForPrimaryCenter", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης προσωπικού." };
  }

  const rows = (data ?? []) as {
    id: string;
    first_name: string;
    last_name: string;
    user_id: string;
  }[];
  if (rows.length === 0) return { items: [], error: null };

  const userIds = rows.map((r) => r.user_id);
  const { data: urData } = await supabase
    .from("user_roles")
    .select("user_id, roles(code)")
    .eq("organization_id", params.organizationId)
    .in("user_id", userIds)
    .is("deleted_at", null);

  const roleByUser = new Map<string, string | null>();
  for (const ur of urData ?? []) {
    const row = ur as { user_id: string; roles: unknown };
    roleByUser.set(row.user_id, embedSingleWithCode(row.roles)?.code ?? null);
  }

  const items: CenterStaffSummary[] = rows.map((r) => ({
    id: r.id,
    first_name: r.first_name,
    last_name: r.last_name,
    role_code: roleByUser.get(r.user_id) ?? null,
  }));

  return { items, error: null };
}
