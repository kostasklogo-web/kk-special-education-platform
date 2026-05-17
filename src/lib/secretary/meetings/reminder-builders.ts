import type { SecretaryMeeting } from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import type { OpenReminderPayload } from "@/components/secretary/reminders/reminder-payload";
import type { ReminderTemplateCode } from "@/lib/secretary/reminders/types";
import { withDefaultCenterFields } from "@/lib/secretary/reminders/normalize-context";

export function meetingReminderTemplate(m: SecretaryMeeting): ReminderTemplateCode {
  if (m.isEmergency) return "meeting_emergency_reminder";
  if (m.status === "needs_minutes" || m.minutesMissing) return "meeting_minutes_missing";
  if (m.followUpStatus === "overdue" || m.followUpStatus === "pending") return "meeting_decision_followup";
  if (m.isClinical) return "meeting_supervision_reminder";
  return "meeting_internal_reminder";
}

export function buildMeetingReminderPayload(
  meeting: SecretaryMeeting,
  _consents: CommunicationConsent[]
): OpenReminderPayload {
  const recipient = meeting.participants[0] ?? meeting.organizerLabel;
  return {
    templateCode: meetingReminderTemplate(meeting),
    entityType: "meeting",
    entityId: meeting.id,
    childId: meeting.childId,
    childLabel: meeting.childLabel,
    recipientName: recipient,
    recipientPhone: null,
    recipientEmail: null,
    context: withDefaultCenterFields({
      parent_name: recipient,
      child_name: meeting.childLabel ?? "—",
      appointment_type: meeting.meetingTypeLabel,
      appointment_date: meeting.meetingDate,
      appointment_time: meeting.startTime,
      location: meeting.locationCode,
      due_date: meeting.decisions.find((d) => d.dueDate)?.dueDate ?? meeting.meetingDate,
    }),
    suggestedChannel: meeting.isEmergency ? "sms" : "email",
  };
}
