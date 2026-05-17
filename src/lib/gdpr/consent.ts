import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import type { ConsentChannel, ConsentRecord } from "./types";
import { channelAllowed as reminderChannelAllowed } from "@/lib/secretary/reminders/consent";

const CONSENT_STORAGE_KEY = "gdpr-consent-records-v1";

export const CONSENT_UPDATED_EVENT = "gdpr-consent-updated";

export const CONSENT_CHANNEL_LABELS: Record<ConsentChannel, string> = {
  phone: "Τηλεφωνική επικοινωνία",
  sms: "SMS",
  email: "Email",
  whatsapp: "WhatsApp",
  viber: "Viber",
  school: "Επικοινωνία με σχολείο",
  doctor: "Επικοινωνία με γιατρό",
  report_sharing: "Κοινοποίηση αναφορών",
  parent_portal: "Πρόσβαση πύλης γονέα",
  external_professionals: "Εξωτερικοί επαγγελματίες",
};

const DEFAULT_CONSENT_VERSION = "2026-05-v1";

function loadConsents(): ConsentRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConsentRecord[]) : [];
  } catch {
    return [];
  }
}

function persistConsents(records: ConsentRecord[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(records));
  window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT));
}

export function getConsentRecords(childId?: string | null): ConsentRecord[] {
  const all = loadConsents();
  if (!childId) return all;
  return all.filter((c) => c.childId === childId);
}

export function upsertConsentRecord(record: ConsentRecord): void {
  const list = loadConsents();
  const idx = list.findIndex(
    (c) => c.childId === record.childId && c.channel === record.channel
  );
  if (idx >= 0) list[idx] = record;
  else list.push(record);
  persistConsents(list);
}

/** Bridge reminder CommunicationConsent → channel check (backward compatible). */
export function gdprChannelAllowed(
  consent: CommunicationConsent | undefined,
  channel: ConsentChannel
): boolean {
  if (!consent) return false;
  const reminderChannel =
    channel === "phone"
      ? "phone_call"
      : channel === "sms"
        ? "sms"
        : channel === "email"
          ? "email"
          : channel === "whatsapp"
            ? "whatsapp"
            : channel === "viber"
              ? "viber"
              : null;
  if (reminderChannel) {
    return reminderChannelAllowed(consent, reminderChannel as "sms");
  }
  return true;
}

export function gdprConsentWarning(
  channel: ConsentChannel,
  granted: boolean
): string | null {
  if (granted) return null;
  return `Δεν υπάρχει έγκριτη συγκατάθεση για ${CONSENT_CHANNEL_LABELS[channel]} (GDPR). Η αποστολή απαιτεί ενημέρωση ή ενημέρωση καταχώρησης συγκατάθεσης.`;
}

export function consentFromReminder(
  c: CommunicationConsent,
  channel: ConsentChannel
): ConsentRecord {
  return {
    id: c.id,
    organizationId: c.organizationId,
    childId: c.childId,
    parentId: c.parentId,
    channel,
    granted:
      channel === "sms"
        ? c.smsConsent
        : channel === "email"
          ? c.emailConsent
          : channel === "whatsapp"
            ? c.whatsappConsent
            : channel === "viber"
              ? c.viberConsent
              : channel === "phone"
                ? Boolean(c.phone)
                : false,
    consentDate: new Date().toISOString().slice(0, 10),
    method: "digital",
    providedByLabel: c.recipientName,
    consentTextVersion: DEFAULT_CONSENT_VERSION,
    notes: null,
    updatedAt: new Date().toISOString(),
  };
}

export { DEFAULT_CONSENT_VERSION };
