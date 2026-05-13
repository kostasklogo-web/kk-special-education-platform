"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  canMutateSchedule,
  canTherapistEditOwnSessions,
  isSupervisor,
} from "@/lib/auth/schedule-permissions";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { findSessionConflicts } from "@/lib/data/sessions/conflicts";
import { getSessionById } from "@/lib/data/sessions/queries";
import { createClient } from "@/lib/supabase/server";
import { formatZodErrors, sessionFormSchema } from "@/lib/validation/session-form";

export type SessionFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: SessionFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

function formToSessionPayload(formData: FormData) {
  return {
    organization_id: gv(formData, "organization_id"),
    center_id: gv(formData, "center_id"),
    room_id: gv(formData, "room_id"),
    child_id: gv(formData, "child_id"),
    therapist_user_id: gv(formData, "therapist_user_id"),
    discipline_code: gv(formData, "discipline_code"),
    session_kind: gv(formData, "session_kind") || "individual",
    status: gv(formData, "status") || "scheduled",
    starts_at: gv(formData, "starts_at"),
    ends_at: gv(formData, "ends_at"),
    internal_notes: gv(formData, "internal_notes"),
  };
}

export async function createSessionAction(
  _prev: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canMutateSchedule(ctx.roleCodes)) {
    return {
      ok: false,
      message: "Δεν έχετε δικαίωμα δημιουργίας συνεδρίας (απαιτείται γραμματεία ή διοίκηση).",
      fieldErrors: {},
    };
  }

  const raw = formToSessionPayload(formData);
  const parsed = sessionFormSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const okOrg = await userBelongsToOrganization(parsed.data.organization_id);
  if (!okOrg) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const supabase = await createClient();
  const conflicts = await findSessionConflicts(supabase, {
    organizationId: parsed.data.organization_id,
    therapistUserId: parsed.data.therapist_user_id,
    roomId: parsed.data.room_id,
    childId: parsed.data.child_id,
    startsAtIso: parsed.data.starts_at,
    endsAtIso: parsed.data.ends_at,
  });

  if (conflicts.length > 0) {
    const message = [...new Set(conflicts.map((c) => c.message))].join(" ");
    return {
      ok: false,
      message,
      fieldErrors: {},
    };
  }

  const insertRow = {
    organization_id: parsed.data.organization_id,
    center_id: parsed.data.center_id,
    room_id: parsed.data.room_id,
    child_id: parsed.data.child_id,
    therapist_user_id: parsed.data.therapist_user_id,
    discipline_code: parsed.data.discipline_code,
    session_kind: parsed.data.session_kind,
    status: parsed.data.status,
    starts_at: parsed.data.starts_at,
    ends_at: parsed.data.ends_at,
    internal_notes: parsed.data.internal_notes,
  };

  const { data, error } = await supabase.from("sessions").insert(insertRow).select("id").single();

  if (error) {
    console.error("createSessionAction", error.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε RLS ή δεδομένα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/schedule");
  redirect(`/schedule/${data.id}`);
}

export async function updateSessionAction(
  _prev: SessionFormState,
  formData: FormData
): Promise<SessionFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }

  const sessionId = gv(formData, "session_id");
  if (!sessionId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό συνεδρίας." };
  }

  const { session: existing, error: loadErr } = await getSessionById(sessionId);
  if (loadErr || !existing) {
    return { ...initial, ok: false, message: "Η συνεδρία δεν βρέθηκε." };
  }

  const canEdit =
    canMutateSchedule(ctx.roleCodes) ||
    (canTherapistEditOwnSessions(ctx.roleCodes) && existing.therapist_user_id === ctx.user.id) ||
    isSupervisor(ctx.roleCodes);

  if (!canEdit) {
    return {
      ok: false,
      message: "Δεν έχετε δικαίωμα επεξεργασίας αυτής της συνεδρίας.",
      fieldErrors: {},
    };
  }

  const raw = formToSessionPayload(formData);
  const parsed = sessionFormSchema.safeParse({
    ...raw,
    organization_id: existing.organization_id,
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const conflicts = await findSessionConflicts(supabase, {
    organizationId: parsed.data.organization_id,
    excludeSessionId: sessionId,
    therapistUserId: parsed.data.therapist_user_id,
    roomId: parsed.data.room_id,
    childId: parsed.data.child_id,
    startsAtIso: parsed.data.starts_at,
    endsAtIso: parsed.data.ends_at,
  });

  if (conflicts.length > 0) {
    const message = [...new Set(conflicts.map((c) => c.message))].join(" ");
    return {
      ok: false,
      message,
      fieldErrors: {},
    };
  }

  const { error } = await supabase
    .from("sessions")
    .update({
      center_id: parsed.data.center_id,
      room_id: parsed.data.room_id,
      child_id: parsed.data.child_id,
      therapist_user_id: parsed.data.therapist_user_id,
      discipline_code: parsed.data.discipline_code,
      session_kind: parsed.data.session_kind,
      status: parsed.data.status,
      starts_at: parsed.data.starts_at,
      ends_at: parsed.data.ends_at,
      internal_notes: parsed.data.internal_notes,
    })
    .eq("id", sessionId);

  if (error) {
    console.error("updateSessionAction", error.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/schedule");
  revalidatePath(`/schedule/${sessionId}`);
  revalidatePath(`/schedule/${sessionId}/edit`);
  redirect(`/schedule/${sessionId}`);
}
