"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  canEditSessionNote,
  canWriteSessionNotes,
} from "@/lib/auth/session-notes-permissions";
import { userBelongsToOrganization } from "@/lib/data/children/org-membership";
import { getSessionById } from "@/lib/data/sessions/queries";
import { getSessionNoteById } from "@/lib/data/session-notes/queries";
import { createClient } from "@/lib/supabase/server";
import {
  formatSessionNoteZodErrors,
  sessionNoteFormSchema,
} from "@/lib/validation/session-note-form";

export type SessionNoteFormState = {
  ok: boolean;
  message: string | null;
  fieldErrors: Record<string, string>;
};

const initial: SessionNoteFormState = {
  ok: false,
  message: null,
  fieldErrors: {},
};

function gv(formData: FormData, key: string): string {
  const v = formData.get(key);
  if (v === null || v === undefined) return "";
  return String(v);
}

function boolFromHidden(formData: FormData, key: string, fallback: boolean): boolean {
  const v = formData.get(key);
  if (v === "true") return true;
  if (v === "false") return false;
  return fallback;
}

export async function createSessionNoteAction(
  _prev: SessionNoteFormState,
  formData: FormData
): Promise<SessionNoteFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }
  if (!canWriteSessionNotes(ctx.roleCodes)) {
    return { ok: false, message: "Δεν έχετε δικαίωμα δημιουργίας σημείωσης.", fieldErrors: {} };
  }

  const linked_goal_ids = formData.getAll("linked_goal_ids").map((v) => String(v)).filter(Boolean);

  const raw = {
    session_id: gv(formData, "session_id"),
    status: gv(formData, "status") || "draft",
    linked_goal_ids,
    goals_worked: gv(formData, "goals_worked"),
    activities: gv(formData, "activities"),
    child_response: gv(formData, "child_response"),
    observations: gv(formData, "observations"),
    suggestions_next: gv(formData, "suggestions_next"),
    visible_to_supervisor: boolFromHidden(formData, "visible_to_supervisor", true),
    visible_to_parent: boolFromHidden(formData, "visible_to_parent", false),
    body: gv(formData, "body"),
  };

  const parsed = sessionNoteFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatSessionNoteZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { session, error: sErr } = await getSessionById(parsed.data.session_id);
  if (sErr || !session) {
    return { ...initial, ok: false, message: "Η συνεδρία δεν βρέθηκε." };
  }

  if (session.status !== "completed") {
    return {
      ok: false,
      message: "Οι σημειώσεις επιτρέπονται μόνο για ολοκληρωμένες συνεδρίες.",
      fieldErrors: {},
    };
  }

  const orgOk = await userBelongsToOrganization(session.organization_id);
  if (!orgOk) {
    return { ok: false, message: "Δεν έχετε δικαίωμα για αυτόν τον οργανισμό.", fieldErrors: {} };
  }

  const goalIds = [...new Set(parsed.data.linked_goal_ids)];
  if (goalIds.length > 0) {
    const { data: okGoals, error: gErr } = await supabase
      .from("therapy_goals")
      .select("id")
      .in("id", goalIds)
      .eq("child_id", session.child_id)
      .is("deleted_at", null);

    if (gErr || !okGoals || okGoals.length !== goalIds.length) {
      return {
        ok: false,
        message: "Οι επιλεγμένοι στόχοι πρέπει να ανήκουν στο ίδιο παιδί με τη συνεδρία.",
        fieldErrors: { linked_goal_ids: "Μη έγκυρη επιλογή στόχων." },
      };
    }
  }

  const { data: dup } = await supabase
    .from("session_notes")
    .select("id")
    .eq("session_id", parsed.data.session_id)
    .is("deleted_at", null)
    .maybeSingle();

  if (dup) {
    return {
      ok: false,
      message: "Υπάρχει ήδη σημείωση για αυτή τη συνεδρία. Ανοίξτε την υπάρχουσα για επεξεργασία.",
      fieldErrors: {},
    };
  }

  const finalizedAt =
    parsed.data.status === "finalized" ? new Date().toISOString() : null;

  const insertRow = {
    organization_id: session.organization_id,
    session_id: parsed.data.session_id,
    author_user_id: ctx.user.id,
    status: parsed.data.status,
    linked_goal_ids: goalIds,
    body: parsed.data.body,
    goals_worked: parsed.data.goals_worked,
    activities: parsed.data.activities,
    child_response: parsed.data.child_response,
    observations: parsed.data.observations,
    suggestions_next: parsed.data.suggestions_next,
    visible_to_supervisor: parsed.data.visible_to_supervisor,
    visible_to_parent: parsed.data.visible_to_parent,
    finalized_at: finalizedAt,
  };

  const { data: created, error: insErr } = await supabase
    .from("session_notes")
    .insert(insertRow)
    .select("id")
    .single();

  if (insErr) {
    console.error("createSessionNoteAction", insErr.message);
    return {
      ok: false,
      message: "Η αποθήκευση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/session-notes");
  revalidatePath("/therapy-goals");
  revalidatePath(`/children/${session.child_id}`);
  redirect(`/session-notes/${created.id}`);
}

