"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllMeetings, MEETINGS_UPDATED_EVENT } from "@/lib/secretary/meetings/store";
import { meetingsForChild } from "@/lib/secretary/meetings/meeting-queries";
import { MeetingStatusBadge } from "@/components/secretary/meetings/MeetingStatusBadge";
import { CreateMeetingButton } from "@/components/secretary/meetings/CreateMeetingButton";
import { prefillMeetingFromChild } from "@/lib/secretary/meetings/meeting-prefill";

type Props = { childId: string; childLabel: string };

export function ChildMeetingsSection({ childId, childLabel }: Props) {
  const today = todayAthensYmd();
  const [all, setAll] = useState(() => getAllMeetings(today));

  useEffect(() => {
    const refresh = () => setAll(getAllMeetings(today));
    refresh();
    window.addEventListener(MEETINGS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MEETINGS_UPDATED_EVENT, refresh);
  }, [today]);

  const childMeetings = useMemo(() => meetingsForChild(all, childId), [all, childId]);
  const upcoming = childMeetings.filter((m) => !["completed", "cancelled"].includes(m.status));
  const recent = childMeetings.slice(0, 5);

  if (childMeetings.length === 0) return null;

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-800" />
          <h2 className="text-base font-bold text-ink">Συναντήσεις & εποπτεία</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CreateMeetingButton
            size="sm"
            label="Νέα"
            prefill={prefillMeetingFromChild(childId, childLabel)}
          />
          <Link
            href={`/secretary/meetings?child=${encodeURIComponent(childLabel)}`}
            className="text-xs font-semibold text-clinical-700 hover:underline"
          >
            Όλες →
          </Link>
        </div>
      </div>
      <p className="mb-2 text-xs text-ink-muted">
        Σύνολο: <strong>{childMeetings.length}</strong> · Ενεργές: <strong>{upcoming.length}</strong>
      </p>
      <ul className="space-y-2">
        {recent.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm">
            <div>
              <p className="font-medium">{m.title}</p>
              <p className="text-xs text-ink-muted">
                {m.meetingDate} {m.startTime} · {m.meetingTypeLabel}
              </p>
            </div>
            <MeetingStatusBadge status={m.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
