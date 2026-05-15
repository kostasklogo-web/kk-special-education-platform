"use client";

import { memo } from "react";
import { CC_Z_STICKY_HEADER } from "./constants";
import { useScheduleScale } from "./scale-context";
import { TimeColumnCorner } from "./time-column-primitives";
import { TherapistColumnHeader } from "./TherapistColumn";
import type { TherapistColumnDef } from "./types";

type StickyHeaderProps = {
  side50Columns: TherapistColumnDef[];
  main45Columns: TherapistColumnDef[];
};

export const StickyHeader = memo(function StickyHeader({ side50Columns, main45Columns }: StickyHeaderProps) {
  const { therapistColWidth, timeRulersTotalW, fitsWithoutHorizontalScroll } = useScheduleScale();
  const colProps = { colWidth: therapistColWidth };

  return (
    <div
      className={`sticky top-0 flex shrink-0 border-b border-slate-200/90 bg-white ${fitsWithoutHorizontalScroll ? "w-full" : "min-w-max"}`}
      style={{ zIndex: CC_Z_STICKY_HEADER }}
    >
      <div
        className="sticky left-0 shrink-0 border-r border-slate-200/90 bg-slate-50/95"
        style={{ width: timeRulersTotalW, zIndex: CC_Z_STICKY_HEADER + 1 }}
      >
        <TimeColumnCorner />
      </div>
      {side50Columns.length > 0 ? (
        <div className="flex shrink-0 border-r border-violet-200/80 bg-violet-50/35">
          {side50Columns.map((col) => (
            <TherapistColumnHeader key={col.userId} columnKind="side50" column={col} {...colProps} />
          ))}
        </div>
      ) : null}
      <div className={`flex shrink-0 ${fitsWithoutHorizontalScroll ? "" : "min-w-max"}`}>
        {main45Columns.map((col) => (
          <TherapistColumnHeader key={col.userId} columnKind="main45" column={col} {...colProps} />
        ))}
      </div>
    </div>
  );
});
