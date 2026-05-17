"use client";

import { useState } from "react";
import type { SecretaryTask } from "@/lib/secretary/types";
import { TASK_STATUS_LABELS } from "@/lib/secretary/labels";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildTaskCommunicationPayload } from "@/components/secretary/reminders/communication-builders";
import { AlertBadge } from "@/components/secretary/AlertBadge";
import { SecretaryEntityDetailModal } from "@/components/secretary/SecretaryEntityDetailModal";

export function TasksPageClient({ tasks }: { tasks: SecretaryTask[] }) {
  const { consents } = useReminders();
  const [selected, setSelected] = useState<SecretaryTask | null>(null);

  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-ink-muted">
        Δεν υπάρχουν εργασίες.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => setSelected(t)}
              className="flex w-full flex-wrap items-center gap-3 rounded-xl border border-border bg-white p-4 text-left shadow-sm hover:bg-surface-muted/30"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-ink">{t.title}</p>
                  <AlertBadge level={t.alertLevel} />
                </div>
                <p className="text-sm text-ink-muted">
                  {t.taskTypeLabel}
                  {t.childLabel ? ` · ${t.childLabel}` : ""}
                </p>
                <p className="text-xs text-ink-faint">
                  {t.assignedToLabel ?? "—"} · {TASK_STATUS_LABELS[t.status]}
                  {t.dueDate ? ` · έως ${t.dueDate}` : ""}
                </p>
              </div>
              {t.childId ? (
                <CreateReminderButton payload={buildTaskCommunicationPayload(t, consents)} size="sm" />
              ) : null}
            </button>
          </li>
        ))}
      </ul>

      {selected ? <TaskDetailModal task={selected} consents={consents} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function TaskDetailModal({
  task: t,
  consents,
  onClose,
}: {
  task: SecretaryTask;
  consents: Parameters<typeof buildTaskCommunicationPayload>[1];
  onClose: () => void;
}) {
  const payload = t.childId ? buildTaskCommunicationPayload(t, consents) : null;

  return (
    <SecretaryEntityDetailModal
      open
      title="Λεπτομέρειες εργασίας"
      subtitle={t.title}
      onClose={onClose}
      footer={
        payload ? <CreateReminderButton payload={payload} className="w-full" variant="primary" /> : null
      }
    >
      <dl className="space-y-2 text-sm">
        <DetailRow label="Τύπος" value={t.taskTypeLabel} />
        <DetailRow label="Παιδί" value={t.childLabel ?? "—"} />
        <DetailRow label="Υπεύθυνος" value={t.assignedToLabel ?? "—"} />
        <DetailRow label="Προτεραιότητα" value={t.priority} />
        <DetailRow label="Προθεσμία" value={t.dueDate ?? "—"} />
        <DetailRow label="Κατάσταση" value={TASK_STATUS_LABELS[t.status]} />
        {t.notes ? <DetailRow label="Σημειώσεις" value={t.notes} /> : null}
      </dl>
    </SecretaryEntityDetailModal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2">
      <dt className="shrink-0 text-ink-muted">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}
