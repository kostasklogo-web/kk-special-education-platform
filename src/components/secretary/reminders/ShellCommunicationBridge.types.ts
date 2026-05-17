import type { DiagnosisDocument, PaymentObligation, ReportRequest, SecretaryAppointment } from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";

export type SecretaryCommunicationBundle = {
  organizationId: string;
  appointments: SecretaryAppointment[];
  payments: PaymentObligation[];
  diagnoses: DiagnosisDocument[];
  reports: ReportRequest[];
  consents: CommunicationConsent[];
};
