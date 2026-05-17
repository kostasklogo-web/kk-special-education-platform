"use client";

import { useState } from "react";
import type { SecretaryTask } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import { CONTACT_ROLE_OPTIONS } from "@/lib/secretary/communications/catalog";
import { createCommunicationDraft } from "@/lib/secretary/communications/store";
import { createFollowUpTaskFromCommunication } from "@/lib/secretary/communications/create-followup-task";
import { taskTypeByCode } from "@/lib/secretary/tasks/catalog";
import { taskTypeToCommunicationType } from "@/lib/secretary/communications/task-comm-map";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

type Props = {
  task: SecretaryTask;
  onClose: () => void;
  onSubmit: (outcome: string) => void;
};

export function CompleteCommunicationModal({ task, onClose, onSubmit }: Props) {
  const today = todayAthensYmd();
  const [contactPerson, setContactPerson] = useState(task.parentLabel ?? "");
  const [contactRole, setContactRole] = useState(
    task.taskTypeCode.includes("school")
      ? "school"
      : task.taskTypeCode.includes("doctor")
        ? "doctor"
        : "parent"
  );
  const [summary, setSummary] = useState("");
  const [result, setResult] = useState("");
  const [nextAction, setNextAction] = useState("");

  const handleSubmit = () => {
    if (!contactPerson.trim() || !summary.trim()) return;

    const typeCode = taskTypeToCommunicationType(task.taskTypeCode);

    const log = createCommunicationDraft(
      {
        childId: task.childId,
        childLabel: task.childLabel,
        parentLabel: task.parentLabel,
        locationCode: task.locationCode,
        contactPerson: contactPerson.trim(),
        contactRole,
        communicationTypeCode: typeCode,
        communicationTypeLabel: taskTypeByCode(task.taskTypeCode)?.labelEl ?? task.taskTypeLabel,
        reasonCode: task.taskTypeCode === "no_show_followup" ? "schedule_issue" : "prior_followup",
        reason: task.title,
        summary: summary.trim(),
        outcome: result.trim() || null,
        status: "completed",
        nextActionRequired: !!nextAction.trim(),
        nextAction: nextAction.trim() || null,
        followUpDate: task.followUpDate,
        priority: task.priority,
        linkedTaskId: task.id,
        linkedAppointmentId: task.linkedAppointmentId,
        linkedPaymentId: task.linkedPaymentId,
        linkedDiagnosisId: task.linkedDiagnosisId,
        linkedReportId: task.linkedReportId,
        createdByLabel: "Γραμματεία",
      },
      today
    );

    if (nextAction.trim()) {
      createFollowUpTaskFromCommunication(
        { ...log, nextAction: nextAction.trim(), nextActionRequired: true },
        today
      );
    }

    onSubmit(result.trim() || summary.trim());
  };

  return (
    <SecretaryEntityDetailModal
      open
      title="Καταγραφή επικοινωνίας"
      subtitle={task.title}
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!contactPerson.trim() || !summary.trim()}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-50"
        >
          Ολοκλήρωση & καταγραφή
        </button>
      }
    >
      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-ink-muted">Επαφή</span>
          <input
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ρόλος</span>
          <select
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {CONTACT_ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Περίληψη *</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Αποτέλεσμα</span>
          <input
            value={result}
            onChange={(e) => setResult(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Επόμενη ενέργεια</span>
          <input
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
            placeholder="Προαιρετικό"
          />
        </label>
      </div>
    </SecretaryEntityDetailModal>
  );
}
