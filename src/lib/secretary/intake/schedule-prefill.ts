import type { ClientIntake, LeadStatus } from "@/lib/secretary/types";
import type { SecretaryScheduleTypeCode } from "@/lib/secretary/schedule-catalog";
import { getAllIntakes, upsertIntake } from "./store";

export type IntakeSchedulePrefill = {
  intakeId: string;
  childId: string;
  childLabel: string;
  parentLabel: string;
  parentPhone: string | null;
  typeCode: SecretaryScheduleTypeCode;
};

export function childLabelFromIntake(intake: ClientIntake): string {
  return `${intake.childLastName} ${intake.childFirstName}`.trim();
}

export function prefillFromIntake(
  intake: ClientIntake,
  typeCode: SecretaryScheduleTypeCode
): IntakeSchedulePrefill {
  const childId = intake.childId ?? `intake-child-${intake.id}`;
  return {
    intakeId: intake.id,
    childId,
    childLabel: childLabelFromIntake(intake),
    parentLabel: intake.parentPrimaryName || intake.parentNames,
    parentPhone: intake.phonePrimary,
    typeCode,
  };
}

export function leadStatusForAppointmentType(typeCode: string): LeadStatus | null {
  switch (typeCode) {
    case "parent_info":
      return "parent_info_scheduled";
    case "history_taking":
      return "history_scheduled";
    case "evaluation":
    case "reevaluation":
      return "evaluation_scheduled";
    default:
      return null;
  }
}

export function updateIntakeLeadAfterAppointment(
  intakeId: string,
  appointmentTypeCode: string
): ClientIntake | null {
  const nextStatus = leadStatusForAppointmentType(appointmentTypeCode);
  if (!nextStatus) return null;

  const intake = getAllIntakes().find((i) => i.id === intakeId);
  if (!intake) return null;

  const updated: ClientIntake = {
    ...intake,
    leadStatus: nextStatus,
    updatedAt: new Date().toISOString(),
  };
  upsertIntake(updated);
  return updated;
}

export function scheduleUrlFromIntake(intake: ClientIntake, typeCode: SecretaryScheduleTypeCode): string {
  const p = new URLSearchParams({
    action: "new",
    type: typeCode,
    intake: intake.id,
  });
  return `/secretary/schedule?${p.toString()}`;
}

export function findIntakeForSchedule(intakeId: string): ClientIntake | null {
  return getAllIntakes().find((i) => i.id === intakeId) ?? null;
}
