"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { canWriteRooms } from "@/lib/auth/rooms-permissions";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { getRoomById } from "@/lib/data/rooms/queries";
import { createClient } from "@/lib/supabase/server";
import { formatRoomZodErrors, roomFormSchema } from "@/lib/validation/room-form";

export type RoomFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: RoomFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

function parseCapacity(formData: FormData): { ok: true; value: number | null } | { ok: false; message: string } {
  const raw = gv(formData, "capacity").trim();
  if (raw === "") return { ok: true, value: null };
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n)) {
    return { ok: false, message: "Η χωρητικότητα πρέπει να είναι ακέραιος αριθμός." };
  }
  return { ok: true, value: n };
}

async function validateCenterInOrg(
  supabase: Awaited<ReturnType<typeof createClient>>,
  centerId: string,
  organizationId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("centers")
    .select("id, organization_id")
    .eq("id", centerId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return "Το κέντρο δεν βρέθηκε.";
  const c = data as { organization_id: string };
  if (c.organization_id !== organizationId) return "Το κέντρο δεν ανήκει στον οργανισμό.";
  return null;
}

export async function createRoomAction(_prev: RoomFormState, formData: FormData): Promise<RoomFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteRooms(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα δημιουργίας αίθουσας.", fieldErrors: {} };
  }

  const capRes = parseCapacity(formData);
  if (!capRes.ok) {
    return { ok: false, message: capRes.message, fieldErrors: { capacity: capRes.message } };
  }

  const raw = {
    organization_id: gv(formData, "organization_id"),
    center_id: gv(formData, "center_id"),
    name: gv(formData, "name"),
    room_code: gv(formData, "room_code"),
    capacity: capRes.value,
    room_type: gv(formData, "room_type") || "other",
    status: gv(formData, "status") || "active",
    description: gv(formData, "description"),
  };

  const parsed = roomFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatRoomZodErrors(parsed.error),
    };
  }

  const orgOk = await userBelongsToOrganization(parsed.data.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const cErr = await validateCenterInOrg(supabase, parsed.data.center_id, parsed.data.organization_id);
  if (cErr) {
    return { ok: false, message: cErr, fieldErrors: {} };
  }

  const { data: created, error } = await supabase
    .from("rooms")
    .insert({
      organization_id: parsed.data.organization_id,
      center_id: parsed.data.center_id,
      name: parsed.data.name,
      room_code: parsed.data.room_code.trim(),
      capacity: parsed.data.capacity,
      room_type: parsed.data.room_type,
      status: parsed.data.status,
      description: parsed.data.description,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createRoomAction", error.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/rooms");
  revalidatePath("/schedule");
  redirect(`/rooms/${created.id}`);
}

export async function updateRoomAction(_prev: RoomFormState, formData: FormData): Promise<RoomFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteRooms(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα επεξεργασίας αίθουσας.", fieldErrors: {} };
  }

  const roomId = gv(formData, "room_id");
  if (!roomId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό αίθουσας." };
  }

  const { room: existing, error: loadErr } = await getRoomById(roomId);
  if (loadErr || !existing) {
    return { ...initial, ok: false, message: "Η αίθουσα δεν βρέθηκε." };
  }

  const capResUp = parseCapacity(formData);
  if (!capResUp.ok) {
    return { ok: false, message: capResUp.message, fieldErrors: { capacity: capResUp.message } };
  }

  const raw = {
    organization_id: existing.organization_id,
    center_id: gv(formData, "center_id"),
    name: gv(formData, "name"),
    room_code: gv(formData, "room_code"),
    capacity: capResUp.value,
    room_type: gv(formData, "room_type") || "other",
    status: gv(formData, "status") || "active",
    description: gv(formData, "description"),
  };

  const parsed = roomFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatRoomZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const cErr = await validateCenterInOrg(supabase, parsed.data.center_id, parsed.data.organization_id);
  if (cErr) {
    return { ok: false, message: cErr, fieldErrors: {} };
  }

  const { error } = await supabase
    .from("rooms")
    .update({
      center_id: parsed.data.center_id,
      name: parsed.data.name,
      room_code: parsed.data.room_code.trim(),
      capacity: parsed.data.capacity,
      room_type: parsed.data.room_type,
      status: parsed.data.status,
      description: parsed.data.description,
    })
    .eq("id", roomId)
    .is("deleted_at", null);

  if (error) {
    console.error("updateRoomAction", error.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/rooms");
  revalidatePath(`/rooms/${roomId}`);
  revalidatePath(`/rooms/${roomId}/edit`);
  revalidatePath("/schedule");
  redirect(`/rooms/${roomId}`);
}
