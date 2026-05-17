import type {
  CommunicationLog,
  ReportRequest,
  SecretaryAppointment,
  SecretaryMeeting,
  SecretaryTask,
} from "@/lib/secretary/types";

export function prefillMeetingFromTask(task: SecretaryTask): Partial<SecretaryMeeting> {
  return {
    childId: task.childId,
    childLabel: task.childLabel,
    parentLabel: task.parentLabel,
    locationCode: task.locationCode,
    staffMemberLabel: task.staffMemberLabel,
    linkedTaskIds: task.id ? [task.id] : [],
    title: `Συνάντηση — ${task.title}`,
    meetingTypeCode: task.taskTypeCode.includes("supervision") ? "case_supervision" : "admin_internal",
    agenda: task.notes ?? "",
    followUpRequired: true,
  };
}

export function prefillMeetingFromReport(report: ReportRequest): Partial<SecretaryMeeting> {
  return {
    childId: report.childId,
    childLabel: report.childLabel,
    parentLabel: report.parentLabel,
    locationCode: report.locationCode,
    staffMemberLabel: report.assignedTherapistLabel,
    linkedReportIds: [report.id],
    title: `Συνάντηση αναφοράς — ${report.childLabel}`,
    meetingTypeCode: "interdisciplinary",
    agenda: `${report.reportTypeLabel} · ${report.status}`,
    followUpRequired: true,
  };
}

export function prefillMeetingFromCommunication(log: CommunicationLog): Partial<SecretaryMeeting> {
  const type =
    log.contactRole === "school"
      ? "school"
      : log.contactRole === "parent"
        ? "parent"
        : "admin_internal";
  return {
    childId: log.childId,
    childLabel: log.childLabel,
    parentLabel: log.parentLabel,
    locationCode: log.locationCode,
    linkedCommunicationIds: [log.id],
    linkedTaskIds: log.linkedTaskId ? [log.linkedTaskId] : [],
    title: `Συνάντηση — ${log.reason}`,
    meetingTypeCode: type,
    agenda: log.summary,
    followUpRequired: log.nextActionRequired,
  };
}

export function prefillMeetingFromAppointment(appt: SecretaryAppointment): Partial<SecretaryMeeting> {
  const meetingDate = appt.startsAt.slice(0, 10);
  const startTime = appt.startsAt.slice(11, 16);
  const endTime = appt.endsAt.slice(11, 16);
  const therapist = appt.staffLabels[0] ?? null;
  return {
    childId: appt.childId,
    childLabel: appt.childLabel,
    parentLabel: appt.parentLabel,
    locationCode: appt.locationCode,
    linkedAppointmentIds: [appt.id],
    meetingDate,
    startTime,
    endTime,
    startsAt: appt.startsAt,
    endsAt: appt.endsAt,
    staffMemberLabel: therapist,
    title: `Συνάντηση — ${appt.childLabel ?? appt.appointmentTypeLabel}`,
    meetingTypeCode: "parent",
    participants: [...appt.staffLabels, "Γραμματεία"].filter(Boolean),
  };
}

export function prefillMeetingFromChild(childId: string, childLabel: string): Partial<SecretaryMeeting> {
  return {
    childId,
    childLabel,
    title: `Συνάντηση — ${childLabel}`,
    meetingTypeCode: "interdisciplinary",
  };
}

export function prefillMeetingFromStaff(staffLabel: string, department?: string | null): Partial<SecretaryMeeting> {
  return {
    staffMemberLabel: staffLabel,
    departmentSpecialty: department ?? null,
    participants: [staffLabel, "Επόπτης"],
    title: `Εποπτεία — ${staffLabel}`,
    meetingTypeCode: "individual_supervision",
  };
}
