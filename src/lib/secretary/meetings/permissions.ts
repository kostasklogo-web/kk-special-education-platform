import type { RoleCode } from "@/lib/auth/roles";
import type { SecretaryMeeting } from "@/lib/secretary/types";
import { canPerformGdprAction } from "@/lib/gdpr/permissions";

const SECRETARY: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "RECEPTION"];
const CEO: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN"];
const SUPERVISOR: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];
const CLINICAL: RoleCode[] = ["ORG_OWNER", "ORG_ADMIN", "SUPERVISOR"];
const THERAPIST: RoleCode[] = [];

export function canViewMeetings(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => [...SECRETARY, ...SUPERVISOR, ...CLINICAL].includes(r));
}

export function canManageMeetings(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SECRETARY.includes(r));
}

export function canEditAllMeetings(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r));
}

export function canAddSupervisionMinutes(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => SUPERVISOR.includes(r) || CEO.includes(r));
}

export function canViewManagementNotes(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r));
}

export function canViewHrNotes(roleCodes: RoleCode[]): boolean {
  return roleCodes.some((r) => CEO.includes(r) || roleCodes.includes("ORG_ADMIN"));
}

export function canViewClinicalMinutes(roleCodes: RoleCode[], meeting: SecretaryMeeting): boolean {
  if (canEditAllMeetings(roleCodes)) return true;
  if (canAddSupervisionMinutes(roleCodes) && meeting.isClinical) return true;
  if (canManageMeetings(roleCodes)) return !meeting.isClinical;
  return false;
}

export function canExportMeetings(roleCodes: RoleCode[]): boolean {
  return canPerformGdprAction("export", "meetings", { roleCodes, userId: null });
}

export function meetingsForParticipant(
  meetings: SecretaryMeeting[],
  participantLabel: string | null
): SecretaryMeeting[] {
  if (!participantLabel) return [];
  const q = participantLabel.toLowerCase();
  return meetings.filter((m) =>
    m.participants.some((p) => p.toLowerCase().includes(q)) ||
    m.organizerLabel.toLowerCase().includes(q) ||
    m.staffMemberLabel?.toLowerCase().includes(q)
  );
}
