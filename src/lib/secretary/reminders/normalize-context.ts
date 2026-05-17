import { SECRETARY_CENTER_EMAIL, SECRETARY_CENTER_NAME, SECRETARY_CENTER_PHONE } from "./config";
import type { ReminderMessageContext } from "./types";

/** Flat map for {placeholder} substitution (supports legacy recipient_name). */
export function normalizeReminderContext(
  context: ReminderMessageContext
): Record<string, string> {
  const parentName = context.parent_name || context.recipient_name || "—";
  return {
    parent_name: parentName,
    recipient_name: parentName,
    child_name: context.child_name || "—",
    appointment_date: context.appointment_date ?? "—",
    appointment_time: context.appointment_time ?? "—",
    appointment_type: context.appointment_type ?? "—",
    location: context.location ?? "—",
    amount_due: context.amount_due ?? "—",
    due_date: context.due_date ?? "—",
    document_type: context.document_type ?? context.appointment_type ?? "—",
    expiry_date: context.expiry_date ?? context.due_date ?? "—",
    center_phone: context.center_phone || SECRETARY_CENTER_PHONE,
    center_email: context.center_email || SECRETARY_CENTER_EMAIL,
    center_name: context.center_name || SECRETARY_CENTER_NAME,
  };
}

export function withDefaultCenterFields(
  partial: Omit<ReminderMessageContext, "center_phone" | "center_email" | "center_name"> &
    Partial<Pick<ReminderMessageContext, "center_phone" | "center_email" | "center_name">>
): ReminderMessageContext {
  return {
    center_phone: SECRETARY_CENTER_PHONE,
    center_email: SECRETARY_CENTER_EMAIL,
    center_name: SECRETARY_CENTER_NAME,
    ...partial,
    parent_name: partial.parent_name || partial.recipient_name || "—",
    recipient_name: partial.recipient_name || partial.parent_name || "—",
  };
}
