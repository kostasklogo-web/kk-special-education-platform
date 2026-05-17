import type { SecretaryAppointment, SecretaryMeeting } from "@/lib/secretary/types";

export type MeetingConflict = {
  kind: "participant" | "room" | "child";
  message: string;
};

function timeOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string
): boolean {
  return Date.parse(aStart) < Date.parse(bEnd) && Date.parse(bEnd) > Date.parse(aStart);
}

export function detectMeetingConflicts(
  draft: Pick<
    SecretaryMeeting,
    "id" | "startsAt" | "endsAt" | "locationCode" | "participants" | "childId" | "meetingDate"
  >,
  meetings: SecretaryMeeting[],
  appointments: SecretaryAppointment[]
): MeetingConflict[] {
  const warnings: MeetingConflict[] = [];
  const others = meetings.filter((m) => m.id !== draft.id && !["cancelled"].includes(m.status));

  for (const p of draft.participants) {
    for (const m of others) {
      if (!m.participants.includes(p)) continue;
      if (timeOverlap(draft.startsAt, draft.endsAt, m.startsAt, m.endsAt)) {
        warnings.push({
          kind: "participant",
          message: `Διπλοκράτηση: ${p} έχει συνάντηση «${m.title}» την ίδια ώρα.`,
        });
      }
    }
    for (const a of appointments) {
      if (!a.staffLabels.includes(p) && a.parentLabel !== p) continue;
      if (timeOverlap(draft.startsAt, draft.endsAt, a.startsAt, a.endsAt)) {
        warnings.push({
          kind: "participant",
          message: `Διπλοκράτηση: ${p} έχει ραντεβού ${a.childLabel ?? ""} την ίδια ώρα.`,
        });
      }
    }
  }

  if (draft.childId) {
    for (const a of appointments) {
      if (a.childId !== draft.childId) continue;
      if (["cancelled", "no_show"].includes(a.status)) continue;
      if (timeOverlap(draft.startsAt, draft.endsAt, a.startsAt, a.endsAt)) {
        warnings.push({
          kind: "child",
          message: `Το παιδί έχει ραντεβού (${a.appointmentTypeLabel}) την ίδια ώρα.`,
        });
      }
    }
  }

  const sameLoc = others.filter(
    (m) =>
      m.locationCode === draft.locationCode &&
      draft.locationCode !== "online" &&
      draft.locationCode !== "phone"
  );
  for (const m of sameLoc) {
    if (timeOverlap(draft.startsAt, draft.endsAt, m.startsAt, m.endsAt)) {
      warnings.push({
        kind: "room",
        message: `Πιθανή σύγκρουση χώρου με «${m.title}».`,
      });
    }
  }

  return warnings;
}
