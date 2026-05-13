import "server-only";

import { createClient } from "@/lib/supabase/server";
import { AUTH_GATING_TEMPORARILY_DISABLED } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { listSessionsWithAttendance } from "@/lib/data/attendance/queries";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import type { AttendanceStatus } from "@/lib/data/attendance/types";
import type { SessionListItem } from "@/lib/data/sessions/types";
import {
  addDaysAthensCalendar,
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import { athensWeekRangeFromWeekContaining } from "@/lib/schedule/range";

export type DashboardMetric = {
  label: string;
  value: number;
  helper: string;
};

export type DashboardOverview = {
  metrics: DashboardMetric[];
  todaySessions: SessionListItem[];
  attendanceSummary: Record<AttendanceStatus, number>;
  occupancy: {
    label: string;
    used: number;
    total: number;
    helper: string;
  }[];
  therapistWorkloads: {
    therapistName: string;
    discipline: string;
    sessions: number;
    helper: string;
  }[];
  openGoalCount: number;
  draftNoteCount: number;
  pendingReportCount: number;
  errors: string[];
};

const DEMO_DASHBOARD_OVERVIEW: DashboardOverview = {
  metrics: [
    { label: "Ενεργά παιδιά", value: 7, helper: "Φάκελοι σε ενεργό ή προσωρινό πρόγραμμα" },
    { label: "Γονείς / κηδεμόνες", value: 8, helper: "Συνδεδεμένες οικογένειες" },
    { label: "Συνεδρίες σήμερα", value: 2, helper: "Πρόγραμμα ημέρας" },
    { label: "Επόμενες 14 ημέρες", value: 12, helper: "Προγραμματισμένες συνεδρίες" },
    { label: "Ανοιχτοί στόχοι", value: 7, helper: "Ενεργοί ή σε εξέλιξη" },
    { label: "Πρόχειρες σημειώσεις", value: 1, helper: "Χρειάζονται ολοκλήρωση" },
    { label: "Προσωπικό", value: 8, helper: "Ενεργές εγγραφές ομάδας" },
    { label: "Αίθουσες", value: 5, helper: "Διαθέσιμοι χώροι" },
  ],
  todaySessions: [
    {
      id: "50000000-0000-4000-8000-000000000001",
      organization_id: "10000000-0000-4000-8000-000000000001",
      center_id: "11000000-0000-4000-8000-000000000001",
      room_id: "12000000-0000-4000-8000-000000000001",
      child_id: "30000000-0000-4000-8000-000000000001",
      therapist_user_id: "20000000-0000-4000-8000-000000000001",
      discipline_code: "speech_therapy",
      starts_at: "2026-05-12T06:00:00Z",
      ends_at: "2026-05-12T06:45:00Z",
      status: "completed",
      session_kind: "individual",
      internal_notes: "Demo ολοκληρωμένη συνεδρία.",
      created_at: "2026-05-12T06:00:00Z",
      updated_at: "2026-05-12T06:00:00Z",
      deleted_at: null,
      child_name: "Ιωάννου Αλέξανδρος",
      therapist_name: "Μαρία Παπαδοπούλου",
      center_name: "Εύοσμος Θεσσαλονίκης",
      room_name: "Αίθουσα Λογοθεραπείας 1",
      discipline_name_el: "Λογοθεραπεία",
    },
    {
      id: "50000000-0000-4000-8000-000000000002",
      organization_id: "10000000-0000-4000-8000-000000000001",
      center_id: "11000000-0000-4000-8000-000000000001",
      room_id: "12000000-0000-4000-8000-000000000002",
      child_id: "30000000-0000-4000-8000-000000000002",
      therapist_user_id: "20000000-0000-4000-8000-000000000002",
      discipline_code: "occupational_therapy",
      starts_at: "2026-05-12T08:00:00Z",
      ends_at: "2026-05-12T08:45:00Z",
      status: "scheduled",
      session_kind: "individual",
      internal_notes: "Demo προγραμματισμένη συνεδρία.",
      created_at: "2026-05-12T08:00:00Z",
      updated_at: "2026-05-12T08:00:00Z",
      deleted_at: null,
      child_name: "Καραλή Σοφία",
      therapist_name: "Ανδρέας Νικολάου",
      center_name: "Εύοσμος Θεσσαλονίκης",
      room_name: "Αίθουσα Εργοθεραπείας 1",
      discipline_name_el: "Εργοθεραπεία",
    },
  ],
  attendanceSummary: {
    expected: 2,
    present: 1,
    absent: 0,
    cancel_parent: 0,
    cancel_therapist: 0,
    cancel_center: 0,
    to_makeup: 0,
    made_up: 0,
  },
  occupancy: [
    { label: "Εύοσμος Θεσσαλονίκης", used: 3, total: 5, helper: "Πρωινή ζώνη με διαθέσιμες αίθουσες" },
    { label: "Νίκαια", used: 2, total: 5, helper: "Απογευματινή λειτουργία αξιολόγησης" },
  ],
  therapistWorkloads: [
    { therapistName: "Μαρία Παπαδοπούλου", discipline: "Λογοθεραπεία", sessions: 4, helper: "2 ολοκληρωμένες, 2 προγραμματισμένες" },
    { therapistName: "Ανδρέας Νικολάου", discipline: "Εργοθεραπεία", sessions: 3, helper: "1 εκκρεμής παρουσία" },
    { therapistName: "Ιωάννα Ράπτη", discipline: "Ειδική Διαπαιδαγώγηση", sessions: 3, helper: "2 ατομικές, 1 αναπλήρωση" },
  ],
  openGoalCount: 7,
  draftNoteCount: 1,
  pendingReportCount: 2,
  errors: ["Εμφανίζονται demo δεδομένα επειδή η βάση Supabase δεν απάντησε άμεσα."],
};

async function countRows(table: string, organizationId: string): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from(table)
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null);

  if (error) {
    console.error(`dashboard count ${table}`, error.message);
    return { count: 0, error: "Δεν ήταν δυνατή η φόρτωση κάποιων δεικτών." };
  }

  return { count: count ?? 0, error: null };
}

