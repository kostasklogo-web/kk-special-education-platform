"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import type { ReminderRecord } from "@/lib/secretary/reminders/types";
import { enrichReminders, isActiveReminderStatus } from "@/lib/secretary/reminders/calculations";
import { REMINDERS_UPDATED_EVENT } from "@/lib/secretary/reminders/store";
import { ReminderStatusBadge } from "@/components/secretary/reminders/ReminderStatusBadge";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { buildChildCommunicationPayload } from "@/components/secretary/reminders/communication-builders";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import type { ChildListItem, ParentLinkRow } from "@/lib/data/children/types";

const STORAGE_KEY = "secretary-reminders-v1";

function loadReminders(): ReminderRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as { reminders: ReminderRecord[] }).reminders ?? [];
  } catch {
    return [];
  }
}

type Props = {
  childId: string;
  childLabel: string;
  child: Pick<ChildListItem, "id" | "first_name" | "last_name">;
  parentLinks: ParentLinkRow[];
};

export function ChildRemindersSection({ childId, childLabel, child, parentLinks }: Props) {
  const today = todayAthensYmd();
  const { consents } = useReminders();
  const [records, setRecords] = useState<ReminderRecord[]>([]);
  const createPayload = buildChildCommunicationPayload(child, parentLinks, consents);

  useEffect(() => {
    const refresh = () => setRecords(loadReminders());
    refresh();
    window.addEventListener(REMINDERS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(REMINDERS_UPDATED_EVENT, refresh);
  }, []);

  const childRecords = useMemo(() => {
    return enrichReminders(records.filter((r) => r.childId === childId), today);
  }, [records, childId, today]);

  const upcoming = childRecords.filter((r) => isActiveReminderStatus(r.status));
  const overdue = childRecords.filter((r) => r.isOverdue);
  const failed = childRecords.filter((r) => r.status === "failed");
  const recent = childRecords.slice(0, 5);

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-clinical-700" />
          <h2 className="text-base font-bold text-ink">Υπενθυμίσεις</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CreateReminderButton payload={createPayload} size="sm" variant="ghost" />
          <Link
            href={`/secretary/reminders?child=${encodeURIComponent(childLabel)}`}
            className="text-xs font-semibold text-clinical-700 hover:underline"
          >
            Κέντρο →
          </Link>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-ink-muted">
        <span>
          Ενεργές: <strong className="text-ink">{upcoming.length}</strong>
        </span>
        <span>
          Εκπρόθεσμες: <strong className="text-red-700">{overdue.length}</strong>
        </span>
        <span>
          Αποτυχίες: <strong className="text-red-900">{failed.length}</strong>
        </span>
      </div>

      {recent.length === 0 ? (
        <p className="text-sm text-ink-muted">Δεν υπάρχει ιστορικό υπενθυμίσεων — δημιουργήστε νέα υπενθύμιση.</p>
      ) : (
      <ul className="space-y-2">
        {recent.map((r) => (
          <li
            key={r.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-ink">{r.templateLabel}</p>
              <p className="text-xs text-ink-muted">
                {r.scheduledDate ?? r.createdAt.slice(0, 10)} · {r.recipientName}
              </p>
            </div>
            <ReminderStatusBadge status={r.status} overdue={r.isOverdue} />
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
