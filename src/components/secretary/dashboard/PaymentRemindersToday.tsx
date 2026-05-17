"use client";

import Link from "next/link";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import {
  buildPaymentReminderPayload,
  paymentTemplateForStatus,
} from "@/components/secretary/reminders/communication-builders";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { usePaymentCharges } from "@/components/secretary/payments/PaymentsChargeProvider";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { paymentWarningSummary } from "@/lib/secretary/payments/payment-warnings";

export function PaymentRemindersToday() {
  const today = todayAthensYmd();
  const { consents, queue } = useReminders();
  const charges = usePaymentCharges();

  const paymentQueue = queue.filter((q) => q.entityType === "payment");
  const dueToday = paymentQueue.slice(0, 6);

  if (dueToday.length === 0 && charges.filter((c) => c.balance > 0).length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">Υπενθυμίσεις σήμερα — πληρωμές</h2>
        <Link href="/secretary/reminders?tab=payments" className="text-xs font-semibold text-clinical-700 hover:underline">
          Όλες →
        </Link>
      </div>
      {dueToday.length === 0 ? (
        <p className="text-sm text-ink-muted">Δεν υπάρχουν αυτόματες υπενθυμίσεις πληρωμής για σήμερα.</p>
      ) : (
        <ul className="space-y-2">
          {dueToday.map((item) => {
            const charge = charges.find((c) => c.id === item.entityId);
            const summary = charge ? paymentWarningSummary(charge, today) : null;
            return (
              <li
                key={item.id}
                className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 ${
                  summary?.managementReview
                    ? "border-red-900/40 bg-red-950/5"
                    : "border-amber-200 bg-amber-50/50"
                }`}
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{item.childLabel ?? "—"}</p>
                  <p className="text-xs text-ink-muted">{item.reason}</p>
                  {summary?.managementReview ? (
                    <p className="mt-0.5 text-xs font-bold text-red-900">{summary.title}</p>
                  ) : null}
                </div>
                {charge ? (
                  <CreateReminderButton
                    size="sm"
                    variant="ghost"
                    payload={buildPaymentReminderPayload(
                      charge,
                      consents,
                      paymentTemplateForStatus(charge, today)
                    )}
                  />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
