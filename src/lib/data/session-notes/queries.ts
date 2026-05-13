import "server-only";

import type { RoleCode } from "@/lib/auth/roles";
import { canManagementSessionNotes } from "@/lib/auth/session-notes-permissions";
import { createClient } from "@/lib/supabase/server";
import type { SessionFilters } from "@/lib/data/sessions/types";
import { getSessionById, listSessionsInRange } from "@/lib/data/sessions/queries";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteFilters, SessionNoteListItem, SessionNoteRow } from "@/lib/data/session-notes/types";
import { addDaysAthensCalendar, athensStartOfDayUtcIso, todayAthensYmd } from "@/lib/schedule/athens-civil";
import { athensWeekRangeFromWeekContaining } from "@/lib/schedule/range";

function mapNoteRow(r: Record<string, unknown>): SessionNoteRow {
  const rawLinked = r.linked_goal_ids as string[] | null | undefined;
  const linked_goal_ids = Array.isArray(rawLinked) ? rawLinked.filter((x) => typeof x === "string") : [];
  return {
    id: r.id as string,
    organization_id: r.organization_id as string,
    session_id: r.session_id as string,
    author_user_id: r.author_user_id as string,
    status: r.status as SessionNoteRow["status"],
    linked_goal_ids,
    body: (r.body as string) ?? "",
    goals_worked: (r.goals_worked as string) ?? "",
    activities: (r.activities as string) ?? "",
    child_response: (r.child_response as string) ?? "",
    observations: (r.observations as string) ?? "",
    suggestions_next: (r.suggestions_next as string) ?? "",
    visible_to_supervisor: Boolean(r.visible_to_supervisor ?? true),
    visible_to_parent: Boolean(r.visible_to_parent ?? false),
    finalized_at: (r.finalized_at as string) ?? null,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
    deleted_at: (r.deleted_at as string) ?? null,
  };
}

export async function listSessionNotesForOrganization(params: {
  organizationId: string;
  dateYmdAnchor: string;
  filters?: SessionNoteFilters;
}): Promise<{ items: SessionNoteListItem[]; error: string | null }> {
  const { fromIso, toIso } = athensWeekRangeFromWeekContaining(params.dateYmdAnchor);

  const sessionFilters: SessionFilters = {
    status: "completed",
    childId: params.filters?.childId,
    therapistId: params.filters?.therapistId,
    disciplineCode: params.filters?.disciplineCode,
  };

  const { items: sessions, error: sErr } = await listSessionsInRange({
    organizationId: params.organizationId,
    fromIso,
    toIso,
    filters: sessionFilters,
  });

  if (sErr) {
    return { items: [], error: sErr };
  }
  if (sessions.length === 0) {
    return { items: [], error: null };
  }

  const supabase = await createClient();
  const sessionIds = sessions.map((s) => s.id);

  const { data: notes, error: nErr } = await supabase
    .from("session_notes")
    .select(
      "id, organization_id, session_id, author_user_id, status, linked_goal_ids, body, goals_worked, activities, child_response, observations, suggestions_next, visible_to_supervisor, visible_to_parent, finalized_at, created_at, updated_at, deleted_at"
    )
    .in("session_id", sessionIds)
    .is("deleted_at", null);

  if (nErr) {
    console.error("listSessionNotesForOrganization", nErr.message);
    return { items: [], error: "Αποτυχία φόρτωσης σημειώσεων." };
  }

  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const authorIds = [...new Set((notes ?? []).map((n) => (n as { author_user_id: string }).author_user_id))];
  const profiles = new Map<string, string | null>();
  if (authorIds.length > 0) {
    const { data: profs } = await supabase.from("profiles").select("id, display_name").in("id", authorIds);
    for (const p of profs ?? []) {
      const row = p as { id: string; display_name: string | null };
      profiles.set(row.id, row.display_name);
    }
  }

  const items: SessionNoteListItem[] = (notes ?? [])
    .map((raw) => {
      const n = mapNoteRow(raw as Record<string, unknown>);
      const s = sessionById.get(n.session_id);
      if (!s) return null;
      return {
        ...n,
        session_starts_at: s.starts_at,
        session_therapist_user_id: s.therapist_user_id,
        child_name: s.child_name,
        therapist_name: s.therapist_name,
        discipline_name_el: s.discipline_name_el,
        discipline_code: s.discipline_code,
        author_display_name: profiles.get(n.author_user_id) ?? null,
      };
    })
    .filter(Boolean) as SessionNoteListItem[];

  items.sort((a, b) => b.session_starts_at.localeCompare(a.session_starts_at));

  return { items, error: null };
}

export async function listCompletedSessionsWithoutNote(params: {
  organizationId: string;
  userId: string;
  roleCodes: RoleCode[];
}): Promise<{ items: SessionListItem[]; error: string | null }> {
  const anchor = todayAthensYmd();
  const fromYmd = addDaysAthensCalendar(anchor, -180);
  const fromIso = athensStartOfDayUtcIso(fromYmd);
  const toIso = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const sessionFilters: SessionFilters = { status: "completed" };
  if (!canManagementSessionNotes(params.roleCodes)) {
    sessionFilters.therapistId = params.userId;
  }

  const { items: sessions, error } = await listSessionsInRange({
    organizationId: params.organizationId,
    fromIso,
    toIso,
    filters: sessionFilters,
  });

  if (error || sessions.length === 0) {
    return { items: [], error };
  }

  const supabase = await createClient();
  const ids = sessions.map((s) => s.id);
  const { data: existing, error: eErr } = await supabase
    .from("session_notes")
    .select("session_id")
    .in("session_id", ids)
    .is("deleted_at", null);

  if (eErr) {
    console.error("listCompletedSessionsWithoutNote", eErr.message);
    return { items: [], error: "Αποτυχία ελέγχου υπαρχουσών σημειώσεων." };
  }

  const taken = new Set((existing ?? []).map((r) => (r as { session_id: string }).session_id));
  const eligible = sessions.filter((s) => !taken.has(s.id));

  return { items: eligible, error: null };
}

export async function getSessionNoteById(noteId: string): Promise<{
  note: SessionNoteRow | null;
  session: SessionListItem | null;
  author_display_name: string | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data: raw, error } = await supabase
    .from("session_notes")
    .select(
      "id, organization_id, session_id, author_user_id, status, linked_goal_ids, body, goals_worked, activities, child_response, observations, suggestions_next, visible_to_supervisor, visible_to_parent, finalized_at, created_at, updated_at, deleted_at"
    )
    .eq("id", noteId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getSessionNoteById", error.message);
    return { note: null, session: null, author_display_name: null, error: "Αποτυχία φόρτωσης σημείωσης." };
  }
  if (!raw) {
    return { note: null, session: null, author_display_name: null, error: null };
  }

  const note = mapNoteRow(raw as Record<string, unknown>);
  const { session, error: sErr } = await getSessionById(note.session_id);
  if (sErr) {
    return { note: null, session: null, author_display_name: null, error: sErr };
  }

  let author_display_name: string | null = null;
  const { data: prof } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", note.author_user_id)
    .maybeSingle();
  author_display_name = (prof as { display_name: string | null } | null)?.display_name ?? null;

  return { note, session, author_display_name, error: null };
}
