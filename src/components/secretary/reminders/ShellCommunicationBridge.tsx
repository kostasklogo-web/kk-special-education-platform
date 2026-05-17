"use client";

import type { ReactNode } from "react";
import type { SecretaryCommunicationBundle } from "./ShellCommunicationBridge.types";
import { PaymentsChargeProvider } from "@/components/secretary/payments/PaymentsChargeProvider";
import { DiagnosesChargeProvider } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";
import { ReportsChargeProvider } from "@/components/secretary/reports/ReportsChargeProvider";
import { MeetingsChargeProvider } from "@/components/secretary/meetings/MeetingsChargeProvider";
import { TasksChargeProvider } from "@/components/secretary/tasks/TasksChargeProvider";
import { CommunicationsLogProvider } from "@/components/secretary/communications/CommunicationsLogProvider";
import { SecretaryReminderShell } from "./SecretaryReminderShell";
import { useDiagnosisDocuments } from "@/components/secretary/diagnoses/DiagnosesChargeProvider";

export type { SecretaryCommunicationBundle };

type Props = {
  enabled: boolean;
  bundle: SecretaryCommunicationBundle | null;
  children: ReactNode;
};

function ReminderShellWithPayments({
  bundle,
  children,
}: {
  bundle: SecretaryCommunicationBundle;
  children: ReactNode;
}) {
  const diagnoses = useDiagnosisDocuments();
  return (
    <SecretaryReminderShell
      organizationId={bundle.organizationId}
      appointments={bundle.appointments}
      diagnoses={diagnoses}
      reports={bundle.reports}
      consents={bundle.consents}
    >
      {children}
    </SecretaryReminderShell>
  );
}

export function ShellCommunicationBridge({ enabled, bundle, children }: Props) {
  if (!enabled || !bundle) return <>{children}</>;

  return (
    <PaymentsChargeProvider>
      <DiagnosesChargeProvider>
        <ReportsChargeProvider>
          <MeetingsChargeProvider>
          <TasksChargeProvider>
          <CommunicationsLogProvider>
            <ReminderShellWithPayments bundle={bundle}>{children}</ReminderShellWithPayments>
          </CommunicationsLogProvider>
          </TasksChargeProvider>
          </MeetingsChargeProvider>
        </ReportsChargeProvider>
      </DiagnosesChargeProvider>
    </PaymentsChargeProvider>
  );
}
