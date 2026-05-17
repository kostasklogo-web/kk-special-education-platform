"use client";

import { memo, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import {
  computeFreeGapsWithinWindow,
  formatAthensHmFromUtcMs,
  roomBusyIntervals,
  type WindowMs,
} from "@/lib/schedule/control-center-prototype-utils";
import type { CONTROL_CENTER_DEMO_ROOMS } from "@/lib/demo/schedule-control-center-data";

type RoomRow = (typeof CONTROL_CENTER_DEMO_ROOMS)[number];

const RoomCard = memo(function RoomCard({
  room,
  blocks,
  dateYmd,
  win,
  hasRoomConflict,
  embedded,
}: {
  room: RoomRow;
  blocks: ControlBoardBlock[];
  dateYmd: string;
  win: WindowMs;
  hasRoomConflict: boolean;
  embedded: boolean;
}) {
  const busy = useMemo(() => roomBusyIntervals(room.id, blocks, dateYmd), [room.id, blocks, dateYmd]);
  const gaps45 = useMemo(() => computeFreeGapsWithinWindow(win, busy, 45), [win, busy]);
  const next45 = gaps45[0];
  const next45El = next45
    ? `${formatAthensHmFromUtcMs(next45.startMs)}–${formatAthensHmFromUtcMs(next45.startMs + 45 * 60_000)}`
    : "—";

  const statusLabel = hasRoomConflict ? "Σύγκρουση" : next45 ? "Διαθέσιμη" : "Πλήρης";
  const statusClass = hasRoomConflict
    ? "bg-red-600 text-white"
    : next45
      ? "bg-emerald-700 text-white"
      : "bg-slate-500 text-white";

  if (embedded) {
    return (
      <article
        className={`rounded border px-1.5 py-1 ${
          hasRoomConflict ? "border-red-400 bg-red-50/80" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-1">
          <div>
            <p className="text-xs font-extrabold tabular-nums text-ink">{room.short_label}</p>
            <p className="truncate text-[9px] text-ink-muted">{room.name}</p>
          </div>
          <span className={`shrink-0 rounded px-1 py-px text-[8px] font-bold ${statusClass}`}>{statusLabel}</span>
        </div>
        <p className="mt-0.5 text-[9px] text-ink-muted">
          Επόμενο 45′: <span className="font-bold tabular-nums text-emerald-900">{next45El}</span>
        </p>
      </article>
    );
  }

  return (
    <article
      className={`rounded-lg border p-2 shadow-sm ${
        hasRoomConflict ? "border-red-400 bg-red-50/70" : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-base font-extrabold tabular-nums text-ink">{room.short_label}</p>
          <p className="text-[11px] text-ink-muted">{room.name}</p>
        </div>
        {hasRoomConflict ? (
          <span className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white">
            <AlertTriangle className="h-3 w-3 shrink-0" aria-hidden /> Διπλή κράτηση
          </span>
        ) : (
          <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusClass}`}>{statusLabel}</span>
        )}
      </div>
      <p className="mt-1.5 text-xs font-bold tabular-nums text-emerald-950">Επόμενο 45′: {next45El}</p>
    </article>
  );
});

type RoomAvailabilityPanelProps = {
  rooms: readonly RoomRow[];
  blocks: ControlBoardBlock[];
  dateYmd: string;
  win: WindowMs;
  conflictRoomIds: Set<string>;
  embedded?: boolean;
};

export const RoomAvailabilityPanel = memo(function RoomAvailabilityPanel({
  rooms,
  blocks,
  dateYmd,
  win,
  conflictRoomIds,
  embedded = false,
}: RoomAvailabilityPanelProps) {
  return (
    <section className={embedded ? "" : "rounded-lg border border-border bg-surface-card p-3 shadow-sm"}>
      {embedded ? (
        <p className="mb-1 text-[9px] text-ink-muted">
          {conflictRoomIds.size > 0
            ? `${conflictRoomIds.size} αίθουσα/ες με σύγκρουση`
            : "Όλες οι αίθουσες χωρίς διπλή κράτηση"}
        </p>
      ) : (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-ink">Αίθουσες</h2>
          <span className="text-[10px] text-amber-800/90">
            Σύγκρουση: {conflictRoomIds.size ? `${conflictRoomIds.size}` : "κανένα"}
          </span>
        </div>
      )}
      <div className={embedded ? "flex flex-col gap-1" : "grid gap-2 md:grid-cols-2 xl:grid-cols-3"}>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            blocks={blocks}
            dateYmd={dateYmd}
            win={win}
            hasRoomConflict={conflictRoomIds.has(room.id)}
            embedded={embedded}
          />
        ))}
      </div>
    </section>
  );
});
