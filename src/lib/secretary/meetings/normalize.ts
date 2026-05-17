import type { InternalMeeting, MeetingMinutes, SecretaryMeeting } from "@/lib/secretary/types";
import { meetingTypeLabel, isClinicalMeetingType, isEmergencyMeetingType } from "./catalog";
import { emptyMinutes } from "./calculations";
import { inferRiskFlags } from "./meeting-governance";

function legacyStatusToMeeting(status: string): SecretaryMeeting["status"] {
  if (status === "confirmed") return "confirmed";
  if (status === "completed") return "completed";
  if (status === "cancelled") return "cancelled";
  if (status === "rescheduled") return "postponed";
  return "scheduled";
}

export function normalizeMeeting(
  partial: Partial<SecretaryMeeting> & Pick<SecretaryMeeting, "id">,
  todayYmd: string
): SecretaryMeeting {
  const now = partial.updatedAt ?? partial.createdAt ?? new Date().toISOString();
  const meetingDate = partial.meetingDate ?? partial.startsAt?.slice(0, 10) ?? todayYmd;
  const startTime = partial.startTime ?? partial.startsAt?.slice(11, 16) ?? "10:00";
  const endTime = partial.endTime ?? partial.endsAt?.slice(11, 16) ?? "11:00";
  const startsAt =
    partial.startsAt ?? `${meetingDate}T${startTime.length === 5 ? startTime : "10:00"}:00.000Z`;
  const endsAt = partial.endsAt ?? `${meetingDate}T${endTime.length === 5 ? endTime : "11:00"}:00.000Z`;
  const rawType = String(partial.meetingTypeCode ?? "other");
  const typeCode = (
    rawType === "supervision" ? "group_supervision" : rawType
  ) as SecretaryMeeting["meetingTypeCode"];
  const participants = partial.participants?.length
    ? partial.participants
    : partial.requiredParticipants?.length
      ? partial.requiredParticipants
      : [];

  const minutes = partial.minutes ?? null;
  const decisions = partial.decisions ?? [];
  const status = partial.status ?? "scheduled";
  const followUpRequired = partial.followUpRequired ?? decisions.some((d) => d.status !== "completed");
  const minutesMissing =
    partial.minutesMissing ??
    (["completed", "needs_followup", "needs_minutes"].includes(status) && !minutes?.summary?.trim());

  const base: SecretaryMeeting = {
    id: partial.id,
    organizationId: partial.organizationId ?? "",
    title: partial.title ?? meetingTypeLabel(typeCode),
    meetingTypeCode: typeCode,
    meetingTypeLabel: partial.meetingTypeLabel ?? meetingTypeLabel(typeCode),
    locationCode: partial.locationCode ?? "nikaia",
    meetingDate,
    startTime,
    endTime,
    startsAt,
    endsAt,
    organizerLabel: partial.organizerLabel ?? "Γραμματεία",
    participants,
    requiredParticipants: partial.requiredParticipants ?? participants,
    optionalParticipants: partial.optionalParticipants ?? [],
    childId: partial.childId ?? null,
    childLabel: partial.childLabel ?? null,
    parentLabel: partial.parentLabel ?? null,
    staffMemberLabel: partial.staffMemberLabel ?? null,
    departmentSpecialty: partial.departmentSpecialty ?? null,
    priority: partial.priority ?? "normal",
    status,
    agenda: partial.agenda ?? "",
    minutes,
    minutesMissing,
    decisions,
    followUpRequired,
    linkedTaskIds: partial.linkedTaskIds ?? [],
    linkedReportIds: partial.linkedReportIds ?? [],
    linkedAppointmentIds: partial.linkedAppointmentIds ?? [],
    linkedCommunicationIds: partial.linkedCommunicationIds ?? [],
    linkedPerformanceReviewId: partial.linkedPerformanceReviewId ?? null,
    isClinical: partial.isClinical ?? isClinicalMeetingType(typeCode),
    isEmergency: partial.isEmergency ?? isEmergencyMeetingType(typeCode),
    clinicalRiskFlag: partial.clinicalRiskFlag ?? false,
    hrRiskFlag: partial.hrRiskFlag ?? false,
    isClosed: partial.isClosed ?? partial.status === "closed",
    closedAt: partial.closedAt ?? null,
    createdByLabel: partial.createdByLabel ?? "Γραμματεία",
    createdAt: partial.createdAt ?? now,
    updatedByLabel: partial.updatedByLabel ?? partial.createdByLabel ?? "Γραμματεία",
    updatedAt: partial.updatedAt ?? now,
    archived: partial.archived ?? false,
    alertLevel: partial.alertLevel ?? "green",
    followUpStatus: partial.followUpStatus ?? "none",
    isToday: partial.isToday ?? meetingDate === todayYmd,
    isUpcoming: partial.isUpcoming ?? meetingDate > todayYmd,
  };

  return enrichMeetingComputed(base, todayYmd);
}

export function enrichMeetingComputed(m: SecretaryMeeting, todayYmd: string): SecretaryMeeting {
  const openDecisions = m.decisions.filter((d) => !["completed", "cancelled"].includes(d.status));
  const overdueDecisions = openDecisions.filter((d) => d.dueDate && d.dueDate < todayYmd);
  let followUpStatus = m.followUpStatus;
  if (openDecisions.length === 0 && !m.followUpRequired) followUpStatus = "none";
  else if (overdueDecisions.length > 0) followUpStatus = "overdue";
  else if (openDecisions.length > 0 || m.followUpRequired) followUpStatus = "pending";
  else followUpStatus = "complete";

  let alertLevel = m.alertLevel;
  if (m.isEmergency && !["completed", "cancelled"].includes(m.status)) alertLevel = "red";
  else if (followUpStatus === "overdue") alertLevel = "red";
  else if (m.minutesMissing) alertLevel = "yellow";
  else if (followUpStatus === "pending") alertLevel = "yellow";
  else if (m.status === "completed") alertLevel = "green";
  else if (m.isUpcoming) alertLevel = "yellow";

  let status = m.status;
  if (m.isClosed) status = "closed";
  else if (m.status === "completed" && m.minutesMissing) status = "needs_minutes";
  else if (m.status === "completed" && followUpStatus === "pending") status = "needs_followup";
  else if (openDecisions.some((d) => d.status === "open") && m.status === "completed")
    status = "pending_decision";

  const risk = inferRiskFlags(m);

  return {
    ...m,
    ...risk,
    status,
    followUpStatus,
    alertLevel,
    isToday: m.meetingDate === todayYmd,
    isUpcoming: m.meetingDate > todayYmd,
    minutesMissing: m.minutesMissing || (status === "needs_minutes" && !m.minutes?.summary?.trim()),
  };
}

export function migrateLegacyMeeting(legacy: InternalMeeting, todayYmd: string): SecretaryMeeting {
  return normalizeMeeting(
    {
      id: legacy.id,
      title: legacy.meetingTypeLabel,
      meetingTypeCode: legacy.meetingTypeCode as SecretaryMeeting["meetingTypeCode"],
      meetingTypeLabel: legacy.meetingTypeLabel,
      childId: legacy.childId,
      childLabel: legacy.childLabel,
      agenda: legacy.agenda,
      startsAt: legacy.startsAt,
      endsAt: legacy.endsAt,
      locationCode: legacy.locationCode,
      status: legacyStatusToMeeting(legacy.status),
      participants: legacy.attendeeLabels,
      requiredParticipants: legacy.attendeeLabels,
    },
    todayYmd
  );
}

export { emptyMinutes };
