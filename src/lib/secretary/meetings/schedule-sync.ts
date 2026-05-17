import type { SecretaryAppointment, SecretaryMeeting } from "@/lib/secretary/types";

/** Represent meetings on the secretary schedule calendar. */
export function meetingToScheduleAppointment(m: SecretaryMeeting): SecretaryAppointment {
  return {
    id: `meet-appt-${m.id}`,
    organizationId: m.organizationId,
    childId: m.childId,
    childLabel: m.childLabel,
    parentId: null,
    parentLabel: m.parentLabel,
    appointmentTypeCode: m.isEmergency ? "emergency_meeting" : "internal_meeting",
    appointmentTypeLabel: m.meetingTypeLabel,
    locationCode: m.locationCode,
    startsAt: m.startsAt,
    endsAt: m.endsAt,
    status: m.status === "confirmed" ? "confirmed" : m.status === "completed" ? "completed" : "scheduled",
    priority: m.priority,
    roomId: null,
    roomLabel: m.isClinical ? "Εποπτεία" : "Σύσταση",
    staffIds: [],
    staffLabels: m.participants,
    notes: `[Συνάντηση ${m.id}] ${m.agenda}`,
    reminderAt: null,
    reminderStatus: "none",
    sessionId: null,
  };
}

export function mergeMeetingsIntoAppointments(
  appointments: SecretaryAppointment[],
  meetings: SecretaryMeeting[]
): SecretaryAppointment[] {
  const openMeetings = meetings.filter((m) => !m.archived && m.status !== "cancelled");
  const meetingAppts = openMeetings.map(meetingToScheduleAppointment);
  const withoutMeetingShadow = appointments.filter((a) => !String(a.id).startsWith("meet-appt-"));
  return [...withoutMeetingShadow, ...meetingAppts].sort(
    (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt)
  );
}
