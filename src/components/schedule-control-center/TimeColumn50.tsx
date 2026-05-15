"use client";

import { memo } from "react";
import {
  CONTROL_CENTER_WINDOW_MINUTES,
  timelineSlots50From13,
  type WindowMs,
} from "@/lib/schedule/control-center-prototype-utils";
import { CC_Z_GRID } from "./constants";
import { SIDE_50_GRID_BG } from "./board-grid";
import { useScheduleScale } from "./scale-context";
import { RulerSlot, TimeLabelChip, TimeRangeStack } from "./time-column-primitives";

const SLOTS_50 = timelineSlots50From13();

type TimeColumn50Props = {
  win: WindowMs;
};

export const TimeColumn50 = memo(function TimeColumn50({ win }: TimeColumn50Props) {
  const wM = CONTROL_CENTER_WINDOW_MINUTES;
  const { gridPx, timeRuler50W } = useScheduleScale();

  return (
    <div
      className="shrink-0 border-r border-violet-200/80 bg-gradient-to-b from-violet-50/60 to-white"
      style={{ width: timeRuler50W }}
    >
      <div className="relative isolate" style={{ height: gridPx }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: SIDE_50_GRID_BG, zIndex: CC_Z_GRID }}
          aria-hidden
        />
        {SLOTS_50.map((slot, i) => {
          const top = (slot.startMin / wM) * gridPx;
          const h = Math.max(2, ((slot.endMin - slot.startMin) / wM) * gridPx);
          const isBreak = slot.kind === "break";
          const compact = h < 18;
          return (
            <RulerSlot
              key={`t50-${slot.startMin}-${i}`}
              top={top}
              height={h}
              bandClassName={isBreak ? "bg-amber-50/30" : "bg-violet-50/12"}
            >
              <TimeLabelChip variant={isBreak ? "50-break" : "50"} compact={compact}>
                <TimeRangeStack
                  win={win}
                  startMin={slot.startMin}
                  endMin={slot.endMin}
                  compact={compact}
                  tone={isBreak ? "amber" : "violet"}
                />
                {isBreak && !compact ? (
                  <span className="text-[6px] font-bold leading-none text-amber-900">Διάλ. 10′</span>
                ) : null}
              </TimeLabelChip>
            </RulerSlot>
          );
        })}
      </div>
    </div>
  );
});