export async function updateSessionNoteAction(
  _prev: SessionNoteFormState,
  formData: FormData
): Promise<SessionNoteFormState> {
  const ctx = await getSessionContext();
  if (!ctx.user) {
    return { ok: false, message: "Απαιτείται σύνδεση.", fieldErrors: {} };
  }

  const noteId = gv(formData, "note_id");
  if (!noteId) {
    return { ...initial, ok: false, message: "Λείπει αναγνωριστικό σημείωσης." };
  }

  const { note: existing, session, error: loadErr } = await getSessionNoteById(noteId);
  if (loadErr || !existing || !session) {
    return { ...initial, ok: false, message: "Η σημείωση δεν βρέθηκε." };
  }

  if (!canEditSessionNote(ctx.roleCodes, ctx.user.id, session.therapist_user_id, existing.author_user_id)) {
    return {
      ok: false,
      message: "Δεν έχετε δικαίωμα επεξεργασίας αυτής της σημείωσης.",
      fieldErrors: {},
    };
  }

  if (session.status !== "completed") {
    return {
      ok: false,
      message: "Η συνεδρία δεν είναι ολοκληρωμένη.",
      fieldErrors: {},
    };
  }

  const linked_goal_ids_edit = formData.getAll("linked_goal_ids").map((v) => String(v)).filter(Boolean);

  const raw = {
    session_id: existing.session_id,
    status: gv(formData, "status") || "draft",
    linked_goal_ids: linked_goal_ids_edit,
    goals_worked: gv(formData, "goals_worked"),
    activities: gv(formData, "activities"),
    child_response: gv(formData, "child_response"),
    observations: gv(formData, "observations"),
    suggestions_next: gv(formData, "suggestions_next"),
    visible_to_supervisor: boolFromHidden(formData, "visible_to_supervisor", true),
    visible_to_parent: boolFromHidden(formData, "visible_to_parent", false),
    body: gv(formData, "body"),
  };

  const parsed = sessionNoteFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Ελέγξτε τα πεδία της φόρμας.",
      fieldErrors: formatSessionNoteZodErrors(parsed.error),
    };
  }

  const goalIdsUp = [...new Set(parsed.data.linked_goal_ids)];
  const supabaseGoals = await createClient();
  if (goalIdsUp.length > 0) {
    const { data: okGoals, error: gErr } = await supabaseGoals
      .from("therapy_goals")
      .select("id")
      .in("id", goalIdsUp)
      .eq("child_id", session.child_id)
      .is("deleted_at", null);

    if (gErr || !okGoals || okGoals.length !== goalIdsUp.length) {
      return {
        ok: false,
        message: "Οι επιλεγμένοι στόχοι πρέπει να ανήκουν στο ίδιο παιδί με τη συνεδρία.",
        fieldErrors: { linked_goal_ids: "Μη έγκυρη επιλογή στόχων." },
      };
    }
  }

  let finalized_at = existing.finalized_at;
  if (parsed.data.status === "finalized" && !finalized_at) {
    finalized_at = new Date().toISOString();
  }
  if (parsed.data.status === "draft") {
    finalized_at = null;
  }

  const supabase = supabaseGoals;
  const { error: upErr } = await supabase
    .from("session_notes")
    .update({
      status: parsed.data.status,
      linked_goal_ids: goalIdsUp,
      body: parsed.data.body,
      goals_worked: parsed.data.goals_worked,
      activities: parsed.data.activities,
      child_response: parsed.data.child_response,
      observations: parsed.data.observations,
      suggestions_next: parsed.data.suggestions_next,
      visible_to_supervisor: parsed.data.visible_to_supervisor,
      visible_to_parent: parsed.data.visible_to_parent,
      finalized_at,
    })
    .eq("id", noteId)
    .is("deleted_at", null);

  if (upErr) {
    console.error("updateSessionNoteAction", upErr.message);
    return {
      ok: false,
      message: "Η ενημέρωση απέτυχε. Ελέγξτε RLS ή δικαιώματα.",
      fieldErrors: {},
    };
  }

  revalidatePath("/session-notes");
  revalidatePath("/therapy-goals");
  revalidatePath(`/session-notes/${noteId}`);
  revalidatePath(`/session-notes/${noteId}/edit`);
  revalidatePath(`/children/${session.child_id}`);
  redirect(`/session-notes/${noteId}`);
}
