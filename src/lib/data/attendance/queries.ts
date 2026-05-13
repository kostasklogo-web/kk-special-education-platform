import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { SessionFilters } from "@/lib/data/sessions/types";
import { getSessionById, listSessionsInRange } from "@/lib/data/sessions/queries";
import type {
  AttendanceDetail,
  AttendanceListFilters,
  AttendanceRow,
  AttendanceSessionRow,
} from "@/lib/data/attendance/types";

function effectiveAttendanceStatus(att: AttendanceRow | null): AttendanceRow["status"] {
  return att?.status ?? "expected";
}

export async function listSessionsWithAttendance(params: {
  organizationId: string;
  fromIso: string;
  toIso: string;
  filters?: AttendanceListFilters;
}): Promise<{ items: AttendanceSessionRow[]; error: string | null }> {
  const sessionFilters: SessionFilters = {
    centerId: params.filters?.centerId,
    therapistId: params.filters?.therapistId,
    childId: params.filters?.childId,
  };

  const { items: sessions, error: sErr } = await listSessionsInRange({
    organizationId: params.organizationId,
    fromIso: params.fromIso,
    toIso: params.toIso,
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

  const { data: attRows, error: aErr } = await supabase
    .from("attendance")
    .select(
      "session_id, organization_id, status, recorded_by_user_id, checked_in_at, notes, actual_starts_at, actual_ends_at, created_at, updated_at"
    )
    .in("session_id", sessionIds);

  if (aErr) {
    console.error("listSessionsWithAttendance attendance", aErr.message);
    return { items: [], error: "Αποτυχία φόρτωσης παρουσιών." };
  }

  const bySession = new Map<string, AttendanceRow>(
    (attRows ?? []).map((r) => [r.session_id as string, r as AttendanceRow])
  );

  const recorderIds = [
    ...new Set(
      (attRows ?? [])
        .map((r) => (r as { recorded_by_user_id: string | null }).recorded_by_user_id)
        .filter(Boolean)
    ),
  ] as string[];

  const profiles = new Map<string, string | null>();
  if (recorderIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", recorderIds);
    for (const p of profs ?? []) {
      const row = p as { id: string; display_name: string | null };
      profiles.set(row.id, row.display_name);
    }
  }

  let merged: AttendanceSessionRow[] = sessions.map((s) => {
    const att = bySession.get(s.id) ?? null;
    return {
      ...s,
      attendance: att,
      recorded_by_name: att?.recorded_by_user_id
        ? profiles.get(att.recorded_by_user_id) ?? null
        : null,
    };
  });

  const st = params.filters?.attendanceStatus;
  if (st) {
    merged = merged.filter((r) => effectiveAttendanceStatus(r.attendance) === st);
  }

  return { items: merged, error: null };
}

export async function getAttendanceDetail(sessionId: string): Promise<{
  detail: AttendanceDetail | null;
  error: string | null;
}> {
  const { session, error: sErr } = await getSessionById(sessionId);
  if (sErr) {
    return { detail: null, error: sErr };
  }
  if (!session) {
    return { detail: null, error: null };
  }

  const supabase = await createClient();
  const { data: att, error: aErr } = await supabase
    .from("attendance")
    .select(
      "session_id, organization_id, status, recorded_by_user_id, checked_in_at, notes, actual_starts_at, actual_ends_at, created_at, updated_at"
    )
    .eq("session_id", sessionId)
    .maybeSingle();

  if (aErr) {
    console.error("getAttendanceDetail attendance", aErr.message);
    return { detail: null, error: "Αποτυχία φόρτωσης παρουσίας." };
  }

  const attendance = att as AttendanceRow | null;
  let recorded_by_name: string | null = null;
  if (attendance?.recorded_by_user_id) {
    const { data: p } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", attendance.recorded_by_user_id)
      .maybeSingle();
    recorded_by_name = (p as { display_name: string | null } | null)?.display_name ?? null;
  }

  return {
    detail: { session, attendance, recorded_by_name },
    error: null,
  };
}
