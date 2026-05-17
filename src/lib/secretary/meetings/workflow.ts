import type { MeetingMinutes, SecretaryMeeting } from "@/lib/secretary/types";
import { enrichMeetingComputed } from "./normalize";
import { meetingCloseReadiness } from "./meeting-governance";

export type MeetingWorkflowAction =
  | "confirm"
  | "complete"
  | "cancel"
  | "postpone"
  | "save_minutes"
  | "close";

export function canApplyMeetingAction(
  m: SecretaryMeeting,
  action: MeetingWorkflowAction,
  todayYmd?: string
): boolean {
  if (m.archived) return false;
  switch (action) {
    case "confirm":
      return m.status === "scheduled";
    case "complete":
      return ["scheduled", "confirmed"].includes(m.status);
    case "cancel":
      return !["completed", "cancelled"].includes(m.status);
    case "postpone":
      return !["completed", "cancelled"].includes(m.status);
    case "save_minutes":
      return !["cancelled"].includes(m.status);
    case "close":
      if (m.isClosed || m.status === "closed") return false;
      if (!todayYmd) {
        return ["needs_followup", "needs_minutes", "completed", "pending_decision"].includes(m.status);
      }
      return meetingCloseReadiness(m, todayYmd).canClose;
    default:
      return false;
  }
}

export function applyMeetingWorkflowAction(
  meeting: SecretaryMeeting,
  action: MeetingWorkflowAction,
  todayYmd: string,
  patch?: {
    updatedByLabel?: string;
    minutes?: MeetingMinutes;
    meetingDate?: string;
    startTime?: string;
    endTime?: string;
  }
): SecretaryMeeting {
  const now = new Date().toISOString();
  let next: SecretaryMeeting = { ...meeting, updatedAt: now, updatedByLabel: patch?.updatedByLabel ?? "Γραμματεία" };

  switch (action) {
    case "confirm":
      next.status = "confirmed";
      break;
    case "complete":
      next.status = "completed";
      if (!next.minutes?.summary?.trim()) {
        next.minutesMissing = true;
        next.status = "needs_minutes";
      }
      break;
    case "cancel":
      next.status = "cancelled";
      break;
    case "postpone":
      next.status = "postponed";
      if (patch?.meetingDate) {
        next.meetingDate = patch.meetingDate;
        next.startTime = patch.startTime ?? next.startTime;
        next.endTime = patch.endTime ?? next.endTime;
        next.startsAt = `${patch.meetingDate}T${next.startTime}:00.000Z`;
        next.endsAt = `${patch.meetingDate}T${next.endTime}:00.000Z`;
      }
      break;
    case "save_minutes":
      if (patch?.minutes) {
        next.minutes = patch.minutes;
        next.minutesMissing = !patch.minutes.summary.trim();
      }
      if (next.status === "needs_minutes" && !next.minutesMissing) {
        next.status = next.followUpRequired || next.decisions.length > 0 ? "needs_followup" : "completed";
      }
      break;
    case "close": {
      const readiness = meetingCloseReadiness(meeting, todayYmd);
      if (!readiness.canClose) break;
      next.status = "closed";
      next.isClosed = true;
      next.closedAt = now;
      next.minutesMissing = false;
      next.followUpStatus = "complete";
      break;
    }
  }

  return enrichMeetingComputed(next, todayYmd);
}
