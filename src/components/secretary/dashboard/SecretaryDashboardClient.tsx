"use client";

import type {
  ClientIntake,
  CommunicationLog,
  DiagnosisDocument,
  PaymentObligation,
  ReportRequest,
  SecretaryAppointment,
  SecretaryTask,
} from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import type { SecretaryDashboardData } from "@/lib/secretary/types";
import { MasterSecretaryDashboard } from "./MasterSecretaryDashboard";

type Props = {
  data: SecretaryDashboardData;
  appointments: SecretaryAppointment[];
  payments: PaymentObligation[];
  diagnoses: DiagnosisDocument[];
  tasks: SecretaryTask[];
  communications: CommunicationLog[];
  reports: ReportRequest[];
  intakes: ClientIntake[];
  consents: CommunicationConsent[];
};

/** Master secretary control center — aggregates all operational modules. */
export function SecretaryDashboardClient({
  appointments,
  payments,
  diagnoses,
  tasks,
  communications,
  reports,
  intakes,
  consents,
}: Props) {
  return (
    <MasterSecretaryDashboard
      appointments={appointments}
      payments={payments}
      diagnoses={diagnoses}
      tasks={tasks}
      communications={communications}
      reports={reports}
      intakes={intakes}
      consents={consents}
    />
  );
}
