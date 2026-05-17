/**
 * Secretary schedule demo data — stable fallback when Supabase is unavailable.
 * Shifts anchor-day appointments to the viewer's current Athens day.
 */

export type SecretaryScheduleDataSource = "db" | "demo";

import {
  SECRETARY_DEMO_APPOINTMENTS,
  SECRETARY_DEMO_SCHEDULE_ANCHOR_YMD,
} from "@/lib/demo/secretary-demo-data";
import type { SecretaryAppointment } from "@/lib/secretary/types";
import {
  addDaysAthensCalendar,
  athensStartOfDayUtcIso,
  getSafeAthensYmd,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";
import { appointmentYmdAthens } from "@/lib/secretary/schedule-utils";

/** Civil day used when demo appointment times were authored (module load). */
export const SECRETARY_SCHEDULE_DEMO_ANCHOR_YMD = SECRETARY_DEMO_SCHEDULE_ANCHOR_YMD;

export function shiftSecretaryAppointmentsToYmd(
  appointments: SecretaryAppointment[],
  targetYmd: string,
  anchorYmd: string = SECRETARY_SCHEDULE_DEMO_ANCHOR_YMD
): SecretaryAppointment[] {
  const target = getSafeAthensYmd(targetYmd);
  const anchor = getSafeAthensYmd(anchorYmd);
  if (target === anchor) return appointments.map((a) => ({ ...a }));

  const a0 = Date.parse(athensStartOfDayUtcIso(anchor));
  const t0 = Date.parse(athensStartOfDayUtcIso(target));
  if (!Number.isFinite(a0) || !Number.isFinite(t0)) {
    return appointments.map((a) => ({ ...a }));
  }

  const deltaMs = t0 - a0;
  return appointments.map((a) => ({
    ...a,
    startsAt: new Date(Date.parse(a.startsAt) + deltaMs).toISOString(),
    endsAt: new Date(Date.parse(a.endsAt) + deltaMs).toISOString(),
  }));
}

/** Full secretary schedule board for a given day — never empty when anchor data exists. */
export function getSecretaryScheduleDemoAppointments(targetYmd?: string): SecretaryAppointment[] {
  const ymd = getSafeAthensYmd(targetYmd ?? todayAthensYmd());
  const shifted = shiftSecretaryAppointmentsToYmd(SECRETARY_DEMO_APPOINTMENTS, ymd);
  return shifted.length > 0 ? shifted : SECRETARY_DEMO_APPOINTMENTS;
}

/** Extend demo set across the current week for month/week views. */
export function getSecretaryScheduleDemoAppointmentsExpanded(targetYmd?: string): SecretaryAppointment[] {
  const base = getSecretaryScheduleDemoAppointments(targetYmd);
  const ymd = getSafeAthensYmd(targetYmd ?? todayAthensYmd());
  const extras: SecretaryAppointment[] = [];

  for (const a of base.slice(0, 4)) {
    const dayOffset = (a.id.charCodeAt(a.id.length - 1) % 3) + 1;
    const targetDay = addDaysAthensCalendar(ymd, dayOffset);
    const anchorDay = appointmentYmdAthens(a);
    const shifted = shiftSecretaryAppointmentsToYmd([a], targetDay, anchorDay);
    if (shifted[0]) {
      extras.push({
        ...shifted[0],
        id: `${a.id}-w${dayOffset}`,
      });
    }
  }

  const byId = new Map<string, SecretaryAppointment>();
  for (const row of [...base, ...extras]) {
    byId.set(row.id, row);
  }
  return [...byId.values()];
}
