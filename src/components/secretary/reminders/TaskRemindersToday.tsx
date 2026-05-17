"use client";

import Link from "next/link";
import { ListTodo } from "lucide-react";
import { useReminders } from "./ReminderProvider";
import { CreateReminderButton } from "./CreateReminderButton";

export function TaskRemindersToday() {
  const { queue } = useReminders();
  const items = queue.filter((q) => q.entityType === "task").slice(0, 6);

  if (items.length === 0) return null;

  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-slate-700" />
          <h2 className="text-sm font-bold text-ink">Υπενθυμίσεις σήμερα — εργασίες</h2>
        </div>
        <Link href="/secretary/reminders?quick=task" className="text-xs font-semibold text-clinical-700 hover:underline">
          Όλες →
        </Link>
      </div>

      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{item.childLabel ?? "—"}</p>
              <p className="text-xs text-ink-muted">{item.reason}</p>
            </div>
            <CreateReminderButton
              size="sm"
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
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
