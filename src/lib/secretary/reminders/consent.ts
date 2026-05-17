import type { CommunicationConsent, ReminderChannel } from "./types";

export function channelAllowed(consent: CommunicationConsent | null, channel: ReminderChannel): boolean {
  if (channel === "phone_call") return true;
  if (!consent) return false;
  switch (channel) {
    case "sms":
      return consent.smsConsent;
    case "email":
      return consent.emailConsent;
    case "whatsapp":
      return consent.whatsappConsent;
    case "viber":
      return consent.viberConsent;
    default:
      return false;
  }
}

export function consentWarning(
  consent: CommunicationConsent | null,
  channel: ReminderChannel
): string | null {
  if (channel === "phone_call") return null;
  if (!consent) {
    return "Δεν υπάρχει καταχωρημένη συγκατάθεση επικοινωνίας. Χρησιμοποιήστε μόνο καταγραφή τηλεφωνικής κλήσης ή ενημερώστε τον γονέα για GDPR.";
  }
  if (!channelAllowed(consent, channel)) {
    return `Ο γονέας δεν έχει συγκαταθέσει ${channel === "sms" ? "SMS" : channel === "email" ? "email" : channel}. Επιτρέπεται μόνο τηλεφωνική κλήση με καταγραφή.`;
  }
  return null;
}
