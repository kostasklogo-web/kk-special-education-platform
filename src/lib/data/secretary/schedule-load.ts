import "server-only";

import {
  getDemoOrganizationId,
  DEMO_PRIMARY_CENTER_ID,
  DEMO_SECONDARY_CENTER_ID,
  getAuthGatingTemporarilyDisabled,
} from "@/lib/config/demo";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { createClient } from "@/lib/supabase/server";
import { listSessionsInRange } from "@/lib/data/sessions/queries";
import type { SessionListItem, SessionStatus } from "@/lib/data/sessions/types";
import {
  getSecretaryScheduleDemoAppointmentsExpanded,
  type SecretaryScheduleDataSource,
} from "@/lib/secretary/schedule-demo";
import { appointmentTypeByCode, parentLabelForChild } from "@/lib/secretary/schedule-catalog";
import type {
  AppointmentLocationCode,
  SecretaryAppointment,
  SecretaryAppointmentStatus,
} from "@/lib/secretary/types";
import {
  addDaysAthensCalendar,
  athensEndOfDayUtcIso,
  athensStartOfDayUtcIso,
  todayAthensYmd,
} from "@/lib/schedule/athens-civil";

export type { SecretaryScheduleDataSource };

export type SecretaryScheduleLoadResult = {
  appointments: SecretaryAppointment[];
  source: SecretaryScheduleDataSource;
  organizationId: string;
};

const SESSION_KIND_TO_TYPE: Record<string, string> = {
  individual: "therapy_session",
  group: "group_program",
  assessment: "evaluation",
  parent_counseling: "parent_counseling",
  supervision: "supervision",
};

function mapSessionStatus(status: SessionStatus): SecretaryAppointmentStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "cancelled":
      return "cancelled";
    case "no_show":
    case "absence":
      return "no_show";
    case "to_reschedule":
      return "rescheduled";
    default:
      return "scheduled";
  }
}

function centerToLocation(centerId: string): AppointmentLocationCode {
  if (centerId === DEMO_SECONDARY_CENTER_ID) return "evosmos";
  return "nikaia";
}

function sessionToSecretaryAppointment(s: SessionListItem, organizationId: string): SecretaryAppointment {
  const typeCode = SESSION_KIND_TO_TYPE[s.session_kind] ?? "therapy_session";
  const type = appointmentTypeByCode(typeCode);
  return {
    id: `sess-${s.id}`,
    organizationId,
    childId: s.child_id,
    childLabel: s.child_name,
    parentId: null,
    parentLabel: parentLabelForChild(s.child_id),
    appointmentTypeCode: typeCode,
    appointmentTypeLabel: type?.nameEl ?? s.discipline_name_el ?? "Συνεδρία",
    locationCode: centerToLocation(s.center_id),
    startsAt: s.starts_at,
    endsAt: s.ends_at,
    status: mapSessionStatus(s.status),
    priority: "normal",
    roomId: s.room_id,
    roomLabel: s.room_name,
    staffIds: [s.therapist_user_id],
    staffLabels: [s.therapist_name ?? "Θεραπευτής"],
    notes: s.internal_notes ?? "",
    reminderAt: null,
    reminderStatus: "none",
    sessionId: s.id,
  };
}

async function loadSessionsAsAppointments(organizationId: string): Promise<SecretaryAppointment[]> {
  const today = todayAthensYmd();
  const fromIso = athensStartOfDayUtcIso(addDaysAthensCalendar(today, -7));
  const toIso = athensEndOfDayUtcIso(addDaysAthensCalendar(today, 21));

  const { items, error } = await listSessionsInRange({
    organizationId,
    fromIso,
    toIso,
  });

  if (error || items.length === 0) return [];
  return items.map((s) => sessionToSecretaryAppointment(s, organizationId));
}

async function loadSecretaryAppointmentsTable(organizationId: string): Promise<SecretaryAppointment[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("secretary_appointments")
      .select("*")
      .eq("organization_id", organizationId)
      .is("deleted_at", null)
      .limit(500);

    if (error || !data?.length) return [];

    return data.map((row) => {
      const r = row as Record<string, unknown>;
      const typeCode = String(r.appointment_type_code ?? "therapy_session");
      const type = appointmentTypeByCode(typeCode);
      return {
        id: String(r.id),
        organizationId,
        childId: (r.child_id as string) ?? null,
        childLabel: (r.child_label as string) ?? null,
        parentId: (r.parent_id as string) ?? null,
        parentLabel: (r.parent_label as string) ?? null,
        appointmentTypeCode: typeCode,
        appointmentTypeLabel: type?.nameEl ?? String(r.appointment_type_label ?? typeCode),
        locationCode: (r.location_code as AppointmentLocationCode) ?? "nikaia",
        startsAt: String(r.starts_at),
        endsAt: String(r.ends_at),
        status: (r.status as SecretaryAppointmentStatus) ?? "scheduled",
        priority: (r.priority as SecretaryAppointment["priority"]) ?? "normal",
        roomId: (r.room_id as string) ?? null,
        roomLabel: (r.room_label as string) ?? null,
        staffIds: Array.isArray(r.staff_ids) ? (r.staff_ids as string[]) : [],
        staffLabels: Array.isArray(r.staff_labels) ? (r.staff_labels as string[]) : [],
        notes: String(r.notes ?? ""),
        reminderAt: (r.reminder_at as string) ?? null,
        reminderStatus: (r.reminder_status as SecretaryAppointment["reminderStatus"]) ?? "none",
        sessionId: (r.session_id as string) ?? null,
      };
    });
  } catch {
    return [];
  }
}

/**
 * Loads secretary schedule appointments: Supabase (secretary_appointments or sessions) when available,
 * otherwise stable shifted demo data.
 */
export async function loadSecretaryScheduleAppointments(
  organizationIdInput?: string | null
): Promise<SecretaryScheduleLoadResult> {
  const organizationId = organizationIdInput?.trim() || getDemoOrganizationId();

  const demo = getSecretaryScheduleDemoAppointmentsExpanded();

  const tryDb =
    organizationId.length > 0 &&
    (!getAuthGatingTemporarilyDisabled() || (await isSupabaseReachableQuickly()));

  if (tryDb) {
    const fromTable = await loadSecretaryAppointmentsTable(organizationId);
    if (fromTable.length > 0) {
      return { appointments: fromTable, source: "db", organizationId };
    }

    const fromSessions = await loadSessionsAsAppointments(organizationId);
    if (fromSessions.length > 0) {
      return { appointments: fromSessions, source: "db", organizationId };
    }
  }

  return {
    appointments: demo,
    source: "demo",
    organizationId: organizationId || getDemoOrganizationId(),
  };
}
