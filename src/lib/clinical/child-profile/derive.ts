import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import type {
  AssignedSpecialtySummary,
  ClinicalCollaborationBundle,
  EvaluationSummary,
  GoalProgressSummary,
  SupervisionEntry,
} from "./types";

const SCHOOL_KEYWORDS = /σχολ|δασκαλ|σχολεί|school|τάξη|εκπαιδευτ/i;
const REGRESSION_KEYWORDS = /παλινδρόμ|regression|επιδείν|χειροτέρ|όπισθεν|δυσκολότερ/i;
const CONCERN_KEYWORDS = /ανησυχ|πρόβλημα|δυσκολ|κρίσιμ|επείγον/i;
const DECISION_KEYWORDS = /απόφαση|συστήν|προτείν|αποφασίζ|συντονισμ/i;
const IDT_GOAL_KEYWORDS = /διεπι|κοινός στόχος|interdisciplin|ομαδικός στόχος/i;

function excerpt(text: string, max = 200): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export function buildAssignedSpecialties(
  sessions: SessionListItem[],
  goals: TherapyGoalListItem[]
): AssignedSpecialtySummary[] {
  const map = new Map<string, AssignedSpecialtySummary>();

  const touch = (code: string, label: string, source: "session" | "goal") => {
    const cur = map.get(code) ?? {
      disciplineCode: code,
      disciplineLabel: label,
      therapistNames: [],
      activeGoalCount: 0,
      sessionCount: 0,
    };
    if (source === "session") cur.sessionCount += 1;
    if (source === "goal") cur.activeGoalCount += 1;
    map.set(code, cur);
  };

  for (const s of sessions) {
    touch(s.discipline_code, s.discipline_name_el ?? s.discipline_code, "session");
    const cur = map.get(s.discipline_code)!;
    if (s.therapist_name && !cur.therapistNames.includes(s.therapist_name)) {
      cur.therapistNames.push(s.therapist_name);
    }
  }

  for (const g of goals) {
    if (!["active", "in_progress", "on_hold"].includes(g.status)) continue;
    touch(g.discipline_code, g.discipline_name_el ?? g.discipline_code, "goal");
    const cur = map.get(g.discipline_code)!;
    if (g.therapist_name && !cur.therapistNames.includes(g.therapist_name)) {
      cur.therapistNames.push(g.therapist_name);
    }
  }

  return [...map.values()].sort((a, b) => b.sessionCount - a.sessionCount);
}

export function buildGoalProgressMap(
  goals: TherapyGoalListItem[],
  notes: SessionNoteListItem[]
): GoalProgressSummary[] {
  const notesByGoal = new Map<string, number>();
  for (const n of notes) {
    if (n.status !== "finalized") continue;
    for (const gid of n.linked_goal_ids) {
      notesByGoal.set(gid, (notesByGoal.get(gid) ?? 0) + 1);
    }
  }

  return goals.map((g) => {
    const linkedSessions = notesByGoal.get(g.id) ?? 0;
    let progressPercent: number;
    if (g.status === "met") progressPercent = 100;
    else if (g.status === "cancelled") progressPercent = 0;
    else {
      const base = Math.min(85, linkedSessions * 20);
      progressPercent = g.status === "in_progress" ? Math.max(base, 25) : base;
    }

    const isInterdisciplinary =
      IDT_GOAL_KEYWORDS.test(`${g.title} ${g.description ?? ""} ${g.success_criterion}`) ||
      (g.treatment_plan_id != null &&
        goals.some(
          (o) =>
            o.id !== g.id &&
            o.treatment_plan_id === g.treatment_plan_id &&
            o.discipline_code !== g.discipline_code &&
            ["active", "in_progress", "on_hold"].includes(o.status)
        ));

    return {
      goalId: g.id,
      title: g.title,
      disciplineCode: g.discipline_code,
      disciplineLabel: g.discipline_name_el ?? g.discipline_code,
      status: g.status,
      progressPercent,
      measurableIndicator: g.success_criterion || null,
      linkedSessionNoteCount: linkedSessions,
      isInterdisciplinary,
    };
  });
}

