/** Center contact — replace via env in production. */
export const SECRETARY_CENTER_NAME =
  process.env.NEXT_PUBLIC_CENTER_NAME?.trim() || "Κέντρο Ειδικής Αγωγής & Mental Health";

export const SECRETARY_CENTER_PHONE =
  process.env.NEXT_PUBLIC_CENTER_PHONE?.trim() || "210 555 0100";

export const SECRETARY_CENTER_EMAIL =
  process.env.NEXT_PUBLIC_CENTER_EMAIL?.trim() || "grammateia@kentro-parxis.gr";

export const REMINDER_CHANNEL_LABELS: Record<
  import("./types").ReminderChannel,
  string
> = {
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  viber: "Viber",
  phone_call: "Τηλεφωνική κλήση (καταγραφή)",
};

export const REMINDER_STATUS_LABELS: Record<import("./types").ReminderStatus, string> = {
  pending: "Εκκρεμεί",
  scheduled: "Προγραμματισμένη",
  copied: "Αντιγράφηκε",
  sent: "Στάλθηκε",
  completed: "Ολοκληρώθηκε",
  failed: "Απέτυχε",
  cancelled: "Ακυρώθηκε",
};

/** Short message channels use bodyShort; email uses bodyLong. */
export function isShortMessageChannel(channel: import("./types").ReminderChannel): boolean {
  return channel === "sms" || channel === "whatsapp" || channel === "viber" || channel === "phone_call";
}
