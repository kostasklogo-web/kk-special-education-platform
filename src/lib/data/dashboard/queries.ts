import "server-only";

import { createClient } from "@/lib/supabase/server";
import { getAuthGatingTemporarilyDisabled } from "@/lib/config/demo";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { listSessionsWithAttendance } from "@/lib/data/attendance/queries";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import type { AttendanceSessionRow, AttendanceStatus } from "@/lib/data/attendance/types";
import {
  addDaysAthensCalendar,
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import { athensWeekRangeFromWeekContaining } from "@/lib/schedule/range";
import { buildAttendanceHref } from "@/lib/attendance/search-params";
import { buildSessionNotesHref } from "@/lib/session-notes/search-params";

export type DashboardMetric = {
  label: string;
  value: number;
  helper: string;
};

export type DashboardOperationalAlert = {
  id: string;
  label: string;
  value: number;
  helper: string;
  href: string;
  tone: "neutral" | "attention" | "positive";
};

export type DashboardOverview = {
  metrics: DashboardMetric[];
  /** Σημερινές συνεδρίες με κατάσταση παρουσίας (για πίνακα και KPI). */
  todaySessions: AttendanceSessionRow[];
  operationalAlerts: DashboardOperationalAlert[];
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
    { label: "Ενεργοί φάκελοι παιδιών", value: 7, helper: "Ωφελούμενοι με ενεργό πρόγραμμα στο κέντρο" },
    { label: "Οικογένειες (γονείς)", value: 8, helper: "Καταχωρημένοι γονείς και κηδεμόνες" },
    { label: "Συνεδρίες σήμερα", value: 2, helper: "Πρόγραμμα ημέρας ανά κέντρο" },
    { label: "Πρόγραμμα 14 ημερών", value: 12, helper: "Προγραμματισμένες συνεδρίες (επόμενες δύο εβδομάδες)" },
    { label: "Ανοιχτοί θεραπευτικοί στόχοι", value: 7, helper: "Στόχοι σε εξέλιξη ή σε αναμονή" },
    { label: "Σημειώσεις σε πρόχειρο", value: 1, helper: "Απαιτούν ολοκλήρωση ή έλεγχο" },
    { label: "Θεραπευτική ομάδα", value: 8, helper: "Ενεργά μέλη προσωπικού" },
    { label: "Αίθουσες θεραπείας", value: 5, helper: "Καταχωρημένοι χώροι παρέμβασης" },
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
      attendance: {
        session_id: "50000000-0000-4000-8000-000000000001",
        organization_id: "10000000-0000-4000-8000-000000000001",
        status: "present",
        recorded_by_user_id: null,
        checked_in_at: null,
        notes: null,
        actual_starts_at: null,
        actual_ends_at: null,
        created_at: "2026-05-12T06:00:00Z",
        updated_at: "2026-05-12T06:00:00Z",
      },
      recorded_by_name: null,
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
      attendance: null,
      recorded_by_name: null,
    },
  ],
  operationalAlerts: [
    {
      id: "pending_attendance",
      label: "Παρουσίες προς καταχώρηση (σήμερα)",
      value: 1,
      helper: "Συνεδρίες σήμερα με αναμενόμενη ή κενή παρουσία.",
      href: "/attendance",
      tone: "attention",
    },
    {
      id: "week_makeup",
      label: "Αναπληρώσεις (εβδομάδα)",
      value: 0,
      helper: "Συνεδρίες με παρουσία «προς αναπλήρωση».",
      href: "/attendance?view=list",
      tone: "neutral",
    },
    {
      id: "draft_notes",
      label: "Σημειώσεις σε πρόχειρο",
      value: 1,
      helper: "Απαιτούν ολοκλήρωση ή έλεγχο.",
      href: "/session-notes",
      tone: "attention",
    },
    {
      id: "pending_reports",
      label: "Αναφορές σε εκκρεμότητα",
      value: 2,
      helper: "Πρόχειρο / προς έλεγχο.",
      href: "/reports?status=open",
      tone: "attention",
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
    { label: "Εύοσμος Θεσσαλονίκης", used: 3, total: 5, helper: "Χρήση αιθουσών βάσει σημερινού προγράμματος" },
    { label: "Νίκαια", used: 2, total: 5, helper: "Απογευματινή ζώνη · διαθέσιμες θέσεις" },
  ],
  therapistWorkloads: [
    { therapistName: "Μαρία Παπαδοπούλου", discipline: "Λογοθεραπεία", sessions: 4, helper: "Δύο ολοκληρωμένες, δύο προγραμματισμένες" },
    { therapistName: "Ανδρέας Νικολάου", discipline: "Εργοθεραπεία", sessions: 3, helper: "Μία εκκρεμής καταχώρηση παρουσίας" },
    { therapistName: "Ιωάννα Ράπτη", discipline: "Ειδική Διαπαιδαγώγηση", sessions: 3, helper: "Δύο ατομικές, μία αναπλήρωση" },
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
  const preferDemo =
    getAuthGatingTemporarilyDisabled() && !(await isSupabaseReachableQuickly());

  if (preferDemo) {
    return DEMO_DASHBOARD_OVERVIEW;
  }

  try {
    const live = await getLiveDashboardOverview(organizationId);
    if (getAuthGatingTemporarilyDisabled() && live.errors.length >= 4) {
      return DEMO_DASHBOARD_OVERVIEW;
    }
    return live;
  } catch (err) {
    console.error("getDashboardOverview", err);
    return DEMO_DASHBOARD_OVERVIEW;
  }
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
    todayWithAttendance,
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
    listSessionsWithAttendance({ organizationId, fromIso: todayRange.fromIso, toIso: todayRange.toIso }),
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
    todayWithAttendance.error,
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

  const weekMakeupCount = weekAttendance.items.filter((row) => row.attendance?.status === "to_makeup").length;

  const pendingAttendanceToday = todayWithAttendance.items.filter((row) => {
    if (row.status === "cancelled") return false;
    return !row.attendance || row.attendance.status === "expected";
  }).length;

  const operationalAlerts: DashboardOperationalAlert[] = [
    {
      id: "pending_attendance",
      label: "Παρουσίες προς καταχώρηση (σήμερα)",
      value: pendingAttendanceToday,
      helper: "Συνεδρίες σήμερα με αναμενόμενη ή κενή παρουσία (εκτός ακυρωμένων).",
      href: buildAttendanceHref({
        view: "day",
        dateYmd: todayYmd,
        filters: { attendanceStatus: "expected" },
      }),
      tone: pendingAttendanceToday > 0 ? "attention" : "neutral",
    },
    {
      id: "week_makeup",
      label: "Αναπληρώσεις (εβδομάδα)",
      value: weekMakeupCount,
      helper: "Συνεδρίες με παρουσία «προς αναπλήρωση» στην τρέχουσα εβδομάδα.",
      href: buildAttendanceHref({
        view: "list",
        dateYmd: todayYmd,
        filters: { attendanceStatus: "to_makeup" },
      }),
      tone: weekMakeupCount > 0 ? "attention" : "neutral",
    },
    {
      id: "draft_notes",
      label: "Σημειώσεις σε πρόχειρο",
      value: draftNotes.count,
      helper: "Απαιτούν ολοκλήρωση ή έλεγχο πριν την κοινοποίηση.",
      href: buildSessionNotesHref({ dateYmd: todayYmd, filters: {} }),
      tone: draftNotes.count > 0 ? "attention" : "neutral",
    },
    {
      id: "pending_reports",
      label: "Αναφορές σε εκκρεμότητα",
      value: pendingReports.count,
      helper: "Πρόχειρο, σε αναμονή ή προς έλεγχο.",
      href: "/reports?status=open",
      tone: pendingReports.count > 0 ? "attention" : "neutral",
    },
  ];

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

  const todayItems = todayWithAttendance.items;
  const todayRoomIds = new Set(todayItems.map((session) => session.room_id).filter(Boolean));
  const centerUsage = new Map<string, number>();
  for (const session of todayItems) {
    const centerName = session.center_name ?? "Χωρίς κέντρο";
    centerUsage.set(centerName, (centerUsage.get(centerName) ?? 0) + 1);
  }

  return {
    metrics: [
      {
        label: "Ενεργοί φάκελοι παιδιών",
        value: childrenCount.count,
        helper: "Ωφελούμενοι με ενεργό πρόγραμμα στο κέντρο",
      },
      {
        label: "Οικογένειες (γονείς)",
        value: parentsCount.count,
        helper: "Καταχωρημένοι γονείς και κηδεμόνες",
      },
      {
        label: "Συνεδρίες σήμερα",
        value: todayItems.length,
        helper: "Πρόγραμμα ημέρας ανά κέντρο",
      },
      {
        label: "Πρόγραμμα 14 ημερών",
        value: upcomingSessions.items.length,
        helper: "Προγραμματισμένες συνεδρίες (επόμενες δύο εβδομάδες)",
      },
      {
        label: "Ανοιχτοί θεραπευτικοί στόχοι",
        value: openGoals.count,
        helper: "Στόχοι σε εξέλιξη ή σε αναμονή",
      },
      {
        label: "Σημειώσεις σε πρόχειρο",
        value: draftNotes.count,
        helper: "Απαιτούν ολοκλήρωση ή έλεγχο",
      },
      {
        label: "Θεραπευτική ομάδα",
        value: staffCount.count,
        helper: "Ενεργά μέλη προσωπικού",
      },
      {
        label: "Αίθουσες θεραπείας",
        value: roomsCount.count,
        helper: "Καταχωρημένοι χώροι παρέμβασης",
      },
    ],
    todaySessions: todayItems.slice(0, 12),
    operationalAlerts,
    attendanceSummary,
    occupancy: [...centerUsage.entries()].map(([label, used]) => ({
      label,
      used,
      total: Math.max(roomsCount.count, todayRoomIds.size, 1),
      helper: "Χρήση χώρων βάσει σημερινού προγράμματος",
    })),
    therapistWorkloads: [...workloadByTherapist.entries()]
      .map(([therapistName, value]) => ({
        therapistName,
        discipline: value.discipline,
        sessions: value.sessions,
        helper: value.sessions >= 5 ? "Αυξημένη εβδομαδιαία φόρτιση" : "Φόρτιση εντός τυπικών ορίων",
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
