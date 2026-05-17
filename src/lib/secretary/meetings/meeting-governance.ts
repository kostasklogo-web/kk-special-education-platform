import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import type { MeetingDecision, SecretaryMeeting, SecretaryTask } from "@/lib/secretary/types";
import { getAllTasks } from "@/lib/secretary/tasks/store";
import { createTaskDraft } from "@/lib/secretary/tasks/store";
import { taskTypeByCode } from "@/lib/secretary/tasks/catalog";
import { isClinicalMeetingType } from "./catalog";

export type DecisionRegisterRow = MeetingDecision & {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  meetingTypeLabel: string;
  isOverdue: boolean;
};

export type FollowUpTrackerRow = {
  id: string;
  kind: "decision" | "meeting" | "minutes";
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  title: string;
  assignee: string;
  dueDate: string | null;
  status: string;
  linkedTaskId: string | null;
  isOverdue: boolean;
};

export type CloseReadiness = {
  canClose: boolean;
  blockers: string[];
};

export type SupervisionHistoryEntry = {
  meeting: SecretaryMeeting;
  hasMinutes: boolean;
  openDecisions: number;
};

const SUPERVISION_TYPES = new Set([
  "individual_supervision",
  "group_supervision",
  "case_supervision",
  "supervisor",
  "clinical_director",
]);

export function isSupervisionMeeting(m: SecretaryMeeting): boolean {
  return SUPERVISION_TYPES.has(m.meetingTypeCode) || m.isClinical;
}

export function meetingsWithMissingMinutes(meetings: SecretaryMeeting[]): SecretaryMeeting[] {
  return meetings.filter(
    (m) => !m.archived && !m.isClosed && (m.minutesMissing || m.status === "needs_minutes")
  );
}

export function buildDecisionRegister(
  meetings: SecretaryMeeting[],
  todayYmd: string
): DecisionRegisterRow[] {
  const rows: DecisionRegisterRow[] = [];
  for (const m of meetings) {
    if (m.archived) continue;
    for (const d of m.decisions) {
      rows.push({
        ...d,
        meetingId: m.id,
        meetingTitle: m.title,
        meetingDate: m.meetingDate,
        meetingTypeLabel: m.meetingTypeLabel,
        isOverdue: Boolean(d.dueDate && d.dueDate < todayYmd && !["completed", "cancelled"].includes(d.status)),
        status:
          d.dueDate && d.dueDate < todayYmd && !["completed", "cancelled"].includes(d.status)
            ? "overdue"
            : d.status,
      });
    }
  }
  return rows.sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
}

export function unresolvedManagementDecisions(
  meetings: SecretaryMeeting[],
  todayYmd: string
): DecisionRegisterRow[] {
  return buildDecisionRegister(meetings, todayYmd).filter(
    (d) =>
      !["completed", "cancelled"].includes(d.status) &&
      (d.department === "Διοίκηση" ||
        d.department === "HR" ||
        meetings.find((m) => m.id === d.meetingId)?.meetingTypeCode === "ceo" ||
        meetings.find((m) => m.id === d.meetingId)?.meetingTypeCode === "admin_internal")
  );
}

export function buildFollowUpTracker(
  meetings: SecretaryMeeting[],
  tasks: SecretaryTask[],
  todayYmd: string
): FollowUpTrackerRow[] {
  const rows: FollowUpTrackerRow[] = [];

  for (const m of meetings) {
    if (m.archived || m.isClosed) continue;

    if (m.minutesMissing) {
      rows.push({
        id: `minutes-${m.id}`,
        kind: "minutes",
        meetingId: m.id,
        meetingTitle: m.title,
        meetingDate: m.meetingDate,
        title: "Ολοκλήρωση πρακτικών",
        assignee: m.organizerLabel,
        dueDate: addDaysAthensCalendar(m.meetingDate, 3),
        status: "Εκκρεμεί",
        linkedTaskId: tasks.find((t) => t.linkedMeetingId === m.id && t.notes.includes("meeting:minutes"))?.id ?? null,
        isOverdue: m.meetingDate < todayYmd,
      });
    }

    for (const d of m.decisions) {
      if (["completed", "cancelled"].includes(d.status)) continue;
      const task = tasks.find(
        (t) => t.linkedMeetingId === m.id && (t.id === d.linkedTaskId || t.notes.includes(`meeting:decision:${d.id}`))
      );
      rows.push({
        id: d.id,
        kind: "decision",
        meetingId: m.id,
        meetingTitle: m.title,
        meetingDate: m.meetingDate,
        title: d.text,
        assignee: d.responsiblePersonLabel || "—",
        dueDate: d.dueDate,
        status: d.status,
        linkedTaskId: d.linkedTaskId ?? task?.id ?? null,
        isOverdue: Boolean(d.dueDate && d.dueDate < todayYmd),
      });
    }

    if (m.followUpRequired && m.followUpStatus !== "complete") {
      const task = tasks.find((t) => t.linkedMeetingId === m.id && t.notes.includes("meeting:followup"));
      rows.push({
        id: `followup-${m.id}`,
        kind: "meeting",
        meetingId: m.id,
        meetingTitle: m.title,
        meetingDate: m.meetingDate,
        title: "Follow-up συνάντησης",
        assignee: m.organizerLabel,
        dueDate: addDaysAthensCalendar(m.meetingDate, 7),
        status: m.followUpStatus,
        linkedTaskId: task?.id ?? null,
        isOverdue: m.followUpStatus === "overdue",
      });
    }
  }

  return rows.sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
}

