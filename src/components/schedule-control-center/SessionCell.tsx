"use client";

import { memo } from "react";
import { AlertTriangle } from "lucide-react";
import { blockDurationMinutes } from "@/lib/schedule/control-center-prototype-utils";
import { CC_Z_CELL, CC_Z_CELL_SELECTED } from "./constants";
import { cellMetaLineForCell, childLineForCell, disciplineVisual, groupLinkColor } from "./cell-visual";
import type { ScheduleCellBaseProps } from "./types";

export const SessionCell = memo(function SessionCell({
  block,
  rect,
  isSelected,
  conflictReasons,
  zIndex,
  onSelect,
}: ScheduleCellBaseProps) {
  const vis = disciplineVisual(block);
  const link = groupLinkColor(block.sessionGroupId);
  const dm = Math.round(blockDurationMinutes(block));
  const is50Lead = dm === 50 && (block.disciplineCode === "psy" || block.disciplineCode === "lead");
  const nameEl = childLineForCell(block);
  const metaEl = cellMetaLineForCell(block);

  return (
    <button
      type="button"
      className={[
        "absolute isolate box-border overflow-hidden rounded-[3px] border text-left shadow-none ring-1 ring-inset ring-black/[0.06] transition hover:brightness-[1.02]",
        vis.wrap,
        conflictReasons?.length ? "ring-2 ring-red-600 ring-offset-1" : "",
        isSelected ? "ring-2 ring-clinical-600 ring-offset-1" : "",
        is50Lead ? "ring-1 ring-violet-950/35" : "",
      ].join(" ")}
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        borderLeftWidth: block.sessionGroupId ? 3 : 1,
        borderLeftColor: block.sessionGroupId ? link : undefined,
        zIndex: isSelected ? CC_Z_CELL_SELECTED : zIndex + CC_Z_CELL,
      }}
      onClick={() => onSelect(block.id)}
      title={`${nameEl} · ${metaEl}`}
    >
      {conflictReasons?.length ? (
        <span className="absolute right-0.5 top-0.5 z-10 inline-flex rounded bg-red-600 px-0.5 text-white" title={conflictReasons.join(" · ")}>
          <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
        </span>
      ) : null}
      <div className="flex h-full min-h-0 min-w-0 flex-col justify-center gap-px px-1.5 py-0.5 leading-none">
        <span className="min-w-0 truncate text-[9px] font-semibold leading-tight text-ink">{nameEl}</span>
        <span className="min-w-0 truncate text-[8px] font-medium leading-tight tabular-nums text-ink/85">{metaEl}</span>
      </div>
    </button>
  );
});
