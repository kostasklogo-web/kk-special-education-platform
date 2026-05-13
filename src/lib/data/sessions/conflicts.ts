import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

export type ConflictCheckInput = {
  organizationId: string;
  excludeSessionId?: string | null;
  therapistUserId: string;
  roomId: string | null;
  childId: string;
  startsAtIso: string;
  endsAtIso: string;
};

export type SessionConflict = {
  type: "therapist" | "room" | "child";
  message: string;
  conflictingSessionId: string;
};

const BLOCKING_STATUSES = ["scheduled", "completed", "absence", "no_show"];

export async function findSessionConflicts(
  supabase: SupabaseClient,
  input: ConflictCheckInput
): Promise<SessionConflict[]> {
  const { organizationId, excludeSessionId, therapistUserId, roomId, childId, startsAtIso, endsAtIso } =
    input;

  let q = supabase
    .from("sessions")
    .select("id, therapist_user_id, room_id, child_id, starts_at, ends_at, status")
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .lt("starts_at", endsAtIso)
    .gt("ends_at", startsAtIso)
    .in("status", BLOCKING_STATUSES);

  if (excludeSessionId) {
    q = q.neq("id", excludeSessionId);
  }

  const { data, error } = await q;

  if (error) {
    console.error("findSessionConflicts", error.message);
    return [];
  }

  const rows = (data ?? []) as {
    id: string;
    therapist_user_id: string;
    room_id: string | null;
    child_id: string;
  }[];

  const conflicts: SessionConflict[] = [];

  for (const row of rows) {
    if (row.therapist_user_id === therapistUserId) {
      conflicts.push({
        type: "therapist",
        message: "Ο θεραπευτής έχει ήδη άλλη συνεδρία σε αυτή τη χρονική στιγμή.",
        conflictingSessionId: row.id,
      });
    }
    if (roomId && row.room_id && row.room_id === roomId) {
      conflicts.push({
        type: "room",
        message: "Η αίθουσα είναι ήδη κρατημένη σε αυτή τη χρονική στιγμή.",
        conflictingSessionId: row.id,
      });
    }
    if (row.child_id === childId) {
      conflicts.push({
        type: "child",
        message: "Το παιδί έχει ήδη άλλη συνεδρία σε αυτή τη χρονική στιγμή.",
        conflictingSessionId: row.id,
      });
    }
  }

  return conflicts;
}
