/**
 * Static demo bundle for Child Clinical Profile visual prototype.
 * Used when Supabase is unavailable or returns sparse data.
 */

import { buildClinicalTimeline } from "@/lib/clinical/child-profile/timeline";
import { computeClinicalAlerts } from "@/lib/clinical/child-profile/alerts";
import {
  buildAssignedSpecialties,
  buildCollaborationBundle,
  buildEvaluationSummary,
  buildGoalProgressMap,
  buildSupervisionBundle,
} from "@/lib/clinical/child-profile/derive";
import type { ClinicalChildProfileBundle } from "@/lib/clinical/child-profile/types";
import { mapClinicalTeamAssignments } from "@/lib/clinical/child-profile/map-clinical-team";
import { DEMO_PRIMARY_CENTER_ID, getDemoOrganizationId } from "@/lib/config/demo";
import {
  DEMO_CLINICAL_CHILD_B_ID,
  DEMO_CLINICAL_CHILD_ID,
} from "@/lib/demo/clinical-demo-ids";
import { buildDemoTherapistAssignmentsSeed } from "@/lib/demo/therapist-assignments-demo";
import type { ChildListItem, ParentLinkRow, TherapyProgramSummary } from "@/lib/data/children/types";
import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import { addDaysAthensCalendar, todayAthensYmd } from "@/lib/schedule/athens-civil";

export { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-demo-ids";

const ORG = getDemoOrganizationId();
const CENTER = DEMO_PRIMARY_CENTER_ID;
const today = todayAthensYmd();

function isoDaysAgo(days: number, hour = 10): string {
  const ymd = addDaysAthensCalendar(today, -days);
  return `${ymd}T${String(hour).padStart(2, "0")}:00:00.000Z`;
}

function buildDemoChild(childId: string): ChildListItem {
  const isChildB = childId === DEMO_CLINICAL_CHILD_B_ID;
  return {
    id: childId,
    organization_id: ORG,
    primary_center_id: CENTER,
    first_name: isChildB ? "Ελένη" : "Νίκος",
    last_name: isChildB ? "Demo" : "Παπαδόπουλος",
    date_of_birth: "2018-03-12",
    gender: "male",
    preferred_language: "el",
    status: "active",
    school_name: "2ο Δημοτικό Νίκαιας",
    school_grade: "Β' Δημοτικού",
    enrollment_start_date: "2024-09-01",
    notes:
      "Κλινική παρακολούθηση διεπιστημονικής ομάδας. Συντονισμός με σχολείο για προσαρμογές στην τάξη.",
    created_at: isoDaysAgo(400),
    updated_at: isoDaysAgo(2),
    deleted_at: null,
    center: { id: CENTER, name: "Κέντρο Νίκαιας" },
  };
}

function buildDemoParents(): ParentLinkRow[] {
  return [
    {
      relationship_id: "rel-demo-1",
      relationship: "mother",
      is_primary: true,
      parent: {
        id: "parent-demo-1",
        first_name: "Μαρία",
        last_name: "Παπαδοπούλου",
        email: "maria.p@example.com",
        phone: "6912345678",
      },
    },
    {
      relationship_id: "rel-demo-2",
      relationship: "father",
      is_primary: false,
      parent: {
        id: "parent-demo-2",
        first_name: "Γιώργος",
        last_name: "Παπαδόπουλος",
        email: "g.papa@example.com",
        phone: "6987654321",
      },
    },
  ];
}

function buildDemoGoals(childId: string): TherapyGoalListItem[] {
  const planId = "plan-demo-1";
  return [
    {
      id: "goal-demo-1",
      organization_id: ORG,
      child_id: childId,
      treatment_plan_id: planId,
      discipline_code: "speech",
      therapist_user_id: "ther-demo-1",
      title: "Εκφραστική γλώσσα σε προτάσεις",
      description: "Διεπιστημονικός στόχος με OT",
      success_criterion: "5 προτάσεις 3-λέξεων σε δομημένη δραστηριότητα, 3/4 συνεδρίες",
      start_date: addDaysAthensCalendar(today, -120),
      target_completion_date: addDaysAthensCalendar(today, 60),
      status: "in_progress",
      priority: "high",
      observations: "",
      created_at: isoDaysAgo(120),
      updated_at: isoDaysAgo(5),
      deleted_at: null,
      child_name: "Παπαδόπουλος Νίκος",
      plan_title: "Πλάνο παρέμβασης 2025–26",
      discipline_name_el: "Λογοθεραπεία",
      therapist_name: "Ελένη Κωνσταντίνου",
    },
    {
      id: "goal-demo-2",
      organization_id: ORG,
      child_id: childId,
      treatment_plan_id: planId,
      discipline_code: "ot",
      therapist_user_id: "ther-demo-2",
      title: "Λεπτή κινητικότητα & γραφή",
      description: null,
      success_criterion: "Ανεξάρτητη κράτηση μολυβιού 10 λεπτά",
      start_date: addDaysAthensCalendar(today, -90),
      target_completion_date: addDaysAthensCalendar(today, 45),
      status: "active",
      priority: "medium",
      observations: "",
      created_at: isoDaysAgo(90),
      updated_at: isoDaysAgo(12),
      deleted_at: null,
      child_name: "Παπαδόπουλος Νίκος",
      plan_title: "Πλάνο παρέμβασης 2025–26",
      discipline_name_el: "Εργοθεραπεία",
      therapist_name: "Γιάννης Αντωνίου",
    },
    {
      id: "goal-demo-3",
      organization_id: ORG,
      child_id: childId,
      treatment_plan_id: planId,
      discipline_code: "psych",
      therapist_user_id: "ther-demo-3",
      title: "Ρύθμιση συναισθηματικής — σχολικό περιβάλλον",
      description: "Κοινός στόχος με εκπαιδευτικό",
      success_criterion: "Χρήση στρατηγικών αυτορρύθμισης σε 2/3 προκλήσεις",
      start_date: addDaysAthensCalendar(today, -60),
      target_completion_date: addDaysAthensCalendar(today, 90),
      status: "active",
      priority: "high",
      observations: "",
      created_at: isoDaysAgo(60),
      updated_at: isoDaysAgo(8),
      deleted_at: null,
      child_name: "Παπαδόπουλος Νίκος",
      plan_title: "Πλάνο παρέμβασης 2025–26",
      discipline_name_el: "Ψυχολογία",
      therapist_name: "Σοφία Δημητρίου",
    },
    {
      id: "goal-demo-4",
      organization_id: ORG,
      child_id: childId,
      treatment_plan_id: planId,
      discipline_code: "speech",
      therapist_user_id: "ther-demo-1",
      title: "Ανάγνωση φωνηενών",
      description: null,
      success_criterion: "Ολοκλήρωση βασικού συνόλου",
      start_date: addDaysAthensCalendar(today, -200),
      target_completion_date: addDaysAthensCalendar(today, -30),
      status: "met",
      priority: "medium",
      observations: "",
      created_at: isoDaysAgo(200),
      updated_at: isoDaysAgo(35),
      deleted_at: null,
      child_name: "Παπαδόπουλος Νίκος",
      plan_title: "Πλάνο παρέμβασης 2025–26",
      discipline_name_el: "Λογοθεραπεία",
      therapist_name: "Ελένη Κωνσταντίνου",
    },
  ];
}

function buildDemoSessions(childId: string): SessionListItem[] {
  const base = {
    organization_id: ORG,
    center_id: CENTER,
    room_id: null,
    child_id: childId,
    child_name: "Παπαδόπουλος Νίκος",
    center_name: "Κέντρο Νίκαιας",
    room_name: null,
    deleted_at: null,
  };
  return [
    {
      ...base,
      id: "sess-eval-1",
      therapist_user_id: "ther-demo-1",
      discipline_code: "speech",
      starts_at: isoDaysAgo(300, 9),
      ends_at: isoDaysAgo(300, 10),
      status: "completed",
      session_kind: "assessment",
      internal_notes: "WISC-V, CELF-5. Μέτρια καθυστέρηση εκφραστικής γλώσσας.",
      created_at: isoDaysAgo(300),
      updated_at: isoDaysAgo(300),
      discipline_name_el: "Λογοθεραπεία",
      therapist_name: "Ελένη Κωνσταντίνου",
    },
    {
      ...base,
      id: "sess-eval-next",
      therapist_user_id: "ther-demo-1",
      discipline_code: "speech",
      starts_at: isoDaysAgo(-14, 11),
      ends_at: isoDaysAgo(-14, 12),
      status: "scheduled",
      session_kind: "assessment",
      internal_notes: null,
      created_at: isoDaysAgo(20),
      updated_at: isoDaysAgo(20),
      discipline_name_el: "Λογοθεραπεία",
      therapist_name: "Ελένη Κωνσταντίνου",
    },
    {
      ...base,
      id: "sess-speech-1",
      therapist_user_id: "ther-demo-1",
      discipline_code: "speech",
      starts_at: isoDaysAgo(7, 15),
      ends_at: isoDaysAgo(7, 16),
      status: "completed",
      session_kind: "individual",
      internal_notes: null,
      created_at: isoDaysAgo(7),
      updated_at: isoDaysAgo(7),
      discipline_name_el: "Λογοθεραπεία",
      therapist_name: "Ελένη Κωνσταντίνου",
    },
    {
      ...base,
      id: "sess-ot-1",
      therapist_user_id: "ther-demo-2",
      discipline_code: "ot",
      starts_at: isoDaysAgo(5, 10),
      ends_at: isoDaysAgo(5, 11),
      status: "completed",
      session_kind: "individual",
      internal_notes: null,
      created_at: isoDaysAgo(5),
      updated_at: isoDaysAgo(5),
      discipline_name_el: "Εργοθεραπεία",
      therapist_name: "Γιάννης Αντωνίου",
    },
    {
      ...base,
      id: "sess-parent-1",
      therapist_user_id: "ther-demo-3",
      discipline_code: "psych",
      starts_at: isoDaysAgo(14, 17),
      ends_at: isoDaysAgo(14, 18),
      status: "completed",
      session_kind: "parent_counseling",
      internal_notes: "Καθοδήγηση γονέων για ρουτίνα μελέτης.",
      created_at: isoDaysAgo(14),
      updated_at: isoDaysAgo(14),
      discipline_name_el: "Ψυχολογία",
      therapist_name: "Σοφία Δημητρίου",
    },
    {
      ...base,
      id: "sess-school-1",
      therapist_user_id: "ther-demo-3",
      discipline_code: "psych",
      starts_at: isoDaysAgo(21, 12),
      ends_at: isoDaysAgo(21, 13),
      status: "completed",
      session_kind: "individual",
      internal_notes: "Τηλεφωνική επικοινωνία με δασκάλα — κλινική συνεργασία σχολείου.",
      created_at: isoDaysAgo(21),
      updated_at: isoDaysAgo(21),
      discipline_name_el: "Ψυχολογία",
      therapist_name: "Σοφία Δημητρίου",
    },
    {
      ...base,
      id: "sess-sup-1",
      therapist_user_id: "ther-demo-super",
      discipline_code: "speech",
      starts_at: isoDaysAgo(3, 14),
      ends_at: isoDaysAgo(3, 15),
      status: "scheduled",
      session_kind: "supervision",
      internal_notes: "Επείγουσα επισκόπηση περίπτωσης — παλινδρόμηση στη γραφή.",
      created_at: isoDaysAgo(10),
      updated_at: isoDaysAgo(10),
      discipline_name_el: "Λογοθεραπεία",
      therapist_name: "Άννα Παπαδοπούλου (Επόπτρια)",
    },
    {
      ...base,
      id: "sess-abs-1",
      therapist_user_id: "ther-demo-2",
      discipline_code: "ot",
      starts_at: isoDaysAgo(10, 10),
      ends_at: isoDaysAgo(10, 11),
      status: "absence",
      session_kind: "individual",
      internal_notes: null,
      created_at: isoDaysAgo(10),
      updated_at: isoDaysAgo(10),
      discipline_name_el: "Εργοθεραπεία",
      therapist_name: "Γιάννης Αντωνίου",
    },
  ];
}

function buildDemoNotes(childId: string, sessions: SessionListItem[]): SessionNoteListItem[] {
  const s = (id: string) => sessions.find((x) => x.id === id)!;
  return [
    {
      id: "note-1",
      organization_id: ORG,
      session_id: "sess-speech-1",
      author_user_id: "ther-demo-1",
      status: "finalized",
      linked_goal_ids: ["goal-demo-1"],
      body: "",
      goals_worked: "Εκφραστική γλώσσα",
      activities: "Παιχνίδι κατηγοριών, εικόνες",
      child_response: "Συνεργάσιμος, κούραση στο τέλος",
      observations:
        "Διεπιστημονική παρατήρηση: βελτίωση στην οργάνωση μετά από OT συνεδρία. Ανησυχία για αυτορρύθμιση στο σχολείο.",
      suggestions_next: "Συντονισμός με ψυχολόγο για στρατηγικές στην τάξη.",
      visible_to_supervisor: true,
      visible_to_parent: false,
      finalized_at: isoDaysAgo(7, 16),
      created_at: isoDaysAgo(7),
      updated_at: isoDaysAgo(7),
      deleted_at: null,
      session_starts_at: s("sess-speech-1").starts_at,
      session_therapist_user_id: s("sess-speech-1").therapist_user_id,
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      therapist_name: "Ελένη Κωνσταντίνου",
      discipline_name_el: "Λογοθεραπεία",
      discipline_code: "speech",
      author_display_name: "Ελένη Κωνσταντίνου",
    },
    {
      id: "note-2",
      organization_id: ORG,
      session_id: "sess-ot-1",
      author_user_id: "ther-demo-2",
      status: "finalized",
      linked_goal_ids: ["goal-demo-2"],
      body: "",
      goals_worked: "Λεπτή κινητικότητα",
      activities: "Πηλός, ψαλίδι",
      child_response: "Δυσκολία στην κράτηση — πιθανή παλινδρόμηση μετά από αρρώστια",
      observations: "Κοινή ανησυχία με λογοθεραπεία για κούραση. Σχολείο αναφέρει δυσκολία στη γραφή.",
      suggestions_next: "Προσαρμογή καθήκοντος γραφής· επαναξιολόγηση κράτησης σε 4 εβδομάδες.",
      visible_to_supervisor: true,
      visible_to_parent: false,
      finalized_at: isoDaysAgo(5, 11),
      created_at: isoDaysAgo(5),
      updated_at: isoDaysAgo(5),
      deleted_at: null,
      session_starts_at: s("sess-ot-1").starts_at,
      session_therapist_user_id: s("sess-ot-1").therapist_user_id,
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      therapist_name: "Γιάννης Αντωνίου",
      discipline_name_el: "Εργοθεραπεία",
      discipline_code: "ot",
      author_display_name: "Γιάννης Αντωνίου",
    },
    {
      id: "note-3",
      organization_id: ORG,
      session_id: "sess-school-1",
      author_user_id: "ther-demo-3",
      status: "finalized",
      linked_goal_ids: ["goal-demo-3"],
      body: "",
      goals_worked: "Ρύθμιση",
      activities: "—",
      child_response: "—",
      observations:
        "Συνεργασία με δασκάλα: προτεινόμενες προσαρμογές θέσης και διαλειμμάτων. Απόφαση ομάδας για κοινό πλάνο.",
      suggestions_next: "Ενημέρωση γονέων για εφαρμογή στο σπίτι.",
      visible_to_supervisor: true,
      visible_to_parent: true,
      finalized_at: isoDaysAgo(21, 13),
      created_at: isoDaysAgo(21),
      updated_at: isoDaysAgo(21),
      deleted_at: null,
      session_starts_at: s("sess-school-1").starts_at,
      session_therapist_user_id: s("sess-school-1").therapist_user_id,
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      therapist_name: "Σοφία Δημητρίου",
      discipline_name_el: "Ψυχολογία",
      discipline_code: "psych",
      author_display_name: "Σοφία Δημητρίου",
    },
    {
      id: "note-draft",
      organization_id: ORG,
      session_id: "sess-speech-1",
      author_user_id: "ther-demo-1",
      status: "draft",
      linked_goal_ids: [],
      body: "Πρόχειρο",
      goals_worked: "",
      activities: "",
      child_response: "",
      observations: "",
      suggestions_next: "",
      visible_to_supervisor: true,
      visible_to_parent: false,
      finalized_at: null,
      created_at: isoDaysAgo(1),
      updated_at: isoDaysAgo(1),
      deleted_at: null,
      session_starts_at: isoDaysAgo(1, 15),
      session_therapist_user_id: "ther-demo-1",
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      therapist_name: "Ελένη Κωνσταντίνου",
      discipline_name_el: "Λογοθεραπεία",
      discipline_code: "speech",
      author_display_name: "Ελένη Κωνσταντίνου",
    },
  ];
}

function buildDemoReports(childId: string): ProgressReportListItem[] {
  return [
    {
      id: "rep-eval-1",
      organization_id: ORG,
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      title: "Αναφορά αξιολόγησης — Αρχική",
      status: "approved",
      period_start: addDaysAthensCalendar(today, -310),
      period_end: addDaysAthensCalendar(today, -300),
      summary: "Πλήρης διεπιστημονική αξιολόγηση. Συστάσεις για λογοθεραπεία 2x/εβδ. και εργοθεραπεία.",
      updated_at: isoDaysAgo(295),
    },
    {
      id: "rep-prog-1",
      organization_id: ORG,
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      title: "Αναφορά προόδου — Χειμερινό 2025",
      status: "pending_review",
      period_start: "2025-01-01",
      period_end: "2025-03-31",
      summary: "Σταθερή πρόοδος στην έκφραση· ανάγκη συνέχισης στόχων OT.",
      updated_at: isoDaysAgo(20),
    },
    {
      id: "rep-prog-draft",
      organization_id: ORG,
      child_id: childId,
      child_name: "Παπαδόπουλος Νίκος",
      title: "Αναφορά προόδου — Άνοιξη 2026",
      status: "draft",
      period_start: "2026-04-01",
      period_end: "2026-06-30",
      summary: null,
      updated_at: isoDaysAgo(70),
    },
  ];
}

function buildAssignedTherapistsFromSessions(
  sessions: SessionListItem[],
  goals: TherapyGoalListItem[]
) {
  const map = new Map<
    string,
    { userId: string; displayName: string; disciplines: string[]; sessionCount: number }
  >();
  for (const s of sessions) {
    const cur = map.get(s.therapist_user_id) ?? {
      userId: s.therapist_user_id,
      displayName: s.therapist_name ?? "Θεραπευτής",
      disciplines: [],
      sessionCount: 0,
    };
    cur.sessionCount += 1;
    if (s.discipline_name_el && !cur.disciplines.includes(s.discipline_name_el)) {
      cur.disciplines.push(s.discipline_name_el);
    }
    map.set(s.therapist_user_id, cur);
  }
  for (const g of goals) {
    if (!g.therapist_user_id) continue;
    const cur = map.get(g.therapist_user_id) ?? {
      userId: g.therapist_user_id,
      displayName: g.therapist_name ?? "Θεραπευτής",
      disciplines: [],
      sessionCount: 0,
    };
    if (g.discipline_name_el && !cur.disciplines.includes(g.discipline_name_el)) {
      cur.disciplines.push(g.discipline_name_el);
    }
    map.set(g.therapist_user_id, cur);
  }
  return [...map.values()].sort((a, b) => b.sessionCount - a.sessionCount);
}

export function buildDemoClinicalChildProfileBundle(
  childId: string = DEMO_CLINICAL_CHILD_ID
): ClinicalChildProfileBundle {
  const child = buildDemoChild(childId);
  const parentLinks = buildDemoParents();
  const programs: TherapyProgramSummary[] = [
    { id: "prog-1", title: "Διεπιστημονικό πρόγραμμα", discipline_code: null },
  ];
  const treatmentPlans = [
    { id: "plan-demo-1", title: "Πλάνο παρέμβασης 2025–26", status: "active" },
  ];
  const goals = buildDemoGoals(childId);
  const sessions = buildDemoSessions(childId);
  const sessionNotes = buildDemoNotes(childId, sessions);
  const progressReports = buildDemoReports(childId);

  const assignedTherapists = buildAssignedTherapistsFromSessions(sessions, goals);
  const clinicalTeamAssignments = mapClinicalTeamAssignments(
    buildDemoTherapistAssignmentsSeed(ORG).filter((a) => a.childId === childId)
  );
  const assignedSpecialties = buildAssignedSpecialties(sessions, goals);
  const goalProgress = buildGoalProgressMap(goals, sessionNotes);
  const evaluationSummary = buildEvaluationSummary(sessions, progressReports);
  const collaboration = buildCollaborationBundle(sessionNotes, sessions);
  const supervision = buildSupervisionBundle(sessions, sessionNotes, child.notes);
  const timeline = buildClinicalTimeline({ childId, sessions, sessionNotes, goals, reports: progressReports });
  const alerts = computeClinicalAlerts({ childId, goals, sessions, sessionNotes, reports: progressReports });

  const activeGoals = goals.filter((g) => ["active", "in_progress", "on_hold"].includes(g.status));
  const completedGoals = goals.filter((g) => g.status === "met");

  return {
    child,
    parentLinks,
    programs,
    treatmentPlans,
    assignedTherapists,
    clinicalTeamAssignments,
    assignedSpecialties,
    goals,
    goalProgress,
    sessions,
    sessionNotes,
    progressReports,
    evaluationSummary,
    collaboration,
    timeline,
    alerts,
    interdisciplinary: collaboration.crossDisciplineObservations,
    supervision,
    counts: {
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      sessions: sessions.length,
      sessionNotes: sessionNotes.filter((n) => n.status === "finalized").length,
      reports: progressReports.length,
      evaluations: sessions.filter((s) => s.session_kind === "assessment").length,
    },
  };
}

/** True if bundle looks too empty for a useful prototype review. */
export function isSparseClinicalBundle(bundle: ClinicalChildProfileBundle): boolean {
  return (
    bundle.goals.length === 0 &&
    bundle.sessionNotes.length === 0 &&
    bundle.sessions.length === 0
  );
}
