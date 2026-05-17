"use client";

import { useState } from "react";
import type { AppointmentLocationCode, SecretaryTask, TaskPriority } from "@/lib/secretary/types";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";
import { SECRETARY_TASK_TYPES, TASK_ASSIGNEE_OPTIONS } from "@/lib/secretary/tasks/catalog";
import { TASK_PRIORITY_LABELS } from "@/lib/secretary/tasks/labels";
import { LOCATION_FILTER_OPTIONS } from "@/lib/secretary/schedule-catalog";
import { createTaskDraft } from "@/lib/secretary/tasks/store";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

export type TaskDraftPrefill = Partial<SecretaryTask>;

type Props = {
  prefill?: TaskDraftPrefill;
  onClose: () => void;
  onCreated: (task: SecretaryTask) => void;
};

export function CreateTaskModal({ prefill, onClose, onCreated }: Props) {
  const today = todayAthensYmd();
  const [taskTypeCode, setTaskTypeCode] = useState(prefill?.taskTypeCode ?? "call_parent");
  const [title, setTitle] = useState(prefill?.title ?? "");
  const [childLabel, setChildLabel] = useState(prefill?.childLabel ?? "");
  const [parentLabel, setParentLabel] = useState(prefill?.parentLabel ?? "");
  const [assignedTo, setAssignedTo] = useState(prefill?.assignedToLabel ?? "Γραμματεία");
  const [requestedBy, setRequestedBy] = useState(prefill?.requestedByLabel ?? "Γραμματεία");
  const [priority, setPriority] = useState<TaskPriority>(prefill?.priority ?? "normal");
  const [dueDate, setDueDate] = useState(prefill?.dueDate ?? today);
  const [dueTime, setDueTime] = useState(prefill?.dueTime ?? "");
  const [notes, setNotes] = useState(prefill?.notes ?? "");
  const [locationCode, setLocationCode] = useState<AppointmentLocationCode>(
    prefill?.locationCode ?? "nikaia"
  );

  const typeDef = SECRETARY_TASK_TYPES.find((t) => t.code === taskTypeCode);

  const submit = () => {
    if (!title.trim()) return;
    const task = createTaskDraft(
      {
        ...prefill,
        taskTypeCode,
        taskTypeLabel: typeDef?.labelEl ?? taskTypeCode,
        title: title.trim(),
        childId: prefill?.childId ?? null,
        childLabel: childLabel.trim() || null,
        parentLabel: parentLabel.trim() || null,
        assignedToLabel: assignedTo,
        requestedByLabel: requestedBy,
        priority,
        dueDate,
        dueTime: dueTime || null,
        notes: notes.trim(),
        locationCode,
        linkedPaymentId: prefill?.linkedPaymentId ?? null,
        linkedDiagnosisId: prefill?.linkedDiagnosisId ?? null,
        linkedReportId: prefill?.linkedReportId ?? null,
        linkedAppointmentId: prefill?.linkedAppointmentId ?? null,
      },
      today
    );
    onCreated(task);
    onClose();
  };

  return (
    <SecretaryEntityDetailModal
      open
      title="Νέα εργασία"
      subtitle="Γρήγορη καταχώριση εκκρεμότητας"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim()}
          className="w-full rounded-lg bg-clinical-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-clinical-700 disabled:opacity-50"
        >
          Αποθήκευση
        </button>
      }
    >
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Τύπος εργασίας</span>
          <select
            value={taskTypeCode}
            onChange={(e) => {
              setTaskTypeCode(e.target.value);
              const def = SECRETARY_TASK_TYPES.find((t) => t.code === e.target.value);
              if (!title && def) setTitle(def.labelEl);
            }}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {SECRETARY_TASK_TYPES.map((t) => (
              <option key={t.code} value={t.code}>
                {t.labelEl}
              </option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Τίτλος *</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Παιδί</span>
          <input
            value={childLabel}
            onChange={(e) => setChildLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Γονέας</span>
          <input
            value={parentLabel}
            onChange={(e) => setParentLabel(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Τοποθεσία</span>
          <select
            value={locationCode}
            onChange={(e) => setLocationCode(e.target.value as AppointmentLocationCode)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {LOCATION_FILTER_OPTIONS.filter((o) => o.value !== "omilos").map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Προτεραιότητα</span>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Προθεσμία</span>
          <input
            type="date"
            value={dueDate ?? ""}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Ώρα</span>
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-ink-muted">Υπεύθυνος</span>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          >
            {TASK_ASSIGNEE_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-ink-muted">Ζητήθηκε από</span>
          <input
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
        <label className="sm:col-span-2 block">
          <span className="text-ink-muted">Σημειώσεις</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border px-3 py-2"
          />
        </label>
      </div>
    </SecretaryEntityDetailModal>
  );
}
