"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useReminders } from "./ReminderProvider";
import { ReminderQuickButton } from "./ReminderQuickButton";
import { ReminderStatusBadge } from "./ReminderStatusBadge";
import { withDefaultCenterFields } from "@/lib/secretary/reminders/normalize-context";
import { REMINDER_STATUS_LABELS } from "@/lib/secretary/reminders/config";

export function SecretaryRemindersPageClient() {
  const { queue, reminders, openReminder } = useReminders();
  const tab = useSearchParams().get("tab") ?? "all";

  const filteredQueue = useMemo(() => {
    switch (tab) {
      case "appointments":
        return queue.filter((q) => q.entityType === "appointment");
      case "payments":
        return queue.filter((q) => q.entityType === "payment" && q.templateCode === "payment_due_soon");
      case "overdue":
        return queue.filter((q) => q.templateCode.includes("overdue"));
      case "diagnosis":
        return queue.filter((q) => q.entityType === "diagnosis");
      case "reports":
        return queue.filter((q) => q.entityType === "report");
      default:
        return queue;
    }
  }, [queue, tab]);

  const failed = reminders.filter((r) => r.status === "failed" || r.status === "pending");

  return (
    <div className="space-y-6">
      <section>
        <h2 className="mb-2 text-sm font-bold text-ink">Ουρά αυτοματισμών (σήμερα)</h2>
        <p className="mb-3 text-xs text-ink-muted">
          24 ώρες πριν το ραντεβού · υπενθύμιση σήμερα · πληρωμές 7 ημέρες πριν · καθυστέρηση μετά τη λήξη ·
          διάγνωση 60/30/7 ημέρες πριν
        </p>
        {filteredQueue.length === 0 ? (
          <p className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-ink-muted">
            Δεν υπάρχουν υπενθυμίσεις σε αυτή την κατηγορία.
          </p>
        ) : (
          <ul className="space-y-2">
            {filteredQueue.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white p-3 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{item.childLabel ?? "—"}</p>
                  <p className="text-xs text-ink-muted">
                    {item.templateLabel} · {item.reason}
                  </p>
                  <p className="text-[11px] text-ink-faint">{item.recipientName}</p>
                </div>
                <ReminderQuickButton
                  payload={{
                    templateCode: item.templateCode,
                    entityType: item.entityType,
                    entityId: item.entityId,
                    childId: item.childId,
                    childLabel: item.childLabel,
                    recipientName: item.recipientName,
                    recipientPhone: null,
                    recipientEmail: null,
                    context: item.context,
                    suggestedChannel: item.suggestedChannel,
                  }}
                  label="Αποστολή"
                  variant="primary"
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      {tab === "failed" || tab === "all" ? (
        <section>
          <h2 className="mb-2 text-sm font-bold text-ink">Εκκρεμεί / αποτυχία</h2>
          <ul className="space-y-2">
            {failed.length === 0 ? (
              <li className="text-sm text-ink-muted">Καμία εκκρεμής εγγραφή.</li>
            ) : (
              failed.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{r.childLabel}</p>
                    <p className="text-xs text-ink-muted">{r.templateLabel}</p>
                  </div>
                  <ReminderStatusBadge status={r.status} />
                  <button
                    type="button"
                    className="text-xs font-semibold text-clinical-700"
                    onClick={() =>
                      openReminder({
                        templateCode: r.templateCode,
                        entityType: r.entityType,
                        entityId: r.entityId,
                        childId: r.childId,
                        childLabel: r.childLabel,
                        recipientName: r.recipientName,
                        recipientPhone: r.recipientPhone,
                        recipientEmail: r.recipientEmail,
                        context: withDefaultCenterFields({
                          parent_name: r.recipientName,
                          child_name: r.childLabel ?? "—",
                        }),
                      })
                    }
                  >
                    Άνοιγμα
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-sm font-bold text-ink">Ιστορικό (τελευταίες εγγραφές)</h2>
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-[11px] uppercase text-ink-muted">
              <tr>
                <th className="px-3 py-2">Παιδί</th>
                <th className="px-3 py-2">Πρότυπο</th>
                <th className="px-3 py-2">Κατάσταση</th>
                <th className="px-3 py-2">Ημερομηνία</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reminders.slice(0, 20).map((r) => (
                <tr key={r.id}>
                  <td className="px-3 py-2">{r.childLabel ?? "—"}</td>
                  <td className="px-3 py-2">{r.templateLabel}</td>
                  <td className="px-3 py-2">
                    <ReminderStatusBadge status={r.status} />
                  </td>
                  <td className="px-3 py-2 text-xs text-ink-muted">
                    {new Date(r.sentAt ?? r.copiedAt ?? r.createdAt).toLocaleString("el-GR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-ink-faint">
          Καταστάσεις: {Object.values(REMINDER_STATUS_LABELS).join(" · ")}
        </p>
      </section>
    </div>
  );
}