export function supervisionHistoryForTherapist(
  meetings: SecretaryMeeting[],
  therapistLabel: string
): SupervisionHistoryEntry[] {
  const q = therapistLabel.toLowerCase();
  return meetings
    .filter(
      (m) =>
        !m.archived &&
        isSupervisionMeeting(m) &&
        (m.staffMemberLabel?.toLowerCase().includes(q) ||
          m.participants.some((p) => p.toLowerCase().includes(q)))
    )
    .sort((a, b) => `${b.meetingDate}${b.startTime}`.localeCompare(`${a.meetingDate}${a.startTime}`))
    .map((meeting) => ({
      meeting,
      hasMinutes: Boolean(meeting.minutes?.summary?.trim()),
      openDecisions: meeting.decisions.filter((d) => !["completed", "cancelled"].includes(d.status)).length,
    }));
}

export function supervisionHistoryForChild(
  meetings: SecretaryMeeting[],
  childId: string
): SupervisionHistoryEntry[] {
  return meetings
    .filter((m) => !m.archived && m.childId === childId && (m.isClinical || isClinicalMeetingType(m.meetingTypeCode)))
    .sort((a, b) => `${b.meetingDate}${b.startTime}`.localeCompare(`${a.meetingDate}${a.startTime}`))
    .map((meeting) => ({
      meeting,
      hasMinutes: Boolean(meeting.minutes?.summary?.trim()),
      openDecisions: meeting.decisions.filter((d) => !["completed", "cancelled"].includes(d.status)).length,
    }));
}

export function meetingTasks(meetingId: string, todayYmd: string): SecretaryTask[] {
  return getAllTasks(todayYmd).filter((t) => t.linkedMeetingId === meetingId);
}

export function meetingCloseReadiness(m: SecretaryMeeting, todayYmd: string): CloseReadiness {
  const blockers: string[] = [];
  if (m.isClosed) {
    return { canClose: false, blockers: ["Η συνάντηση είναι ήδη κλειστή"] };
  }
  if (["cancelled", "scheduled", "confirmed"].includes(m.status)) {
    blockers.push("Η συνάντηση πρέπει να έχει ολοκληρωθεί πριν το κλείσιμο");
  }

  if (m.minutesMissing || !m.minutes?.summary?.trim()) {
    blockers.push("Τα πρακτικά δεν έχουν ολοκληρωθεί (απαιτείται σύνοψη)");
  }

  const tasks = meetingTasks(m.id, todayYmd);

  for (const d of m.decisions) {
    if (!d.responsiblePersonLabel?.trim()) {
      blockers.push(`Απόφαση χωρίς υπεύθυνο: «${d.text.slice(0, 50)}»`);
    }
    if (d.responsiblePersonLabel?.trim() && d.dueDate) {
      const linked =
        d.linkedTaskId ?? tasks.find((t) => t.notes.includes(`meeting:decision:${d.id}`))?.id;
      if (!linked) {
        blockers.push(`Δεν έχει δημιουργηθεί συνδεδεμένη εργασία για: «${d.text.slice(0, 50)}»`);
      }
    }
  }

  if (m.followUpRequired || m.decisions.some((d) => d.responsiblePersonLabel && d.dueDate)) {
    const pendingDecisionTasks = m.decisions.filter(
      (d) =>
        d.responsiblePersonLabel?.trim() &&
        d.dueDate &&
        !d.linkedTaskId &&
        !tasks.find((t) => t.notes.includes(`meeting:decision:${d.id}`))
    );
    if (pendingDecisionTasks.length > 0 && !blockers.some((b) => b.includes("συνδεδεμένη εργασία"))) {
      blockers.push("Υπάρχουν αποφάσεις χωρίς συνδεδεμένη εργασία follow-up");
    }
  }

  return { canClose: blockers.length === 0, blockers };
}

