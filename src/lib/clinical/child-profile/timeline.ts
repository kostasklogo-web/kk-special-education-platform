import type { ProgressReportListItem } from "@/lib/data/progress-reports/types";
import type { SessionListItem } from "@/lib/data/sessions/types";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import type { TherapyGoalListItem } from "@/lib/data/therapy-goals/types";
import { buildClinicalGoalsHref, buildClinicalSessionNotesHref } from "@/lib/clinical/child-profile/links";
import { classifyReportKind } from "./derive";
import { SESSION_KIND_LABELS_EL, TIMELINE_KIND_LABELS } from "./labels";
import type { ClinicalTimelineEvent, ClinicalTimelineEventKind } from "./types";

const SCHOOL_KEYWORDS = /σχολ|δασκαλ|σχολεί|school/i;
const IDT_KEYWORDS = /διεπι|κοινός|συντονισμ|interdisciplin/i;
const DECISION_KEYWORDS = /απόφαση|συστήν|προτείν|αποφασίζ/i;

function excerpt(text: string, max = 120): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

function pushEvent(events: ClinicalTimelineEvent[], event: ClinicalTimelineEvent): void {
  events.push(event);
}

export function buildClinicalTimeline(input: {
  childId: string;
  sessions: SessionListItem[];
  sessionNotes: SessionNoteListItem[];
  goals: TherapyGoalListItem[];
  reports: ProgressReportListItem[];
}): ClinicalTimelineEvent[] {
  const events: ClinicalTimelineEvent[] = [];
  const noteSessionIds = new Set(input.sessionNotes.map((n) => n.session_id));

  for (const s of input.sessions) {
    if (s.session_kind === "individual" || s.session_kind === "group") {
      if (noteSessionIds.has(s.id)) continue;
    }

    const kind: ClinicalTimelineEventKind =
      s.session_kind === "assessment"
        ? "evaluation"
        : s.session_kind === "parent_counseling"
          ? "parent_guidance"
          : s.session_kind === "supervision"
            ? "supervision"
            : "session";

    if (kind === "session" && s.status !== "completed") continue;

    pushEvent(events, {
      id: `session-${s.id}`,
      kind,
      occurredAt: s.starts_at,
      title:
        kind === "evaluation"
          ? "Αξιολόγηση"
          : kind === "parent_guidance"
            ? "Καθοδήγηση γονέων"
            : kind === "supervision"
              ? "Εποπτεία"
              : SESSION_KIND_LABELS_EL[s.session_kind] ?? "Συνεδρία",
      summary:
        kind === "supervision" && s.internal_notes?.trim()
          ? excerpt(s.internal_notes)
          : `${s.discipline_name_el ?? s.discipline_code} · ${s.status}`,
      disciplineLabel: s.discipline_name_el,
      therapistName: s.therapist_name,
      href: `/schedule?child=${encodeURIComponent(input.childId)}`,
    });

    if (SCHOOL_KEYWORDS.test(s.internal_notes ?? "")) {
      pushEvent(events, {
        id: `school-${s.id}`,
        kind: "school_collaboration",
        occurredAt: s.starts_at,
        title: "Συνεργασία με σχολείο",
        summary: excerpt(s.internal_notes ?? ""),
        disciplineLabel: s.discipline_name_el,
        therapistName: s.therapist_name,
      });
    }
  }

  for (const n of input.sessionNotes) {
    const body = n.body || n.observations || n.goals_worked;
    pushEvent(events, {
      id: `note-${n.id}`,
      kind: "session_note",
      occurredAt: n.finalized_at ?? n.session_starts_at ?? n.updated_at,
      title: n.status === "finalized" ? "Σημείωση θεραπείας" : "Πρόχειρη σημείωση",
      summary: excerpt(body || "—"),
      disciplineLabel: n.discipline_name_el,
      therapistName: n.author_display_name ?? n.therapist_name,
      href: buildClinicalSessionNotesHref(input.childId, n.id),
      meta: { linkedGoals: n.linked_goal_ids.length },
    });

    if (n.visible_to_supervisor && n.suggestions_next.trim()) {
      pushEvent(events, {
        id: `sup-rec-${n.id}`,
        kind: "supervision",
        occurredAt: n.finalized_at ?? n.updated_at,
        title: "Σύσταση εποπτείας",
        summary: excerpt(n.suggestions_next),
        disciplineLabel: n.discipline_name_el,
        therapistName: n.author_display_name ?? n.therapist_name,
        href: buildClinicalSessionNotesHref(input.childId, n.id),
      });
    }

    if (IDT_KEYWORDS.test(n.observations) || (n.observations.trim().length > 60 && n.discipline_code)) {
      pushEvent(events, {
        id: `idt-${n.id}`,
        kind: "interdisciplinary",
        occurredAt: n.finalized_at ?? n.session_starts_at ?? n.updated_at,
        title: "Διεπιπληρωματική παρατήρηση",
        summary: excerpt(n.observations),
        disciplineLabel: n.discipline_name_el,
        therapistName: n.author_display_name ?? n.therapist_name,
      });
    }

    if (DECISION_KEYWORDS.test(n.suggestions_next) || DECISION_KEYWORDS.test(n.observations)) {
      pushEvent(events, {
        id: `decision-${n.id}`,
        kind: "interdisciplinary",
        occurredAt: n.finalized_at ?? n.updated_at,
        title: "Κλινική απόφαση / συντονισμός",
        summary: excerpt(n.suggestions_next || n.observations),
        disciplineLabel: n.discipline_name_el,
        therapistName: n.author_display_name ?? n.therapist_name,
      });
    }

    if (SCHOOL_KEYWORDS.test(n.observations) || SCHOOL_KEYWORDS.test(n.body)) {
      pushEvent(events, {
        id: `school-note-${n.id}`,
        kind: "school_collaboration",
        occurredAt: n.finalized_at ?? n.session_starts_at ?? n.updated_at,
        title: "Σημείωση συνεργασίας σχολείου",
        summary: excerpt(n.observations || n.body),
        disciplineLabel: n.discipline_name_el,
        therapistName: n.author_display_name ?? n.therapist_name,
      });
    }
  }

  for (const g of input.goals) {
    const at = g.updated_at ?? g.created_at;
    const isChange =
      g.status === "met" || g.status === "cancelled" || g.status === "in_progress";
    pushEvent(events, {
      id: `goal-${g.id}-${g.status}`,
      kind: isChange && g.status !== "active" ? "therapeutic_change" : "goal",
      occurredAt: at,
      title: isChange && g.status === "met" ? `Ολοκλήρωση στόχου: ${g.title}` : g.title,
      summary: `${g.discipline_name_el ?? g.discipline_code} · ${g.status}${g.success_criterion ? ` · ${excerpt(g.success_criterion, 80)}` : ""}`,
      disciplineLabel: g.discipline_name_el,
      therapistName: g.therapist_name,
      href: buildClinicalGoalsHref(input.childId, g.id),
    });
  }

  for (const r of input.reports) {
    const isEval = classifyReportKind(r) === "evaluation";
    pushEvent(events, {
      id: `report-${r.id}`,
      kind: "report",
      occurredAt: r.updated_at,
      title: isEval ? `Αναφορά αξιολόγησης: ${r.title}` : r.title,
      summary: excerpt(r.summary ?? r.status),
      href: `/reports?child=${encodeURIComponent(input.childId)}`,
    });
  }

  const seen = new Set<string>();
  return events
    .filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return true;
    })
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
}

export function filterTimelineByKind(
  events: ClinicalTimelineEvent[],
  kind: ClinicalTimelineEventKind | "all"
): ClinicalTimelineEvent[] {
  if (kind === "all") return events;
  return events.filter((e) => e.kind === kind);
}

export { TIMELINE_KIND_LABELS };
