"use client";

import { memo, useMemo } from "react";
import { blockIntervalInWindowMs } from "@/lib/schedule/control-center-model";
import { assignLanes, blockDurationMinutes } from "@/lib/schedule/control-center-prototype-utils";
import {
  CONTROL_CENTER_DEMO_DISCIPLINES,
  CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE,
} from "@/lib/demo/schedule-control-center-data";
import { CC_RULER_HEADER_PX, CC_Z_GRID } from "./constants";
import { MAIN_45_GRID_BG, SIDE_50_GRID_BG, structuredBreakShadeStyle } from "./board-grid";
import { computeCellRect } from "./cell-layout";
import { useScheduleScale } from "./scale-context";
import { BreakCell } from "./BreakCell";
import { GroupSessionCell } from "./GroupSessionCell";
import { SessionCell } from "./SessionCell";
import type { TherapistColumnDef, TherapistColumnProps } from "./types";

export type { TherapistColumnDef };

export const TherapistColumnHeader = memo(function TherapistColumnHeader({
  columnKind,
  column,
  colWidth,
}: {
  columnKind: "main45" | "side50";
  column: TherapistColumnDef;
  colWidth: number;
}) {
  const code = CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[column.userId];
  const specialty = CONTROL_CENTER_DEMO_DISCIPLINES.find((d) => d.code === code)?.name_el;
  return (
    <header
      className={`flex min-w-0 shrink-0 flex-col justify-center overflow-hidden border-b px-0.5 text-center ${
        columnKind === "side50" ? "border-violet-200/80 bg-violet-50/55" : "border-slate-200/80 bg-slate-50/80"
      }`}
      style={{ width: colWidth, minWidth: colWidth, maxWidth: colWidth, height: CC_RULER_HEADER_PX, minHeight: CC_RULER_HEADER_PX }}
    >
      <p className="min-w-0 truncate text-[9px] font-bold leading-tight text-ink" title={column.displayName}>
        {column.displayName}
      </p>
      {specialty ? (
        <p className="min-w-0 truncate text-[8px] font-medium leading-tight text-slate-600" title={specialty}>
          {specialty}
        </p>
      ) : null}
    </header>
  );
});

export const TherapistColumn = memo(function TherapistColumn({
  columnKind,
  column,
  colWidth,
  blocks,
  dateYmd,
  win,
  conflictMap,
  selectedId,
  onSelect,
  showStructuredBreakShading,
  freeOverlays = [],
  hideHeader,
}: TherapistColumnProps) {
  const { gridPx, pxPerMinute } = useScheduleScale();

  const placed = useMemo(() => {
    const withIv = blocks
      .map((b) => {
        const iv = blockIntervalInWindowMs(b, dateYmd);
        return iv ? { b, iv } : null;
      })
      .filter(Boolean) as { b: import("@/lib/schedule/control-center-model").ControlBoardBlock; iv: { startMs: number; endMs: number } }[];

    const laidOut = assignLanes(withIv);
    return laidOut.map((row) => ({
      row,
      rect: computeCellRect({
        colWidth,
        win,
        iv: row.iv,
        lane: row.lane,
        laneCount: row.laneCount,
        block: row.b,
        gridPx,
        pxPerMinute,
      }),
    }));
  }, [blocks, dateYmd, colWidth, win, gridPx, pxPerMinute]);

  const gridBg = columnKind === "side50" ? SIDE_50_GRID_BG : MAIN_45_GRID_BG;

  return (
    <section
      className={`isolate shrink-0 border-r ${columnKind === "side50" ? "border-violet-100/90" : "border-slate-100"}`}
      style={{ width: colWidth, minWidth: colWidth, maxWidth: colWidth }}
      aria-label={column.displayName}
    >
      {hideHeader ? null : <TherapistColumnHeader columnKind={columnKind} column={column} colWidth={colWidth} />}
      <div className="relative bg-white" style={{ width: colWidth, minWidth: colWidth, maxWidth: colWidth, height: gridPx }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: gridBg, zIndex: CC_Z_GRID }}
          aria-hidden
        />
        {showStructuredBreakShading ? (
          <div
            className="pointer-events-none absolute inset-x-0 bg-amber-100/30"
            style={{ ...structuredBreakShadeStyle(gridPx, 135, 150), zIndex: CC_Z_GRID + 1 }}
            aria-hidden
          />
        ) : null}
        {freeOverlays.map((g, idx) => {
          const top = ((g.startMs - win.startMs) / win.durationMs) * gridPx;
          const h = ((g.endMs - g.startMs) / win.durationMs) * gridPx;
          return (
            <div
              key={`free-${idx}-${g.startMs}`}
              className="pointer-events-none absolute inset-x-px rounded border border-dashed border-emerald-400/70 bg-emerald-50/35"
              style={{ top: Math.max(0, top), height: Math.max(8, h), zIndex: CC_Z_GRID + 1 }}
            />
          );
        })}
        {placed.map(({ row, rect }) => {
          const { b, lane } = row;
          const conflicts = conflictMap.get(b.id);
          const isSel = selectedId === b.id;
          const dm = Math.round(blockDurationMinutes(b));
          const isBreak = b.disciplineCode === "brk";
          const is90Group = dm === 90 && b.sessionKind === "group";
          const zBlock = isBreak ? 3 : is90Group ? 2 : 1;
          const cellProps = {
            block: b,
            rect,
            isSelected: isSel,
            conflictReasons: conflicts,
            zIndex: zBlock,
            onSelect,
          };
          if (isBreak) return <BreakCell key={`${b.id}-${lane}`} {...cellProps} />;
          if (is90Group) return <GroupSessionCell key={`${b.id}-${lane}`} {...cellProps} />;
          return <SessionCell key={`${b.id}-${lane}`} {...cellProps} />;
        })}
      </div>
    </section>
  );
});
