"use client";

import Link from "next/link";
import { useReminders } from "./ReminderProvider";

const CARDS = [
  { key: "toSendToday", label: "Σήμερα", href: "/secretary/reminders?quick=due_today" },
  { key: "appointmentPending", label: "Ραντεβού", href: "/secretary/reminders?tab=appointments" },
  { key: "paymentPending", label: "Πληρωμές", href: "/secretary/reminders?tab=payments" },
  { key: "overduePending", label: "Καθυστερημένα", href: "/secretary/reminders?tab=overdue" },
  { key: "diagnosisPending", label: "Διαγνώσεις", href: "/secretary/reminders?tab=diagnosis" },
  { key: "reportPending", label: "Αναφορές", href: "/secretary/reminders?tab=reports" },
  { key: "evaluationPending", label: "Αξιολογήσεις", href: "/secretary/reminders?quick=evaluation" },
  { key: "taskPending", label: "Εργασίες", href: "/secretary/reminders?quick=task" },
  { key: "completedThisWeek", label: "Ολοκλ. εβδ.", href: "/secretary/reminders?quick=completed_week", green: true },
  { key: "failedOrNotSent", label: "Αποτυχία", href: "/secretary/reminders?tab=failed" },
] as const;

export function ReminderDashboardStrip() {
  const { stats } = useReminders();

  return (
    <section className="rounded-xl border border-border bg-gradient-to-br from-clinical-50/80 to-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-ink">Υπενθυμίσεις σήμερα</h2>
        <Link href="/secretary/reminders" className="text-xs font-semibold text-clinical-700 hover:underline">
          Όλες οι υπενθυμίσεις →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((card) => {
          const { key, label, href } = card;
          const value = stats[key as keyof typeof stats] ?? 0;
          const urgent = key === "failedOrNotSent" || key === "overduePending";
          const green = "green" in card && card.green;
          return (
            <Link
              key={key}
              href={href}
              className={`rounded-lg border p-3 text-center transition hover:shadow-md ${
                value > 0 && urgent
                  ? "border-red-300 bg-red-50"
                  : value > 0 && green
                    ? "border-emerald-300 bg-emerald-50"
                    : value > 0
                      ? "border-amber-200 bg-amber-50"
                      : "border-border bg-white"
              }`}
            >
              <p className="text-2xl font-bold tabular-nums text-ink">{value}</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase leading-tight text-ink-muted">{label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
