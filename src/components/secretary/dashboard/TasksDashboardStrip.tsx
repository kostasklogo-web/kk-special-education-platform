"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import type { SecretaryTask } from "@/lib/secretary/types";
import { tasksForDashboardSection } from "@/lib/secretary/tasks/dashboard-integration";
import { TaskStatusBadge } from "@/components/secretary/tasks/TaskStatusBadge";

type Props = {
  tasks: SecretaryTask[];
};

export function TasksDashboardStrip({ tasks }: Props) {
  const section = tasksForDashboardSection(tasks);
  const highlights = [
    ...section.overdue.slice(0, 2),
    ...section.urgent.filter((t) => !section.overdue.includes(t)).slice(0, 2),
    ...section.today.filter((t) => !section.overdue.includes(t) && !section.urgent.includes(t)).slice(0, 2),
  ].slice(0, 5);

  if (
    section.metrics.overdue === 0 &&
    section.metrics.dueToday === 0 &&
    section.metrics.waitingResponse === 0
  ) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-clinical-600" />
          <div>
            <h2 className="text-lg font-bold text-ink">Εκκρεμότητες</h2>
            <p className="text-xs text-ink-muted">
              {section.metrics.overdue} εκπρόθεσμες · {section.metrics.dueToday} σήμερα ·{" "}
              {section.metrics.waitingResponse} αναμονή
            </p>
          </div>
        </div>
        <Link
          href="/secretary/tasks"
          className="text-sm font-semibold text-clinical-700 hover:underline"
        >
          Όλες οι εργασίες →
        </Link>
      </div>
      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        {section.metrics.paymentRelated > 0 ? (
          <Link
            href="/secretary/tasks?filter=payment"
            className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-900"
          >
            Πληρωμές ({section.metrics.paymentRelated})
          </Link>
        ) : null}
        {section.metrics.diagnosisRelated > 0 ? (
          <Link
            href="/secretary/tasks?filter=diagnosis"
            className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-950"
          >
            Διαγνώσεις ({section.metrics.diagnosisRelated})
          </Link>
        ) : null}
        {section.metrics.reportRelated > 0 ? (
          <Link
            href="/secretary/tasks?filter=report"
            className="rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-900"
          >
            Αναφορές ({section.metrics.reportRelated})
          </Link>
        ) : null}
      </div>
      <ul className="space-y-2">
        {highlights.map((t) => (
          <li key={t.id}>
            <Link
              href={`/secretary/tasks?task=${t.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2 hover:bg-surface-muted/40"
            >
              <span className="font-medium text-ink">{t.title}</span>
              <TaskStatusBadge status={t.status} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
