"use client";

import { memo } from "react";
import { AlertTriangle } from "lucide-react";
import { blockDurationMinutes } from "@/lib/schedule/control-center-prototype-utils";
import { CC_Z_CELL, CC_Z_CELL_SELECTED } from "./constants";
import { blockHeadline, blockTimeRangeEl, disciplineVisual } from "./cell-visual";
import type { ScheduleCellBaseProps } from "./types";

export const BreakCell = memo(function BreakCell({
  block,
  rect,
  isSelected,
  conflictReasons,
  zIndex,
  onSelect,
}: ScheduleCellBaseProps) {
  const vis = disciplineVisual(block);
  const dm = Math.round(blockDurationMinutes(block));
  const is10 = dm === 10;
  const headline = blockHeadline(block);
  const timeEl = blockTimeRangeEl(block);

  return (
    <button
      type="button"
      className={[
        "absolute isolate box-border overflow-hidden rounded-[3px] border text-center shadow-none ring-1 ring-inset ring-black/[0.06] transition hover:brightness-[1.02]",
        vis.wrap,
        is10 ? "border-amber-600" : "border-slate-600",
        conflictReasons?.length ? "ring-2 ring-red-600 ring-offset-1" : "",
        isSelected ? "ring-2 ring-clinical-600 ring-offset-1" : "",
      ].join(" ")}
      style={{
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        zIndex: isSelected ? CC_Z_CELL_SELECTED : zIndex + CC_Z_CELL,
      }}
      onClick={() => onSelect(block.id)}
      title={`${headline} · ${timeEl}`}
    >
      {conflictReasons?.length ? (
        <span className="absolute right-0.5 top-0.5 z-10 inline-flex rounded bg-red-600 px-0.5 text-white">
          <AlertTriangle className="h-2.5 w-2.5" aria-hidden />
        </span>
      ) : null}
      <span className="flex h-full min-w-0 flex-col items-center justify-center gap-px px-1 py-0.5 leading-tight">
        <span
          className={`shrink-0 rounded px-1 text-[7px] font-bold uppercase tracking-wide ${
            is10 ? "bg-amber-700 text-white" : "bg-slate-800 text-white"
          }`}
        >
          {is10 ? "10′" : "15′"}
        </span>
        <span className="min-w-0 truncate text-[8px] font-bold text-slate-900">{headline}</span>
        <span className="min-w-0 truncate text-[7px] font-semibold tabular-nums text-slate-700">{timeEl}</span>
      </span>
    </button>
  );
});
