import type { ScheduleConflict } from "./types";
import type { SecretaryAppointment } from "./types";
import { detectAppointmentConflicts } from "./conflicts";
import { warningsForChild, type ChildWarning, type ChildWarningsMap } from "./child-warnings";

export type AppointmentInsight = {
  appointmentId: string;
  conflicts: ScheduleConflict[];
  childWarnings: ChildWarning[];
  hasConflict: boolean;
  hasWarning: boolean;
};

export function buildAppointmentInsights(
  appointments: SecretaryAppointment[],
  childWarnings: ChildWarningsMap
): Map<string, AppointmentInsight> {
  const allConflicts = detectAppointmentConflicts(appointments);
  const byAppt = new Map<string, ScheduleConflict[]>();
  for (const c of allConflicts) {
    if (!c.appointmentId) continue;
    const list = byAppt.get(c.appointmentId) ?? [];
    list.push(c);
    byAppt.set(c.appointmentId, list);
  }

  const out = new Map<string, AppointmentInsight>();
  for (const a of appointments) {
    const conflicts = byAppt.get(a.id) ?? [];
    const cw = warningsForChild(childWarnings, a.childId);
    const hasConflict = conflicts.some((c) => c.alertLevel === "red");
    const hasWarning =
      conflicts.some((c) => c.alertLevel === "yellow") ||
      cw.some((w) => w.level === "yellow" || w.level === "red");
    out.set(a.id, {
      appointmentId: a.id,
      conflicts,
      childWarnings: cw,
      hasConflict,
      hasWarning: hasWarning && !hasConflict,
    });
  }
  return out;
}
