import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import {
  appointmentCellLines,
  blockHeadline,
  blockTimeRangeEl,
  childLineForCell,
} from "./cell-visual";
import { CC_CELL_COLUMN_PAD } from "./constants";

/** Hard floor: two compact lines (name + meta) remain legible. */
export const CC_THERAPIST_COL_MIN = 56;

/** Hard ceiling: never allocate empty horizontal space in columns. */
export const CC_THERAPIST_COL_MAX = 72;

/** Inner horizontal padding in appointment cells (px-1 × 2). */
export const CC_CELL_INNER_PAD_X = 8;

/** Heuristic px/character at compact cell sizes (Greek + tabular nums). */
const PX_PER_CHAR_NAME = 5.05;
const PX_PER_CHAR_META = 4.45;
const PX_PER_CHAR_HEADER = 4.85;
const PX_PER_CHAR_BREAK = 4.35;

const HEADER_VISIBLE_CHARS = 15;

function textWidthPx(text: string, pxPerChar: number): number {
  return Math.ceil(text.length * pxPerChar);
}

function headerWidthHint(displayName: string): number {
  const visible =
    displayName.length > HEADER_VISIBLE_CHARS
      ? `${displayName.slice(0, HEADER_VISIBLE_CHARS - 1)}…`
      : displayName;
  return CC_CELL_INNER_PAD_X + textWidthPx(visible, PX_PER_CHAR_HEADER);
}

function blockContentWidthPx(block: ControlBoardBlock): number {
  if (block.disciplineCode === "brk") {
    const headline = blockHeadline(block);
    const time = blockTimeRangeEl(block);
    const lineW = Math.max(textWidthPx(headline, PX_PER_CHAR_BREAK), textWidthPx(time, PX_PER_CHAR_BREAK));
    return CC_CELL_INNER_PAD_X + lineW;
  }

  const { child, room, time } = appointmentCellLines(block);
  const lineW = Math.max(
    textWidthPx(child, PX_PER_CHAR_NAME),
    textWidthPx(room, PX_PER_CHAR_META),
    textWidthPx(time, PX_PER_CHAR_META)
  );
  return CC_CELL_INNER_PAD_X + lineW;
}

/**
 * Ideal unified therapist column width from visible board content.
 * Stable for a given block set; does not grow to fill leftover viewport width.
 */
export function computeIdealTherapistColWidth(
  blocks: ControlBoardBlock[],
  therapistDisplayNames: string[]
): number {
  let contentW = 0;

  for (const block of blocks) {
    contentW = Math.max(contentW, blockContentWidthPx(block));
  }

  for (const name of therapistDisplayNames) {
    contentW = Math.max(contentW, headerWidthHint(name));
  }

  const withGutter = contentW + 2 * CC_CELL_COLUMN_PAD;
  return Math.max(CC_THERAPIST_COL_MIN, Math.min(CC_THERAPIST_COL_MAX, Math.ceil(withGutter)));
}
