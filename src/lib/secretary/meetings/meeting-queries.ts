import type { RoleCode } from "@/lib/auth/roles";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";

export type MeetingsRoleView = "secretary" | "supervisor" | "clinical_director" | "ceo" | "therapist";

export function resolveMeetingsRoleView(
  roleCodes: RoleCode[],
  param?: string | null
): MeetingsRoleView {
  if (param === "supervisor" && roleCodes.includes("SUPERVISOR")) return "supervisor";
  if (param === "clinical" && roleCodes.some((r) => ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"].includes(r)))
    return "clinical_director";
  if (param === "ceo" && roleCodes.some((r) => ["ORG_OWNER", "ORG_ADMIN"].includes(r))) return "ceo";
  if (roleCodes.includes("ORG_OWNER") || roleCodes.includes("ORG_ADMIN")) return "ceo";
  if (roleCodes.includes("SUPERVISOR")) return "supervisor";
  return "secretary";
}

export function meetingsForSupervisor(meetings: SecretaryMeeting[]): SecretaryMeeting[] {
  return meetings.filter((m) => m.isClinical || m.meetingTypeCode === "supervisor");
}

export function meetingsForClinicalDirector(meetings: SecretaryMeeting[]): SecretaryMeeting[] {
  return meetings.filter((m) => m.isClinical);
}

export function meetingsForChild(meetings: SecretaryMeeting[], childId: string): SecretaryMeeting[] {
  return meetings.filter((m) => m.childId === childId);
}

export function meetingsForStaff(meetings: SecretaryMeeting[], staffLabel: string): SecretaryMeeting[] {
  const q = staffLabel.toLowerCase();
  return meetings.filter(
    (m) =>
      m.staffMemberLabel?.toLowerCase().includes(q) ||
      m.participants.some((p) => p.toLowerCase().includes(q))
  );
}

export function meetingsDueToday(meetings: SecretaryMeeting[], todayYmd: string): SecretaryMeeting[] {
  return meetings.filter((m) => m.meetingDate === todayYmd && !["cancelled"].includes(m.status));
}

export function meetingsUpcomingWeek(meetings: SecretaryMeeting[], todayYmd: string): SecretaryMeeting[] {
  const end = addDaysAthensCalendar(todayYmd, 7);
  return meetings.filter(
    (m) =>
      m.meetingDate >= todayYmd &&
      m.meetingDate <= end &&
      !["completed", "cancelled"].includes(m.status)
  );
}