export async function getDashboardOverview(organizationId: string): Promise<DashboardOverview> {
  if (AUTH_GATING_TEMPORARILY_DISABLED) {
    const canReachSupabase = await isSupabaseReachableQuickly();
    if (!canReachSupabase) {
      return DEMO_DASHBOARD_OVERVIEW;
    }
  }

  return getLiveDashboardOverview(organizationId);
}

async function getLiveDashboardOverview(organizationId: string): Promise<DashboardOverview> {
  const todayYmd = todayAthensYmd();
  const todayRange = {
    fromIso: athensStartOfDayUtcIso(todayYmd),
    toIso: athensEndOfDayUtcIso(todayYmd),
  };
  const weekRange = athensWeekRangeFromWeekContaining(todayYmd);
  const upcomingRange = {
    fromIso: todayRange.fromIso,
    toIso: athensEndOfDayUtcIso(addDaysAthensCalendar(todayYmd, 13)),
  };

  const [
    childrenCount,
    parentsCount,
    staffCount,
    roomsCount,
    todaySessions,
    weekAttendance,
    upcomingSessions,
    openGoals,
    draftNotes,
    pendingReports,
  ] = await Promise.all([
    countRows("children", organizationId),
    countRows("parents", organizationId),
    countRows("staff", organizationId),
    countRows("rooms", organizationId),
    listSessionsInRange({ organizationId, fromIso: todayRange.fromIso, toIso: todayRange.toIso }),
    listSessionsWithAttendance({ organizationId, fromIso: weekRange.fromIso, toIso: weekRange.toIso }),
    listSessionsInRange({ organizationId, fromIso: upcomingRange.fromIso, toIso: upcomingRange.toIso }),
    countOpenGoals(organizationId),
    countDraftSessionNotes(organizationId),
    countPendingProgressReports(organizationId),
  ]);

  const errors = [
    childrenCount.error,
    parentsCount.error,
    staffCount.error,
    roomsCount.error,
    todaySessions.error,
    weekAttendance.error,
    upcomingSessions.error,
    openGoals.error,
    draftNotes.error,
    pendingReports.error,
  ].filter(Boolean) as string[];

  const attendanceSummary: Record<AttendanceStatus, number> = {
    expected: 0,
    present: 0,
    absent: 0,
    cancel_parent: 0,
    cancel_therapist: 0,
    cancel_center: 0,
    to_makeup: 0,
    made_up: 0,
  };

  for (const row of weekAttendance.items) {
    const status = row.attendance?.status ?? "expected";
    attendanceSummary[status] += 1;
  }

  const workloadByTherapist = new Map<string, { discipline: string; sessions: number }>();
  for (const session of upcomingSessions.items) {
    const therapistName = session.therapist_name ?? "Χωρίς θεραπευτή";
    const current = workloadByTherapist.get(therapistName) ?? {
      discipline: session.discipline_name_el ?? session.discipline_code,
      sessions: 0,
    };
    current.sessions += 1;
    workloadByTherapist.set(therapistName, current);
  }

  const todayRoomIds = new Set(todaySessions.items.map((session) => session.room_id).filter(Boolean));
  const centerUsage = new Map<string, number>();
  for (const session of todaySessions.items) {
    const centerName = session.center_name ?? "Χωρίς κέντρο";
    centerUsage.set(centerName, (centerUsage.get(centerName) ?? 0) + 1);
  }

  return {
    metrics: [
      {
        label: "Ενεργά παιδιά",
        value: childrenCount.count,
        helper: "Φάκελοι ωφελούμενων στο κέντρο",
      },
      {
        label: "Γονείς / κηδεμόνες",
        value: parentsCount.count,
        helper: "Συνδεδεμένες οικογένειες",
      },
      {
        label: "Συνεδρίες σήμερα",
        value: todaySessions.items.length,
        helper: "Πρόγραμμα ημέρας",
      },
      {
        label: "Επόμενες 14 ημέρες",
        value: upcomingSessions.items.length,
        helper: "Προγραμματισμένες συνεδρίες",
      },
      {
        label: "Ανοιχτοί στόχοι",
        value: openGoals.count,
        helper: "Ενεργοί ή σε εξέλιξη",
      },
      {
        label: "Πρόχειρες σημειώσεις",
        value: draftNotes.count,
        helper: "Χρειάζονται ολοκλήρωση",
      },
      {
        label: "Προσωπικό",
        value: staffCount.count,
        helper: "Ενεργές εγγραφές ομάδας",
      },
      {
        label: "Αίθουσες",
        value: roomsCount.count,
        helper: "Διαθέσιμοι χώροι",
      },
    ],
    todaySessions: todaySessions.items.slice(0, 6),
    attendanceSummary,
    occupancy: [...centerUsage.entries()].map(([label, used]) => ({
      label,
      used,
      total: Math.max(roomsCount.count, todayRoomIds.size, 1),
      helper: "Συνεδρίες ημέρας ανά τοποθεσία",
    })),
    therapistWorkloads: [...workloadByTherapist.entries()]
      .map(([therapistName, value]) => ({
        therapistName,
        discipline: value.discipline,
        sessions: value.sessions,
        helper: value.sessions >= 5 ? "Υψηλή εβδομαδιαία φόρτιση" : "Κανονική φόρτιση MVP",
      }))
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5),
    openGoalCount: openGoals.count,
    draftNoteCount: draftNotes.count,
    pendingReportCount: pendingReports.count,
    errors: [...new Set(errors)],
  };
}

async function countOpenGoals(organizationId: string): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("therapy_goals")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .in("status", ["active", "in_progress", "on_hold"]);

  if (error) {
    console.error("dashboard count therapy_goals", error.message);
    return { count: 0, error: "Δεν ήταν δυνατή η φόρτωση στόχων." };
  }

  return { count: count ?? 0, error: null };
}

async function countDraftSessionNotes(organizationId: string): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("session_notes")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .eq("status", "draft");

  if (error) {
    console.error("dashboard count session_notes", error.message);
    return { count: 0, error: "Δεν ήταν δυνατή η φόρτωση σημειώσεων." };
  }

  return { count: count ?? 0, error: null };
}

async function countPendingProgressReports(organizationId: string): Promise<{ count: number; error: string | null }> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("progress_reports")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId)
    .is("deleted_at", null)
    .in("status", ["draft", "pending", "pending_review"]);

  if (error) {
    return { count: 0, error: null };
  }

  return { count: count ?? 0, error: null };
}
