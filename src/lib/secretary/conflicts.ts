import type { SecretaryAppointment } from "./types";
import type { ScheduleConflict } from "./types";
import { athensHourMinute } from "./schedule-utils";
import { SECRETARY_WORKING_HOUR_END, SECRETARY_WORKING_HOUR_START } from "./scheduling-rules";

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

function staffOverlap(a: SecretaryAppointment, b: SecretaryAppointment): boolean {
  if (a.staffIds.length === 0 || b.staffIds.length === 0) return false;
  return a.staffIds.some((id) => b.staffIds.includes(id));
}

/** Detect conflicts among appointments. */
export function detectAppointmentConflicts(appointments: SecretaryAppointment[]): ScheduleConflict[] {
  const out: ScheduleConflict[] = [];
  const active = appointments.filter((a) => !["cancelled", "completed"].includes(a.status));

  for (let i = 0; i < active.length; i++) {
    const a = active[i];
    const aStart = Date.parse(a.startsAt);
    const aEnd = Date.parse(a.endsAt);

    const { hour: startHour, minute: startMin } = athensHourMinute(a.startsAt);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = startMinutes + Math.round((aEnd - aStart) / 60000);
    const windowStart = SECRETARY_WORKING_HOUR_START * 60;
    const windowEnd = SECRETARY_WORKING_HOUR_END * 60;

    if (startMinutes < windowStart || endMinutes > windowEnd) {
      out.push({
        id: `hours-${a.id}`,
        kind: "hours",
        message: `Εκτός ωραρίου 13:00–21:00: ${a.childLabel ?? a.appointmentTypeLabel}`,
        appointmentId: a.id,
        alertLevel: "red",
      });
    }

    if (!a.roomId && ["scheduled", "confirmed"].includes(a.status)) {
      out.push({
        id: `room-missing-${a.id}`,
        kind: "room",
        message: `Χωρίς αίθουσα: ${a.childLabel ?? "—"}`,
        appointmentId: a.id,
        alertLevel: "yellow",
      });
    }

    if (a.staffIds.length === 0 && ["scheduled", "confirmed"].includes(a.status)) {
      out.push({
        id: `therapist-missing-${a.id}`,
        kind: "therapist",
        message: `Χωρίς θεραπευτή: ${a.childLabel ?? a.appointmentTypeLabel}`,
        appointmentId: a.id,
        alertLevel: "yellow",
      });
    }

    for (let j = i + 1; j < active.length; j++) {
      const b = active[j];
      const bStart = Date.parse(b.startsAt);
      const bEnd = Date.parse(b.endsAt);
      if (!overlaps(aStart, aEnd, bStart, bEnd)) continue;

      if (a.childId && b.childId && a.childId === b.childId) {
        out.push({
          id: `child-${a.id}-${b.id}`,
          kind: "child",
          message: `Διπλό ραντεβού παιδιού: ${a.childLabel}`,
          appointmentId: a.id,
          alertLevel: "red",
        });
      }
      if (a.roomId && b.roomId && a.roomId === b.roomId) {
        out.push({
          id: `room-${a.id}-${b.id}`,
          kind: "room",
          message: `Διπλή κράτηση ${a.roomLabel}`,
          appointmentId: a.id,
          alertLevel: "red",
        });
      }
      if (staffOverlap(a, b)) {
        const name = a.staffLabels[0] ?? "Θεραπευτής";
        out.push({
          id: `therapist-${a.id}-${b.id}`,
          kind: "therapist",
          message: `Διπλό πρόγραμμα ${name}`,
          appointmentId: a.id,
          alertLevel: "red",
        });
      }
    }
  }

  return out;
}

/** Conflicts for a single appointment against the full set (for modal preview). */
export function conflictsForDraft(
  draft: SecretaryAppointment,
  all: SecretaryAppointment[]
): ScheduleConflict[] {
  const others = all.filter((a) => a.id !== draft.id);
  return detectAppointmentConflicts([...others, draft]).filter(
    (c) => c.appointmentId === draft.id
  );
}