export function buildEvaluationSummary(
  sessions: SessionListItem[],
  reports: ProgressReportListItem[]
): EvaluationSummary {
  const assessments = sessions
    .filter((s) => s.session_kind === "assessment")
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at));

  const lastCompleted = assessments.find((s) => s.status === "completed");
  const nextScheduled = assessments.find((s) => s.status === "scheduled");

  const evalReports = reports.filter((r) =>
    /αξιολόγ|evaluation|assessment/i.test(r.title)
  );

  return {
    lastEvaluationDate: lastCompleted?.starts_at.slice(0, 10) ?? null,
    lastEvaluationDiscipline: lastCompleted?.discipline_name_el ?? null,
    nextEvaluationDate: nextScheduled?.starts_at.slice(0, 10) ?? null,
    totalAssessments: assessments.length,
    evaluationReportCount: evalReports.length,
    clinicalSummary: lastCompleted?.internal_notes?.trim()
      ? excerpt(lastCompleted.internal_notes, 300)
      : evalReports[0]?.summary
        ? excerpt(evalReports[0].summary, 300)
        : null,
  };
}

export function buildCollaborationBundle(
  notes: SessionNoteListItem[],
  sessions: SessionListItem[]
): ClinicalCollaborationBundle {
  const observations = notes
    .filter((n) => n.observations.trim().length > 15)
    .map((n) => ({
      id: `obs-${n.id}`,
      disciplineCode: n.discipline_code,
      disciplineLabel: n.discipline_name_el ?? n.discipline_code,
      therapistName: n.author_display_name ?? n.therapist_name,
      occurredAt: n.finalized_at ?? n.session_starts_at ?? n.updated_at,
      excerpt: excerpt(n.observations, 280),
      sessionId: n.session_id,
      noteId: n.id,
    }));

  const sharedConcerns = notes
    .filter(
      (n) =>
        CONCERN_KEYWORDS.test(n.child_response) ||
        CONCERN_KEYWORDS.test(n.observations) ||
        REGRESSION_KEYWORDS.test(n.child_response)
    )
    .map((n) => ({
      id: `concern-${n.id}`,
      disciplineLabel: n.discipline_name_el ?? n.discipline_code,
      occurredAt: n.finalized_at ?? n.session_starts_at ?? n.updated_at,
      excerpt: excerpt(n.child_response || n.observations, 200),
      therapistName: n.author_display_name ?? n.therapist_name,
    }));

  const clinicalDecisions = notes
    .filter((n) => DECISION_KEYWORDS.test(n.suggestions_next) || DECISION_KEYWORDS.test(n.observations))
    .map((n) => ({
      id: `decision-${n.id}`,
      disciplineLabel: n.discipline_name_el ?? n.discipline_code,
      occurredAt: n.finalized_at ?? n.updated_at,
      excerpt: excerpt(n.suggestions_next || n.observations, 200),
      therapistName: n.author_display_name ?? n.therapist_name,
    }));

  const schoolNotes = [
    ...notes.filter((n) => SCHOOL_KEYWORDS.test(n.observations) || SCHOOL_KEYWORDS.test(n.body)),
    ...sessions.filter((s) => SCHOOL_KEYWORDS.test(s.internal_notes ?? "")),
  ]
    .slice(0, 12)
    .map((item, i) => {
      if ("session_id" in item) {
        const n = item as SessionNoteListItem;
        return {
          id: `school-note-${n.id}`,
          occurredAt: n.session_starts_at ?? n.updated_at,
          excerpt: excerpt(n.observations || n.body, 200),
          source: "session_note" as const,
        };
      }
      const s = item as SessionListItem;
      return {
        id: `school-session-${s.id}-${i}`,
        occurredAt: s.starts_at,
        excerpt: excerpt(s.internal_notes ?? "", 200),
        source: "session" as const,
      };
    });

  const collaborationNotes = notes
    .filter((n) => n.observations.trim().length > 40)
    .slice(0, 16)
    .map((n) => ({
      id: `collab-${n.id}`,
      disciplineLabel: n.discipline_name_el ?? n.discipline_code,
      occurredAt: n.finalized_at ?? n.session_starts_at ?? n.updated_at,
      excerpt: excerpt(n.observations, 220),
      therapistName: n.author_display_name ?? n.therapist_name,
    }));

  return {
    crossDisciplineObservations: observations,
    sharedConcerns,
    clinicalDecisions,
    collaborationNotes,
    schoolCollaborationNotes: schoolNotes,
  };
}

