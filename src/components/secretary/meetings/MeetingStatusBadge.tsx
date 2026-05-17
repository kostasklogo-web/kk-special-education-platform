"use client";

import type { MeetingStatus } from "@/lib/secretary/types";
import { MEETING_STATUS_BADGE, MEETING_STATUS_LABELS } from "@/lib/secretary/meetings/labels";

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-semibold ${MEETING_STATUS_BADGE[status]}`}
    >
      {MEETING_STATUS_LABELS[status]}
    </span>
  );
}
