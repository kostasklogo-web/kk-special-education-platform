import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { RoomFilters, RoomListItem, RoomRow, RoomStatus, RoomType } from "@/lib/data/rooms/types";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import type { SessionListItem } from "@/lib/data/sessions/types";

function mapRoomRow(r: Record<string, unknown>): RoomRow {
  const rt = (r.room_type as string) || "other";
  const st = (r.status as string) || "active";
  return {
    id: r.id as string,
    organization_id: r.organization_id as string,
    center_id: r.center_id as string,
    name: r.name as string,
    room_code: (r.room_code as string) ?? "",
    capacity: (r.capacity as number | null) ?? null,
    room_type: (["speech_therapy", "occupational_therapy", "psychotherapy", "group_program", "assessment", "office", "other"].includes(rt)
      ? rt
      : "other") as RoomType,
    status: (["active", "inactive", "maintenance"].includes(st) ? st : "active") as RoomStatus,
    description: (r.description as string) ?? "",
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted_at: (r.deleted_at as string) ?? null,
  };
}

export async function listRoomsForOrganization(params: {
  organizationId: string;
  filters?: RoomFilters;
}): Promise<{ items: RoomListItem[]; error: string | null }> {
  const supabase = await createClient();
  let q = supabase
    .from("rooms")
    .select(
      "id, organization_id, center_id, name, room_code, capacity, room_type, status, description, created_at, updated_at, deleted_at"
    )
    .eq("organization_id", params.organizationId)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  const f = params.filters;
  if (f?.centerId) q = q.eq("center_id", f.centerId);
  if (f?.roomType) q = q.eq("room_type", f.roomType);
  if (f?.status) q = q.eq("status", f.status);

  const { data, error } = await q;

  if (error) {
    console.error("listRoomsForOrganization", error.message);
    return { items: [], error: "Αποτυχία φόρτωσης αιθουσών." };
  }

  const rows = (data ?? []) as Record<string, unknown>[];
  if (rows.length === 0) return { items: [], error: null };

  const centerIds = [...new Set(rows.map((r) => r.center_id as string))];
  const { data: centers, error: cErr } = await supabase.from("centers").select("id, name").in("id", centerIds);

  if (cErr) {
    console.error("listRoomsForOrganization centers", cErr.message);
    return { items: [], error: "Αποτυχία φόρτωσης κέντρων." };
  }

  const centerNames = new Map<string, string>(
    (centers ?? []).map((c: { id: string; name: string }) => [c.id, c.name])
  );

  const items: RoomListItem[] = rows.map((raw) => {
    const room = mapRoomRow(raw);
    return {
      ...room,
      center_name: centerNames.get(room.center_id) ?? null,
    };
  });

  return { items, error: null };
}

export async function getRoomById(id: string): Promise<{
  room: RoomListItem | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: raw, error } = await supabase
    .from("rooms")
    .select(
      "id, organization_id, center_id, name, room_code, capacity, room_type, status, description, created_at, updated_at, deleted_at"
    )
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getRoomById", error.message);
    return { room: null, error: "Αποτυχία φόρτωσης αίθουσας." };
  }
  if (!raw) return { room: null, error: null };

  const room = mapRoomRow(raw as Record<string, unknown>);
  const { data: cen } = await supabase.from("centers").select("name").eq("id", room.center_id).maybeSingle();
  const center_name = (cen as { name: string } | null)?.name ?? null;

  return {
    room: { ...room, center_name },
    error: null,
  };
}

/** Συνεδρίες που χρησιμοποιούν την αίθουσα σε χρονικό παράθυρο (MVP). */
export async function listSessionsForRoomInRange(params: {
  organizationId: string;
  roomId: string;
  fromIso: string;
  toIso: string;
}): Promise<{ items: SessionListItem[]; error: string | null }> {
  return listSessionsInRange({
    organizationId: params.organizationId,
    fromIso: params.fromIso,
    toIso: params.toIso,
    filters: { roomId: params.roomId },
  });
}
