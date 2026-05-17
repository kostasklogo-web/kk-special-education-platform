"use client";

import { AlertBadge } from "@/components/secretary/AlertBadge";
import type { ReminderDashboardMetrics } from "@/lib/secretary/reminders/calculations";

export type ReminderQuickFilter =
  | "due_today"
  | "appointment"
  | "payment"
  | "payment_overdue"
  | "diagnosis"
  | "report"
  | "evaluation"
  | "task"
  | "failed"
  | "completed_week"
  | null;

type Props = {
  metrics: ReminderDashboardMetrics;
  activeFilter: ReminderQuickFilter;
  onFilter: (f: ReminderQuickFilter) => void;
};

export function ReminderDashboardKpis({ metrics, activeFilter, onFilter }: Props) {
  const cards: {
    key: ReminderQuickFilter;
    label: string;
    value: number;
    helper: string;
    level: "green" | "yellow" | "red";
  }[] = [
    { key: "due_today", label: "Σήμερα", value: metrics.dueToday, helper: "Προς αποστολή", level: "yellow" },
    { key: "appointment", label: "Ραντεβού", value: metrics.appointment, helper: "Υπενθυμίσεις", level: "yellow" },
    { key: "payment", label: "Πληρωμές", value: metrics.payment, helper: "Προσεχείς", level: "yellow" },
    { key: "payment_overdue", label: "Καθυστερημένες οφειλές", value: metrics.paymentOverdue, helper: "Επείγον", level: "red" },
    { key: "diagnosis", label: "Γνωματεύσεις", value: metrics.diagnosis, helper: "Ανανέωση", level: "yellow" },
    { key: "report", label: "Αναφορές", value: metrics.report, helper: "Προθεσμίες", level: "yellow" },
    { key: "evaluation", label: "Αξιολογήσεις", value: metrics.evaluation, helper: "Follow-up", level: "yellow" },
    { key: "task", label: "Εργασίες", value: metrics.taskFollowup, helper: "Follow-up", level: "yellow" },
    { key: "failed", label: "Αποτυχίες", value: metrics.failed, helper: "Επανάληψη", level: "red" },
    {
      key: "completed_week",
      label: "Ολοκληρώθηκαν (εβδ.)",
      value: metrics.completedThisWeek,
      helper: "Απεστάλησαν",
      level: "green",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => onFilter(activeFilter === c.key ? null : c.key)}
          className={`rounded-lg border p-3 text-left shadow-sm transition ${
            activeFilter === c.key
              ? "border-clinical-600 ring-2 ring-clinical-500/30"
              : "border-border bg-surface-card hover:bg-surface-muted/40"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{c.label}</p>
            <AlertBadge level={c.level} />
          </div>
          <p className="mt-1 text-xl font-bold tabular-nums text-ink">{c.value}</p>
          <p className="text-xs text-ink-faint">{c.helper}</p>
        </button>
      ))}
    </div>
  );
}
