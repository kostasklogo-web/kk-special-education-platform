"use client";

import { memo } from "react";
import {
  CONTROL_CENTER_WINDOW_MINUTES,
  timelineSlots45From13,
  type WindowMs,
} from "@/lib/schedule/control-center-prototype-utils";
import { CC_Z_GRID } from "./constants";
import { MAIN_45_GRID_BG, structuredBreakShadeStyle } from "./board-grid";
import { useScheduleScale } from "./scale-context";
import { RulerSlot, TimeLabelChip, TimeRangeStack } from "./time-column-primitives";

const SLOTS_45 = timelineSlots45From13();

type TimeColumn45Props = {
  win: WindowMs;
  showStructuredBreakShading: boolean;
};

export const TimeColumn45 = memo(function TimeColumn45({ win, showStructuredBreakShading }: TimeColumn45Props) {
  const wM = CONTROL_CENTER_WINDOW_MINUTES;
  const { gridPx, timeRuler45W } = useScheduleScale();

  return (
    <div
      className="shrink-0 border-r border-slate-200/80 bg-gradient-to-b from-slate-50/80 to-white"
      style={{ width: timeRuler45W }}
    >
      <div className="relative isolate" style={{ height: gridPx }}>
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: MAIN_45_GRID_BG, zIndex: CC_Z_GRID }}
          aria-hidden
        />
        {showStructuredBreakShading ? (
          <div
            className="pointer-events-none absolute inset-x-0 bg-amber-100/35"
            style={{ ...structuredBreakShadeStyle(gridPx, 135, 150), zIndex: CC_Z_GRID + 1 }}
            aria-hidden
          />
        ) : null}
        {SLOTS_45.map((slot, i) => {
          const top = (slot.startMin / wM) * gridPx;
          const h = Math.max(2, ((slot.endMin - slot.startMin) / wM) * gridPx);
          const compact = h < 20;
          return (
            <RulerSlot key={`t45-${slot.startMin}-${i}`} top={top} height={h}>
              <TimeLabelChip variant="45" compact={compact}>
                <TimeRangeStack win={win} startMin={slot.startMin} endMin={slot.endMin} compact={compact} tone="slate" />
              </TimeLabelChip>
            </RulerSlot>
          );
        })}
      </div>
    </div>
  );
});
