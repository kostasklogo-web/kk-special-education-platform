"use client";

import Link from "next/link";
import { Stethoscope } from "lucide-react";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { buildDiagnosisReminderPayload } from "@/components/secretary/reminders/communication-builders";
import { useDiagnosisDocuments } from "./DiagnosesChargeProvider";
import { diagnosisDocumentsDueReminderToday } from "@/lib/secretary/diagnoses/diagnosis-queries";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { DIAGNOSIS_STATUS_LABELS } from "@/lib/secretary/diagnoses/labels";

export function DiagnosisRemindersToday() {
  const today = todayAthensYmd();
  const { consents, openReminder, queue } = useReminders();
  const docs = useDiagnosisDocuments();

  const diagnosisQueue = queue.filter((q) => q.entityType === "diagnosis");
  const dueFromDocs = diagnosisDocumentsDueReminderToday(docs, today);

  const items = [
    ...diagnosisQueue.map((q) => ({
      id: q.id,
      childLabel: q.childLabel ?? "—",
      reason: q.reason,
      entityId: q.entityId,
      fromQueue: true as const,
    })),
    ...dueFromDocs
      .filter((d) => !diagnosisQueue.some((q) => q.entityId === d.id))
      .map((d) => ({
        id: `diag-due-${d.id}`,
        childLabel: d.childLabel,
        reason:
          d.renewalFollowUpDate === today
            ? "Follow-up ανανέωσης σήμερα"
            : DIAGNOSIS_STATUS_LABELS[d.status],
        entityId: d.id,
        fromQueue: false as const,
      })),
  ].slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="rounded-xl border border-violet-100 bg-violet-50/30 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-violet-800" />
          <h2 className="text-sm font-bold text-ink">Υπενθυμίσεις σήμερα — γνωματεύσεις</h2>
        </div>
        <Link
          href="/secretary/reminders?tab=diagnosis"
          className="text-xs font-semibold text-clinical-700 hover:underline"
        >
          Όλες →
        </Link>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const doc = docs.find((d) => d.id === item.entityId);
          const urgent = doc?.status === "expired" || doc?.status === "expiring_7";
          return (
            <li
              key={item.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 ${
                urgent ? "border-red-300 bg-red-50" : "border-violet-200 bg-white"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.childLabel}</p>
                <p className="text-xs text-ink-muted">{item.reason}</p>
                {doc ? (
                  <p className="text-[11px] text-ink-faint">
                    {doc.documentType} · λήξη {doc.expiryDate}
                  </p>
                ) : null}
              </div>
              {doc ? (
                <CreateReminderButton
                  size="sm"
                  variant="ghost"
                  payload={buildDiagnosisReminderPayload(doc, consents)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
