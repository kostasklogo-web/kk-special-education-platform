import { addDaysAthensCalendar, todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import {
  buildClinicalGoalsHref,
  buildClinicalReportsHref,
  buildClinicalScheduleHref,
  buildClinicalSessionNotesHref,
} from "./links";
import { detectRegressionInNotes } from "./derive";
import type { ClinicalAlert } from "./types";

export function computeClinicalAlerts(input: {
  childId: string;
  goals: TherapyGoalListItem[];
  sessions: SessionListItem[];
  sessionNotes: SessionNoteListItem[];
  reports: ProgressReportListItem[];
}): ClinicalAlert[] {
  const today = todayAthensYmd();
  const alerts: ClinicalAlert[] = [];

  const activeGoals = input.goals.filter((g) =>
    ["active", "in_progress", "on_hold"].includes(g.status)
  );
  if (activeGoals.length === 0 && input.goals.length > 0) {
    alerts.push({
      id: "no-goals",
      kind: "no_active_goals",
      severity: "warning",
      title: "Χωρίς ενεργούς στόχους",
      detail: "Δεν υπάρχουν ενεργοί θεραπευτικοί στόχοι. Ορίστε στόχους για να παρακολουθείται η πρόοδος.",
      href: buildClinicalGoalsHref(input.childId),
    });
  }

  const completedSessions = input.sessions.filter((s) => s.status === "completed");
  const recentCompleted = completedSessions.filter((s) => s.starts_at >= addDaysAthensCalendar(today, -21));
  const notesForRecent = input.sessionNotes.filter((n) =>
    recentCompleted.some((s) => s.id === n.session_id)
  );
  const finalizedRecent = notesForRecent.filter((n) => n.status === "finalized");
  if (recentCompleted.length >= 2 && finalizedRecent.length < recentCompleted.length) {
    alerts.push({
      id: "missing-notes",
      kind: "missing_session_notes",
      severity: "warning",
      title: "Εκκρεμείς σημειώσεις συνεδριών",
      detail: `${recentCompleted.length - finalizedRecent.length} ολοκληρωμένες συνεδρίες χωρίς οριστική σημείωση τις τελευταίες 3 εβδομάδες.`,
      href: buildClinicalSessionNotesHref(input.childId),
    });
  }

  const lastAssessment = input.sessions
    .filter((s) => s.session_kind === "assessment" && s.status === "completed")
    .sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0];

  if (lastAssessment) {
    const monthsSince =
      (Date.parse(`${today}T12:00:00Z`) - Date.parse(lastAssessment.starts_at)) /
      (86400000 * 30);
    if (monthsSince >= 11) {
      alerts.push({
        id: "reassessment",
        kind: "pending_reassessment",
        severity: "warning",
        title: "Προτείνεται επαναξιολόγηση",
        detail: `Τελευταία αξιολόγηση: ${lastAssessment.starts_at.slice(0, 10)}.`,
        href: buildClinicalScheduleHref(input.childId),
      });
    }
  } else if (input.sessions.length > 0) {
    alerts.push({
      id: "reassessment-none",
      kind: "pending_reassessment",
      severity: "info",
      title: "Δεν έχει καταγραφεί αξιολόγηση",
      detail: "Προγραμματίστε αξιολόγηση όταν χρειάζεται κλινικά.",
      href: buildClinicalScheduleHref(input.childId),
    });
  }

  const absences = input.sessions.filter((s) =>
    ["no_show", "absence", "cancelled"].includes(s.status)
  );
  if (absences.length >= 3 && input.sessions.length >= 5) {
    const rate = absences.length / input.sessions.length;
    if (rate >= 0.25) {
      alerts.push({
        id: "attendance",
        kind: "attendance_impact",
        severity: "warning",
        title: "Παρουσίες επηρεάζουν την πρόοδο",
        detail: `Υψηλό ποσοστό απουσιών/ακυρώσεων (${Math.round(rate * 100)}%). Εξετάστε κλινικά την συνέχεια.`,
      });
    }
  }

  const staleGoals = activeGoals.filter((g) => {
    if (!g.target_completion_date) return false;
    return g.target_completion_date < today && g.status !== "met";
  });
  if (staleGoals.length > 0) {
    alerts.push({
      id: "stale-goals",
      kind: "stale_goal",
      severity: "urgent",
      title: "Ληγμένοι στόχοι χωρίς ολοκλήρωση",
      detail: `${staleGoals.length} στόχος(οι) έχουν περάσει την ημερομηνία ολοκλήρωσης.`,
      href: buildClinicalGoalsHref(input.childId),
    });
  }

  const openReports = input.reports.filter((r) =>
    ["draft", "pending", "pending_review"].includes(r.status)
  );
  const oldDrafts = openReports.filter((r) => r.updated_at < addDaysAthensCalendar(today, -60));
  if (oldDrafts.length > 0) {
    alerts.push({
      id: "draft-reports",
      kind: "draft_report_overdue",
      severity: "warning",
      title: "Εκκρεμείς αναφορές προόδου",
      detail: `${oldDrafts.length} αναφορά(ές) σε κατάσταση προσχεδίου πάνω από 60 ημέρες.`,
      href: buildClinicalReportsHref(input.childId),
    });
  }

  const disciplines = new Set(input.sessions.map((s) => s.discipline_code));
  if (disciplines.size >= 3 && activeGoals.length > 0) {
    const goalsByDisc = new Map<string, number>();
    for (const g of activeGoals) {
      goalsByDisc.set(g.discipline_code, (goalsByDisc.get(g.discipline_code) ?? 0) + 1);
    }
    const missingCoordination = [...disciplines].some((d) => !goalsByDisc.has(d));
    if (missingCoordination) {
      alerts.push({
        id: "interdisciplinary",
        kind: "interdisciplinary_review",
        severity: "info",
        title: "Διεπιστημονικός συντονισμός",
        detail: "Υπάρχουν πολλές ειδικότητες — ελέγξτε κοινούς στόχους και παρατηρήσεις.",
        href: `#interdisciplinary`,
      });
    }
  }

  if (detectRegressionInNotes(input.sessionNotes)) {
    alerts.push({
      id: "regression",
      kind: "regression_concern",
      severity: "urgent",
      title: "Ανησυχία για παλινδρόμηση",
      detail: "Πρόσφατες σημειώσεις αναφέρουν επιδείνωση ή δυσκολία — αξιολογήστε κλινικά.",
      href: buildClinicalSessionNotesHref(input.childId),
    });
  }

  const supervisionPending = input.sessions.filter(
    (s) => s.session_kind === "supervision" && s.status === "scheduled"
  );
  const urgentSupervisionNotes = input.sessionNotes.filter(
    (n) => n.visible_to_supervisor && /επείγον|άμεσα|urgent/i.test(n.suggestions_next)
  );
  if (supervisionPending.length > 0 || urgentSupervisionNotes.length > 0) {
    alerts.push({
      id: "supervision",
      kind: "supervision_urgent",
      severity: urgentSupervisionNotes.length > 0 ? "urgent" : "info",
      title: "Ανάγκη εποπτείας",
      detail:
        urgentSupervisionNotes.length > 0
          ? "Υπάρχουν σημειώσεις με επείγουσα σύσταση εποπτείας."
          : `${supervisionPending.length} προγραμματισμένη συνάντηση εποπτείας.`,
      href: `#supervision`,
    });
  }

  const severityOrder = { urgent: 0, warning: 1, info: 2 };
  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}
