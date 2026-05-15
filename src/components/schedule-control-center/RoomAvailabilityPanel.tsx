"use client";

import { memo, useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import {
  computeFreeGapsWithinWindow,
  formatAthensHmFromUtcMs,
  formatFreeWindowsEl,
  mergeBusyIntervals,
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
}: {
  room: RoomRow;
  blocks: ControlBoardBlock[];
  dateYmd: string;
  win: WindowMs;
  hasRoomConflict: boolean;
}) {
  const busy = useMemo(() => roomBusyIntervals(room.id, blocks, dateYmd), [room.id, blocks, dateYmd]);
  const mergedOccupied = useMemo(() => mergeBusyIntervals(busy), [busy]);
  const occupiedText = useMemo(() => formatFreeWindowsEl(mergedOccupied, 6), [mergedOccupied]);
  const freeWindows = useMemo(() => computeFreeGapsWithinWindow(win, busy, 15), [win, busy]);
  const freeText = useMemo(() => formatFreeWindowsEl(freeWindows, 6), [freeWindows]);
  const gaps45 = useMemo(() => computeFreeGapsWithinWindow(win, busy, 45), [win, busy]);
  const gaps90 = useMemo(() => computeFreeGapsWithinWindow(win, busy, 90), [win, busy]);
  const next45 = gaps45[0];
  const next90 = gaps90[0];
  const next45El = next45
    ? `${formatAthensHmFromUtcMs(next45.startMs)} – ${formatAthensHmFromUtcMs(next45.startMs + 45 * 60_000)}`
    : "—";
  const next90El = next90
    ? `${formatAthensHmFromUtcMs(next90.startMs)} – ${formatAthensHmFromUtcMs(next90.startMs + 90 * 60_000)}`
    : "—";

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
        ) : null}
      </div>
      <dl className="mt-1.5 space-y-1.5 text-xs">
        <div>
          <dt className="font-bold uppercase tracking-wide text-rose-900">Κατειλημμένα</dt>
          <dd className="mt-0.5 font-mono text-[11px] leading-relaxed text-ink">{occupiedText}</dd>
        </div>
        <div>
          <dt className="font-bold uppercase tracking-wide text-emerald-900">Ελεύθερα (≥15′)</dt>
          <dd className="mt-0.5 font-mono text-[11px] leading-relaxed text-emerald-950">{freeText}</dd>
        </div>
        <div className="grid gap-2 border-t border-border pt-2 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-2">
            <dt className="text-[10px] font-bold uppercase text-slate-700">Επόμενο 45′</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums text-ink">{next45El}</dd>
          </div>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/80 p-2">
            <dt className="text-[10px] font-bold uppercase text-indigo-900">Επόμενο 90′</dt>
            <dd className="mt-0.5 text-sm font-bold tabular-nums text-indigo-950">{next90El}</dd>
          </div>
        </div>
      </dl>
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
        <p className="mb-1 text-[10px] text-ink-muted">
          Σύγκρουση: {conflictRoomIds.size ? `${conflictRoomIds.size} αίθ.` : "κανένα"}
        </p>
      ) : (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-ink">Αίθουσες — κατάσταση ανά αριθμό</h2>
            <p className="mt-0.5 text-[11px] text-ink-muted">Συμπαγής προβολή (στατικά δεδομένα).</p>
          </div>
          <span className="text-[10px] text-amber-800/90">
            Σύγκρουση χώρου: {conflictRoomIds.size ? `${conflictRoomIds.size} αίθουσες` : "κανένα"}
          </span>
        </div>
      )}
      <div className={embedded ? "flex flex-col gap-1.5" : "grid gap-2 md:grid-cols-2 xl:grid-cols-3"}>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            blocks={blocks}
            dateYmd={dateYmd}
            win={win}
            hasRoomConflict={conflictRoomIds.has(room.id)}
          />
        ))}
      </div>
    </section>
  );
});