export function syncDecisionLinkedTask(
  m: SecretaryMeeting,
  decision: MeetingDecision,
  todayYmd: string
): SecretaryMeeting {
  if (!decision.responsiblePersonLabel?.trim() || !decision.dueDate) return m;
  if (decision.linkedTaskId) return m;

  const existing = meetingTasks(m.id, todayYmd).find((t) => t.notes.includes(`meeting:decision:${decision.id}`));
  if (existing) {
    return {
      ...m,
      decisions: m.decisions.map((d) =>
        d.id === decision.id ? { ...d, linkedTaskId: existing.id } : d
      ),
      linkedTaskIds: m.linkedTaskIds.includes(existing.id)
        ? m.linkedTaskIds
        : [...m.linkedTaskIds, existing.id],
    };
  }

  const task = createTaskDraft(
    {
      taskTypeCode: "decision_action",
      taskTypeLabel: taskTypeByCode("decision_action")?.labelEl ?? "Ενέργεια από απόφαση",
      title: `Απόφαση: ${decision.text.slice(0, 80)}`,
      childId: decision.childId ?? m.childId,
      childLabel: decision.childLabel ?? m.childLabel,
      parentLabel: m.parentLabel,
      locationCode: m.locationCode,
      linkedMeetingId: m.id,
      assignedToLabel: decision.responsiblePersonLabel,
      priority: decision.dueDate < todayYmd ? "urgent" : "normal",
      dueDate: decision.dueDate,
      notes: `meeting:decision:${decision.id}`,
      autoGenerated: true,
    },
    todayYmd
  );

  return {
    ...m,
    decisions: m.decisions.map((d) =>
      d.id === decision.id ? { ...d, linkedTaskId: task.id } : d
    ),
    linkedTaskIds: [...m.linkedTaskIds, task.id],
    followUpRequired: true,
  };
}

export function addMeetingDecision(
  m: SecretaryMeeting,
  partial: Pick<MeetingDecision, "text" | "responsiblePersonLabel" | "dueDate"> &
    Partial<Pick<MeetingDecision, "childId" | "childLabel" | "staffLabel" | "department">>,
  todayYmd: string
): SecretaryMeeting {
  const decision: MeetingDecision = {
    id: `dec-${Date.now()}`,
    text: partial.text.trim(),
    responsiblePersonLabel: partial.responsiblePersonLabel.trim(),
    dueDate: partial.dueDate,
    childId: partial.childId ?? m.childId,
    childLabel: partial.childLabel ?? m.childLabel,
    staffLabel: partial.staffLabel ?? m.staffMemberLabel,
    department: partial.department ?? m.departmentSpecialty,
    status: "open",
    linkedTaskId: null,
  };

  let next: SecretaryMeeting = {
    ...m,
    decisions: [...m.decisions, decision],
    followUpRequired: true,
    status: m.status === "completed" ? "pending_decision" : m.status,
  };

  if (decision.responsiblePersonLabel && decision.dueDate) {
    next = syncDecisionLinkedTask(next, decision, todayYmd);
  }

  return next;
}

export function inferRiskFlags(m: SecretaryMeeting): Pick<SecretaryMeeting, "clinicalRiskFlag" | "hrRiskFlag"> {
  const risks = `${m.minutes?.risks ?? ""} ${m.minutes?.therapeuticConcerns ?? ""}`.toLowerCase();
  const clinicalRiskFlag =
    m.clinicalRiskFlag ||
    m.meetingTypeCode === "crisis" ||
    m.meetingTypeCode === "emergency" ||
    risks.includes("κίνδυν") ||
    risks.includes("risk") ||
    risks.includes("κρίση");

  const hrRiskFlag =
    m.hrRiskFlag ||
    m.meetingTypeCode === "hr" ||
    m.meetingTypeCode === "staff_evaluation" ||
    m.meetingTypeCode === "performance_review" ||
    (m.minutes?.hrNotes?.trim().length ?? 0) > 0;

  return { clinicalRiskFlag, hrRiskFlag };
}

export function monthlySupervisionMeetings(
  meetings: SecretaryMeeting[],
  monthYmd: string
): SecretaryMeeting[] {
  const prefix = monthYmd.slice(0, 7);
  return meetings.filter(
    (m) => !m.archived && m.meetingDate.startsWith(prefix) && isSupervisionMeeting(m)
  );
}
