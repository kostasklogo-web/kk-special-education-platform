"use client";

import { memo, type ReactNode } from "react";
import {
  CONTROL_CENTER_WINDOW_MINUTES,
  formatAthensHmFromUtcMs,
  type WindowMs,
} from "@/lib/schedule/control-center-prototype-utils";
import { CC_RULER_HEADER_PX, CC_Z_GRID } from "./constants";
import { useScheduleScale } from "./scale-context";

export const CC_Z_RULER_LABEL = CC_Z_GRID + 3;

export function hmAt(win: WindowMs, min: number): string {
  return formatAthensHmFromUtcMs(win.startMs + min * 60_000);
}

export type RulerSlotProps = {
  top: number;
  height: number;
  children: ReactNode;
  bandClassName?: string;
};

/** Slot band: label centered; grid lines stay on the track layer underneath. */
export function RulerSlot({ top, height, children, bandClassName = "" }: RulerSlotProps) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 flex items-center justify-center px-1 ${bandClassName}`}
      style={{ top, height, zIndex: CC_Z_RULER_LABEL }}
    >
      {children}
    </div>
  );
}

export type TimeLabelChipProps = {
  variant: "45" | "50" | "50-break";
  compact: boolean;
  children: ReactNode;
};

export function TimeLabelChip({ variant, compact, children }: TimeLabelChipProps) {
  const ring =
    variant === "45"
      ? "ring-slate-200/80"
      : variant === "50-break"
        ? "ring-amber-300/70"
        : "ring-violet-200/70";
  const bg = variant === "45" ? "bg-white" : variant === "50-break" ? "bg-amber-50" : "bg-white";

  return (
    <span
      className={[
        "relative z-[1] flex max-w-full flex-col items-center justify-center text-center leading-tight tabular-nums",
        "rounded-md shadow-[0_0_0_1px_rgba(255,255,255,0.9)] ring-1",
        ring,
        bg,
        compact ? "gap-0 px-0.5 py-px" : "gap-0 px-1 py-0.5",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

export function TimeRangeStack({
  win,
  startMin,
  endMin,
  compact,
  tone,
}: {
  win: WindowMs;
  startMin: number;
  endMin: number;
  compact: boolean;
  tone: "slate" | "violet" | "amber";
}) {
  const toneCls =
    tone === "amber" ? "text-amber-950" : tone === "violet" ? "text-violet-950" : "text-slate-800";
  const start = hmAt(win, startMin);
  const end = hmAt(win, endMin);

  if (compact) {
    return (
      <span className={`text-[7px] font-semibold ${toneCls}`}>
        {start}–{end}
      </span>
    );
  }

  return (
    <>
      <span className={`text-[8px] font-bold ${toneCls}`}>{start}</span>
      <span className={`text-[7px] font-medium ${toneCls} opacity-70`}>–</span>
      <span className={`text-[8px] font-semibold ${toneCls}`}>{end}</span>
    </>
  );
}

export const TimeColumnCorner = memo(function TimeColumnCorner() {
  const { timeRuler45W, timeRuler50W, timeRulersTotalW } = useScheduleScale();
  return (
    <div className="flex shrink-0" style={{ width: timeRulersTotalW }}>
      <div
        className="flex flex-col items-center justify-center border-b border-r border-slate-200/90 bg-slate-100/70 px-1"
        style={{ width: timeRuler45W, height: CC_RULER_HEADER_PX }}
      >
        <span className="text-[8px] font-bold uppercase tracking-wide text-slate-700">45′</span>
        <span className="text-[9px] font-black tabular-nums leading-none text-slate-900">πλέγμα</span>
      </div>
      <div
        className="flex flex-col items-center justify-center border-b border-violet-200/90 bg-violet-50/70 px-1"
        style={{ width: timeRuler50W, height: CC_RULER_HEADER_PX }}
      >
        <span className="text-[8px] font-bold uppercase tracking-wide text-violet-950">50′</span>
        <span className="text-[8px] font-semibold leading-tight text-violet-900">Κλιν./Ψυχ.</span>
      </div>
    </div>
  );
});
