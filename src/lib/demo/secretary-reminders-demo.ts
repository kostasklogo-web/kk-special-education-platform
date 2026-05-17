import type { CommunicationConsent, ReminderRecord } from "@/lib/secretary/reminders/types";

const ORG = "10000000-0000-4000-8000-000000000001";

export const SECRETARY_DEMO_CONSENTS: CommunicationConsent[] = [
  {
    id: "consent-101",
    organizationId: ORG,
    childId: "20000000-0000-4000-8000-000000000101",
    parentId: null,
    recipientName: "Παπαδόπουλου Μαρία",
    phone: "6911111111",
    email: "maria.p@example.com",
    smsConsent: true,
    emailConsent: true,
    whatsappConsent: true,
    viberConsent: false,
  },
  {
    id: "consent-102",
    organizationId: ORG,
    childId: "20000000-0000-4000-8000-000000000102",
    parentId: null,
    recipientName: "Οικονομίδου Ελένη",
    phone: "6922222222",
    email: "eleni.o@example.com",
    smsConsent: true,
    emailConsent: false,
    whatsappConsent: false,
    viberConsent: false,
  },
  {
    id: "consent-103",
    organizationId: ORG,
    childId: "20000000-0000-4000-8000-000000000103",
    parentId: null,
    recipientName: "Τσίτσου Ανδρέας",
    phone: "6933333333",
    email: null,
    smsConsent: false,
    emailConsent: false,
    whatsappConsent: false,
    viberConsent: false,
  },
  {
    id: "consent-104",
    organizationId: ORG,
    childId: "20000000-0000-4000-8000-000000000104",
    parentId: null,
    recipientName: "Φωτίου Κατερίνα",
    phone: "6944444444",
    email: "katerina.f@example.com",
    smsConsent: true,
    emailConsent: true,
    whatsappConsent: true,
    viberConsent: true,
  },
];

export const SECRETARY_DEMO_REMINDERS_INITIAL: ReminderRecord[] = [];

export function recipientMapFromConsents(consents: CommunicationConsent[]): Map<string, { name: string; phone: string | null; email: string | null }> {
  const m = new Map<string, { name: string; phone: string | null; email: string | null }>();
  for (const c of consents) {
    if (!c.childId) continue;
    m.set(c.childId, { name: c.recipientName, phone: c.phone, email: c.email });
  }
  return m;
}
