"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllMeetings, MEETINGS_UPDATED_EVENT } from "@/lib/secretary/meetings/store";
import { meetingsForStaff } from "@/lib/secretary/meetings/meeting-queries";
import { MeetingStatusBadge } from "@/components/secretary/meetings/MeetingStatusBadge";
import { CreateMeetingButton } from "@/components/secretary/meetings/CreateMeetingButton";
import { prefillMeetingFromStaff } from "@/lib/secretary/meetings/meeting-prefill";

type Props = { staffLabel: string; department?: string | null };

export function StaffMeetingsSection({ staffLabel, department }: Props) {
  const today = todayAthensYmd();
  const [all, setAll] = useState(() => getAllMeetings(today));

  useEffect(() => {
    const refresh = () => setAll(getAllMeetings(today));
    refresh();
    window.addEventListener(MEETINGS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(MEETINGS_UPDATED_EVENT, refresh);
  }, [today]);

  const staffMeetings = useMemo(() => meetingsForStaff(all, staffLabel), [all, staffLabel]);
  const upcoming = staffMeetings.filter((m) => !["completed", "cancelled"].includes(m.status));
  const recent = staffMeetings.slice(0, 5);

  return (
    <section className="mx-auto max-w-3xl rounded-xl border border-border bg-surface-card p-6 shadow-shell">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-violet-800" />
          <h2 className="text-base font-semibold text-ink">Συναντήσεις & εποπτεία</h2>
        </div>
        <Link
          href={`/secretary/meetings?staff=${encodeURIComponent(staffLabel)}`}
          className="text-xs font-semibold text-clinical-700 hover:underline"
        >
          Όλες →
        </Link>
      </div>
      <p className="mt-1 text-xs text-ink-muted">
        Εποπτείες, HR, performance review · Σύνολο: <strong>{staffMeetings.length}</strong> · Ενεργές:{" "}
        <strong>{upcoming.length}</strong>
      </p>
      {staffMeetings.length === 0 ? (
        <p className="mt-4 text-sm text-ink-muted">Δεν υπάρχουν καταχωρημένες συναντήσεις για αυτό το μέλος.</p>
      ) : (
        <ul className="mt-4 space-y-2">
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
      )}
      <div className="mt-4">
        <CreateMeetingButton
          size="sm"
          label="Νέα συνάντηση"
          prefill={prefillMeetingFromStaff(staffLabel, department)}
        />
      </div>
    </section>
  );
}
