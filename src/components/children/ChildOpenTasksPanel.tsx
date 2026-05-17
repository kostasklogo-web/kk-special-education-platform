"use client";

import Link from "next/link";
import { ListTodo, Plus } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useSecretaryTasks } from "@/components/secretary/tasks/TasksChargeProvider";
import { openTasksForChild } from "@/lib/secretary/tasks/task-queries";
import { TaskStatusBadge } from "@/components/secretary/tasks/TaskStatusBadge";
import { TaskPriorityBadge } from "@/components/secretary/tasks/TaskPriorityBadge";
import { formatDateEl } from "@/lib/ui/child-labels";

type Props = {
  childId: string;
  childLabel: string;
};

export function ChildOpenTasksPanel({ childId, childLabel }: Props) {
  const today = todayAthensYmd();
  const tasks = useSecretaryTasks();
  const open = openTasksForChild(tasks, childId, today);

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-clinical-600" />
          <div>
            <h2 className="text-lg font-bold text-ink">Εκκρεμότητες γραμματείας</h2>
            <p className="text-xs text-ink-muted">
              {open.length === 0 ? "Καμία ανοιχτή εργασία" : `${open.length} ανοιχτές εργασίες`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/secretary/tasks?action=create&childId=${encodeURIComponent(childId)}&child=${encodeURIComponent(childLabel)}`}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-surface-muted"
          >
            <Plus className="h-3.5 w-3.5" />
            Νέα εργασία
          </Link>
          <Link
            href={`/secretary/tasks?childId=${encodeURIComponent(childId)}`}
            className="text-xs font-semibold text-clinical-700 hover:underline"
          >
            Όλες →
          </Link>
        </div>
      </div>

      {open.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-ink-muted">
          Δεν υπάρχουν ανοιχτές εργασίες για αυτό το παιδί.
        </p>
      ) : (
        <ul className="space-y-2">
          {open.slice(0, 8).map((t) => (
            <li key={t.id}>
              <Link
                href={`/secretary/tasks?task=${t.id}`}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2 hover:bg-surface-muted/40"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink">{t.title}</p>
                  <p className="text-xs text-ink-muted">
                    {t.taskTypeLabel}
                    {t.dueDate ? ` · έως ${formatDateEl(t.dueDate)}` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <TaskPriorityBadge priority={t.priority} />
                  <TaskStatusBadge status={t.status} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
