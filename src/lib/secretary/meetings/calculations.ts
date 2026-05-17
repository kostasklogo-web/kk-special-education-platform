import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import type { MeetingMinutes, SecretaryMeeting } from "@/lib/secretary/types";
import { enrichMeetingComputed } from "./normalize";
import { isClinicalMeetingType, isEmergencyMeetingType } from "./catalog";

export type MeetingDashboardMetrics = {
  today: number;
  upcomingSupervision: number;
  pendingEmergency: number;
  awaitingMinutes: number;
  pendingFollowUpTasks: number;
  completedThisWeek: number;
  overdueFollowUp: number;
  clinical: number;
  administrative: number;
  clinicalRisk: number;
  hrRisk: number;
  openDecisions: number;
};

export function emptyMinutes(): MeetingMinutes {
  return {
    summary: "",
    mainIssues: "",
    decisionsText: "",
    responsibilities: "",
    deadlines: "",
    risks: "",
    followUpActions: "",
    nextMeetingDate: null,
    caseFormulation: "",
    therapeuticConcerns: "",
    goalsReviewed: "",
    suggestedAdjustments: "",
    supervisorFeedback: "",
    therapistActionPlan: "",
    clinicalNotes: "",
    hrNotes: "",
    administrativeNotes: "",
    managementNotes: "",
  };
}

export function enrichMeeting(m: SecretaryMeeting, todayYmd: string): SecretaryMeeting {
  return enrichMeetingComputed(m, todayYmd);
}

export function computeMeetingDashboardMetrics(
  meetings: SecretaryMeeting[],
  todayYmd: string
): MeetingDashboardMetrics {
  const weekStart = addDaysAthensCalendar(todayYmd, -7);
  const open = meetings.filter((m) => !m.archived && !["cancelled"].includes(m.status));

  return {
    today: open.filter((m) => m.isToday).length,
    upcomingSupervision: open.filter(
      (m) =>
        m.isUpcoming &&
        ["individual_supervision", "group_supervision", "case_supervision", "supervisor"].includes(
          m.meetingTypeCode
        )
    ).length,
    pendingEmergency: open.filter((m) => m.isEmergency && !["completed", "cancelled"].includes(m.status))
      .length,
    awaitingMinutes: open.filter((m) => m.minutesMissing || m.status === "needs_minutes").length,
    pendingFollowUpTasks: open.filter((m) => m.followUpStatus === "pending").length,
    completedThisWeek: meetings.filter(
      (m) =>
        m.status === "completed" &&
        m.meetingDate >= weekStart &&
        m.meetingDate <= todayYmd
    ).length,
    overdueFollowUp: open.filter((m) => m.followUpStatus === "overdue").length,
    clinical: open.filter((m) => m.isClinical).length,
    administrative: open.filter((m) => !m.isClinical).length,
    clinicalRisk: open.filter((m) => m.clinicalRiskFlag).length,
    hrRisk: open.filter((m) => m.hrRiskFlag).length,
    openDecisions: open.reduce(
      (n, m) => n + m.decisions.filter((d) => !["completed", "cancelled"].includes(d.status)).length,
      0
    ),
  };
}

export function isOpenMeeting(m: SecretaryMeeting): boolean {
  return !m.archived && !["completed", "cancelled"].includes(m.status);
}

export function defaultTitleForType(code: string, childLabel: string | null): string {
  if (childLabel) return `${childLabel} — συνάντηση`;
  if (isEmergencyMeetingType(code)) return "Έκτακτη συνάντηση";
  if (isClinicalMeetingType(code)) return "Εποπτεία / κλινική συνάντηση";
  return "Εσωτερική συνάντηση";
}
