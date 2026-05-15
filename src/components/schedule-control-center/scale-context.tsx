"use client";

import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { CONTROL_CENTER_WINDOW_MINUTES } from "@/lib/schedule/control-center-prototype-utils";
import { computeIdealTherapistColWidth } from "./column-width";
import {
  CC_GRID_MIN_PX,
  CC_GRID_PX_FALLBACK,
  CC_RULER_HEADER_PX,
  CC_THERAPIST_COL_DEFAULT,
  CC_TIME_RULER_45_W,
  CC_TIME_RULER_50_W,
  CC_TIME_RULERS_TOTAL_W,
} from "./constants";
import { computeHorizontalFit } from "./fit-layout";

export type ScheduleScale = {
  gridPx: number;
  pxPerMinute: number;
  therapistColWidth: number;
  colWidthMain45: number;
  colWidthSide50: number;
  timeRuler45W: number;
  timeRuler50W: number;
  timeRulersTotalW: number;
  fitsWithoutHorizontalScroll: boolean;
};

/** @deprecated Use `ScheduleScale`. */
export type ControlCenterScale = ScheduleScale;

const defaultFit = computeHorizontalFit(900, 3, 5, CC_THERAPIST_COL_DEFAULT);

const ScheduleScaleContext = createContext<ScheduleScale>({
  gridPx: CC_GRID_PX_FALLBACK,
  pxPerMinute: CC_GRID_PX_FALLBACK / CONTROL_CENTER_WINDOW_MINUTES,
  therapistColWidth: CC_THERAPIST_COL_DEFAULT,
  colWidthMain45: CC_THERAPIST_COL_DEFAULT,
  colWidthSide50: CC_THERAPIST_COL_DEFAULT,
  timeRuler45W: CC_TIME_RULER_45_W,
  timeRuler50W: CC_TIME_RULER_50_W,
  timeRulersTotalW: CC_TIME_RULERS_TOTAL_W,
  fitsWithoutHorizontalScroll: false,
});

export function useScheduleScale(): ScheduleScale {
  return useContext(ScheduleScaleContext);
}

/** @deprecated Use `useScheduleScale`. */
export const useControlCenterScale = useScheduleScale;

type GridSlotProps = {
  gridSlotRef: RefObject<HTMLDivElement | null>;
  children: ReactNode;
};

/** Measured grid viewport; horizontal scroll only when columns do not fit. */
export function ScheduleGridSlot({ gridSlotRef, children }: GridSlotProps) {
  const { fitsWithoutHorizontalScroll } = useScheduleScale();
  return (
    <div
      ref={gridSlotRef}
      className={`min-h-0 flex-1 ${fitsWithoutHorizontalScroll ? "overflow-x-hidden" : "overflow-x-auto"} overflow-y-hidden`}
    >
      {children}
    </div>
  );
}

/** @deprecated Use `ScheduleGridSlot`. */
export const ControlCenterGridSlot = ScheduleGridSlot;

type ProviderProps = {
  children: ReactNode;
  boardRef: RefObject<HTMLElement | null>;
  gridSlotRef: RefObject<HTMLDivElement | null>;
  side50Count: number;
  main45Count: number;
  visibleBlocks: ControlBoardBlock[];
  therapistDisplayNames: string[];
};

export function ScheduleScaleProvider({
  children,
  boardRef,
  gridSlotRef,
  side50Count,
  main45Count,
  visibleBlocks,
  therapistDisplayNames,
}: ProviderProps) {
  const idealColWidth = useMemo(
    () => computeIdealTherapistColWidth(visibleBlocks, therapistDisplayNames),
    [visibleBlocks, therapistDisplayNames]
  );

  const [gridPx, setGridPx] = useState(CC_GRID_PX_FALLBACK);
  const [fit, setFit] = useState(() => computeHorizontalFit(900, side50Count, main45Count, idealColWidth));

  useLayoutEffect(() => {
    const measure = () => {
      const boardEl = boardRef.current;
      const slotEl = gridSlotRef.current;
      const boardW = boardEl?.clientWidth ?? 0;
      const slotH = slotEl?.clientHeight ?? 0;
      const track = Math.floor(slotH - CC_RULER_HEADER_PX);
      setGridPx(Math.max(CC_GRID_MIN_PX, track > 0 ? track : CC_GRID_PX_FALLBACK));
      if (boardW > 0) {
        setFit(computeHorizontalFit(boardW, side50Count, main45Count, idealColWidth));
      }
    };

    measure();
    const ro = new ResizeObserver(measure);
    if (boardRef.current) ro.observe(boardRef.current);
    if (gridSlotRef.current) ro.observe(gridSlotRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [boardRef, gridSlotRef, side50Count, main45Count, idealColWidth]);

  const value = useMemo(
    () => ({
      gridPx,
      pxPerMinute: gridPx / CONTROL_CENTER_WINDOW_MINUTES,
      therapistColWidth: fit.therapistColWidth,
      colWidthMain45: fit.therapistColWidth,
      colWidthSide50: fit.therapistColWidth,
      timeRuler45W: fit.timeRuler45W,
      timeRuler50W: fit.timeRuler50W,
      timeRulersTotalW: fit.timeRulersTotalW,
      fitsWithoutHorizontalScroll: fit.fitsWithoutHorizontalScroll,
    }),
    [gridPx, fit]
  );

  return <ScheduleScaleContext.Provider value={value}>{children}</ScheduleScaleContext.Provider>;
}

/** @deprecated Use `ScheduleScaleProvider`. */
export const ControlCenterScaleProvider = ScheduleScaleProvider;
