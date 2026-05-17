import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import { blockDurationMinutes } from "@/lib/schedule/control-center-prototype-utils";
import type { WindowMs } from "@/lib/schedule/control-center-prototype-utils";
import { CC_CELL_COLUMN_PAD, CC_CELL_GAP_H, CC_CELL_INSET_V, CC_CELL_SLOT_GAP_V } from "./constants";

export type CellRect = {
  top: number;
  left: number;
  width: number;
  height: number;
  compact: boolean;
};

function minutesFromWindowStart(iv: { startMs: number; endMs: number }, win: WindowMs): { start: number; end: number } {
  return {
    start: (iv.startMs - win.startMs) / 60_000,
    end: (iv.endMs - win.startMs) / 60_000,
  };
}

/** Smallest safe inner height for two-line appointment copy at compact scale. */
export function minCellInnerHeight(block: ControlBoardBlock, laneCount: number): number {
  const dm = Math.round(blockDurationMinutes(block));
  const isBreak = block.disciplineCode === "brk";
  if (isBreak) return dm <= 10 ? 12 : 14;
  if (dm >= 90 && block.sessionKind === "group") return laneCount > 1 ? 32 : 34;
  if (dm >= 50) return laneCount > 1 ? 22 : 24;
  return laneCount > 1 ? 20 : 22;
}

/**
 * Overlap strategy: concurrent blocks share one column via `assignLanes` (prototype-utils).
 * Each lane gets a horizontal slice; 90′ groups snap to 45′ grid rows so stacked sessions
 * do not visually bleed across slot boundaries.
 */
export function computeCellRect(params: {
  colWidth: number;
  win: WindowMs;
  iv: { startMs: number; endMs: number };
  lane: number;
  laneCount: number;
  block: ControlBoardBlock;
  gridPx: number;
  pxPerMinute: number;
}): CellRect {
  const { colWidth, win, iv, lane, laneCount, block, gridPx, pxPerMinute } = params;
  const { start, end } = minutesFromWindowStart(iv, win);
  const durationMin = Math.max(0, end - start);
  const dm = Math.round(blockDurationMinutes(block));
  const isGroup90 = dm === 90 && block.sessionKind === "group";
  const isBreak = block.disciplineCode === "brk";

  const innerW = Math.max(16, colWidth - 2 * CC_CELL_COLUMN_PAD);
  const lanes = Math.max(1, laneCount);
  const laneW = (innerW - CC_CELL_GAP_H * (lanes - 1)) / lanes;
  const laneInnerW = Math.max(14, Math.floor(laneW) - (lanes > 1 ? 1 : 0));
  const left = CC_CELL_COLUMN_PAD + lane * (laneW + CC_CELL_GAP_H);

  let startMin = start;
  let spanMin = durationMin;
  if (isGroup90) {
    startMin = Math.round(startMin / 45) * 45;
    spanMin = 90;
  }

  const naturalH = spanMin * pxPerMinute - 2 * CC_CELL_INSET_V - CC_CELL_SLOT_GAP_V;
  let top = startMin * pxPerMinute + CC_CELL_INSET_V;
  const minH = minCellInnerHeight(block, lanes);
  let height = Math.max(minH, naturalH);

  const maxBottom = gridPx - CC_CELL_INSET_V;
  if (top + height > maxBottom) height = Math.max(minH, maxBottom - top);

  const compact = isBreak ? height < 14 : height < 22;

  return {
    top: Math.round(top),
    left: Math.round(left),
    width: laneInnerW,
    height: Math.max(isBreak && compact ? 10 : minH, Math.floor(height)),
    compact,
  };
}