export function buildSupervisionBundle(
  sessions: SessionListItem[],
  notes: SessionNoteListItem[],
  childClinicalNotes: string | null
): {
  recommendations: SupervisionEntry[];
  actionPlans: SupervisionEntry[];
  directorComments: SupervisionEntry[];
} {
  const recommendations: SupervisionEntry[] = [];
  const actionPlans: SupervisionEntry[] = [];
  const directorComments: SupervisionEntry[] = [];

  for (const s of sessions.filter((x) => x.session_kind === "supervision")) {
    recommendations.push({
      id: `sup-rec-${s.id}`,
      occurredAt: s.starts_at,
      title: "Σύσταση εποπτείας",
      summary: excerpt(s.internal_notes?.trim() || `Κατάσταση: ${s.status}`, 220),
      therapistName: s.therapist_name,
      sessionId: s.id,
      audience: "supervisor",
      href: `/schedule?session=${s.id}`,
    });
  }

  for (const n of notes) {
    if (n.visible_to_supervisor && n.suggestions_next.trim()) {
      recommendations.push({
        id: `sup-sug-${n.id}`,
        occurredAt: n.finalized_at ?? n.updated_at,
        title: "Σύσταση από σημείωση συνεδρίας",
        summary: excerpt(n.suggestions_next, 220),
        therapistName: n.author_display_name ?? n.therapist_name,
        sessionId: n.session_id,
        audience: "supervisor",
        href: `/session-notes?note=${n.id}`,
      });
    }
    if (n.suggestions_next.trim().length > 30) {
      actionPlans.push({
        id: `action-${n.id}`,
        occurredAt: n.finalized_at ?? n.updated_at,
        title: "Σχέδιο δράσης θεραπευτή",
        summary: excerpt(n.suggestions_next, 220),
        therapistName: n.author_display_name ?? n.therapist_name,
        sessionId: n.session_id,
        audience: "therapist",
        href: `/session-notes?note=${n.id}`,
      });
    }
  }

  if (childClinicalNotes?.trim()) {
    directorComments.push({
      id: "director-child-notes",
      occurredAt: new Date().toISOString(),
      title: "Κλινικές παρατηρήσεις αρχείου (διοίκηση)",
      summary: excerpt(childClinicalNotes, 280),
      therapistName: null,
      sessionId: null,
      audience: "director",
    });
  }

  const sortDesc = (a: SupervisionEntry, b: SupervisionEntry) =>
    b.occurredAt.localeCompare(a.occurredAt);

  return {
    recommendations: recommendations.sort(sortDesc),
    actionPlans: actionPlans.sort(sortDesc),
    directorComments: directorComments.sort(sortDesc),
  };
}

export function detectRegressionInNotes(notes: SessionNoteListItem[]): boolean {
  const recent = notes
    .filter((n) => n.status === "finalized")
    .sort((a, b) => (b.finalized_at ?? b.updated_at).localeCompare(a.finalized_at ?? a.updated_at))
    .slice(0, 8);
  return recent.some(
    (n) =>
      REGRESSION_KEYWORDS.test(n.child_response) || REGRESSION_KEYWORDS.test(n.observations)
  );
}

export function classifyReportKind(
  report: ProgressReportListItem
): "evaluation" | "progress" {
  return /αξιολόγ|evaluation|assessment/i.test(report.title) ? "evaluation" : "progress";
}
