import type { ReminderEntityType } from "./types";
import type { ReminderTemplateDef } from "./templates";
import { REMINDER_TEMPLATES } from "./templates";

export type CommunicationEntityKind = ReminderEntityType | "child" | "task";

const ENTITY_TEMPLATE_CATEGORIES: Record<CommunicationEntityKind, ReminderTemplateDef["category"][] | "all"> = {
  child: "all",
  appointment: ["appointment"],
  payment: ["payment"],
  diagnosis: ["diagnosis"],
  report: ["report"],
  meeting: ["meeting"],
  task: "all",
};

export function templatesForEntity(kind: CommunicationEntityKind): ReminderTemplateDef[] {
  const cats = ENTITY_TEMPLATE_CATEGORIES[kind];
  if (cats === "all") return [...REMINDER_TEMPLATES];
  return REMINDER_TEMPLATES.filter((t) => cats.includes(t.category));
}

export function defaultTemplateForEntity(kind: CommunicationEntityKind): ReminderTemplateDef["code"] {
  switch (kind) {
    case "appointment":
      return "appointment_confirmation";
    case "payment":
      return "payment_due_soon";
    case "diagnosis":
      return "diagnosis_renewal";
    case "report":
      return "progress_report_ready";
    case "task":
      return "no_show_followup";
    case "child":
      return "appointment_confirmation";
    case "meeting":
      return "meeting_internal_reminder";
    default:
      return "appointment_confirmation";
  }
}
