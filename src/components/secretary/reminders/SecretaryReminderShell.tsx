"use client";

import type { ReactNode } from "react";
import type { DiagnosisDocument, ReportRequest, SecretaryAppointment } from "@/lib/secretary/types";
import type { CommunicationConsent } from "@/lib/secretary/reminders/types";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import { useSecretaryTasks } from "@/components/secretary/tasks/TasksChargeProvider";
import { ReminderProvider } from "./ReminderProvider";
import { ReminderSendModal } from "./ReminderSendModal";

type Props = {
  organizationId: string;
  appointments: SecretaryAppointment[];
  diagnoses: DiagnosisDocument[];
  reports: ReportRequest[];
  consents: CommunicationConsent[];
  children: ReactNode;
};

export function SecretaryReminderShell({
  organizationId,
  appointments,
  diagnoses,
  reports,
  consents,
  children,
}: Props) {
  const payments = usePaymentCharges();
  const tasks = useSecretaryTasks();

  return (
    <ReminderProvider
      organizationId={organizationId}
      appointments={appointments}
      payments={payments}
      diagnoses={diagnoses}
      reports={reports}
      tasks={tasks}
      consents={consents}
    >
      {children}
      <ReminderSendModal />
    </ReminderProvider>
  );
}
