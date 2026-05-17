"use client";

import { EntityLinkedTasksPanel } from "@/components/secretary/tasks/EntityLinkedTasksPanel";

type Props = {
  appointmentId: string;
  childId?: string | null;
};

export function AppointmentTaskWarning({ appointmentId }: Props) {
  return (
    <EntityLinkedTasksPanel
      link={{ kind: "appointment", appointmentId }}
      title="Εκκρεμότητες ραντεβού"
    />
  );
}
