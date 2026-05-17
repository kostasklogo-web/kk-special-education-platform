"use client";

import { memo } from "react";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import type { WindowMs } from "@/lib/schedule/control-center-prototype-utils";
import { CC_Z_STICKY_TIME } from "./constants";
import { useScheduleScale } from "./scale-context";
import { TimeColumn45 } from "./TimeColumn45";
import { TimeColumn50 } from "./TimeColumn50";
import { TherapistColumn } from "./TherapistColumn";
import type { TherapistColumnDef } from "./types";

export type ScheduleGridProps = {
  dateYmd: string;
  win: WindowMs;
  side50Columns: TherapistColumnDef[];
  main45Columns: TherapistColumnDef[];
  blocksByTherapist: Map<string, ControlBoardBlock[]>;
  conflictMap: Map<string, string[]>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  showPresetBreakMarkers: boolean;
  freeOverlaysByTherapist: Map<string, { startMs: number; endMs: number }[]>;
};

export const ScheduleGrid = memo(function ScheduleGrid({
  dateYmd,
  win,
  side50Columns,
  main45Columns,
  blocksByTherapist,
  conflictMap,
  selectedId,
  onSelect,
  showPresetBreakMarkers,
  freeOverlaysByTherapist,
}: ScheduleGridProps) {
  const { therapistColWidth, fitsWithoutHorizontalScroll } = useScheduleScale();
  const colProps = { colWidth: therapistColWidth };

  return (
    <div className={`flex min-h-0 flex-1 ${fitsWithoutHorizontalScroll ? "w-full" : "min-w-max"}`}>
      <div className="sticky left-0 isolate flex shrink-0 bg-white shadow-[2px_0_6px_-3px_rgba(15,23,42,0.06)]" style={{ zIndex: CC_Z_STICKY_TIME }}>
        <TimeColumn45 win={win} showStructuredBreakShading={showPresetBreakMarkers} />
        <TimeColumn50 win={win} />
      </div>
      {side50Columns.length > 0 ? (
        <div className="flex shrink-0 border-r border-violet-200/80 bg-violet-50/15">
          {side50Columns.map((col) => (
            <TherapistColumn
              key={col.userId}
              columnKind="side50"
              column={col}
              {...colProps}
              blocks={blocksByTherapist.get(col.userId) ?? []}
              dateYmd={dateYmd}
              win={win}
              conflictMap={conflictMap}
              selectedId={selectedId}
              onSelect={onSelect}
              showStructuredBreakShading={false}
              freeOverlays={freeOverlaysByTherapist.get(col.userId)}
              hideHeader
            />
          ))}
        </div>
      ) : null}
      <div className={`flex shrink-0 ${fitsWithoutHorizontalScroll ? "" : "min-w-max"}`}>
        {main45Columns.map((col) => (
          <TherapistColumn
            key={col.userId}
            columnKind="main45"
            column={col}
            {...colProps}
            blocks={blocksByTherapist.get(col.userId) ?? []}
            dateYmd={dateYmd}
            win={win}
            conflictMap={conflictMap}
            selectedId={selectedId}
            onSelect={onSelect}
            showStructuredBreakShading={showPresetBreakMarkers}
            freeOverlays={freeOverlaysByTherapist.get(col.userId)}
            hideHeader
          />
        ))}
      </div>
    </div>
  );
});
