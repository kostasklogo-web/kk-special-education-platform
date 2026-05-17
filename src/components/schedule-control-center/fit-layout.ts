import { CC_THERAPIST_COL_MAX, CC_THERAPIST_COL_MIN } from "./column-width";

export const CC_TIME_RULER_45_MIN_W = 36;
export const CC_TIME_RULER_50_MIN_W = 32;

export type HorizontalFit = {
  /** Single fixed width for every therapist column (side50 + main45). */
  therapistColWidth: number;
  /** @deprecated Use `therapistColWidth`. */
  colWidthMain45: number;
  /** @deprecated Use `therapistColWidth`. */
  colWidthSide50: number;
  timeRuler45W: number;
  timeRuler50W: number;
  timeRulersTotalW: number;
  boardContentWidth: number;
  fitsWithoutHorizontalScroll: boolean;
};

export function computeHorizontalFit(
  availableWidth: number,
  side50Count: number,
  main45Count: number,
  idealColWidth: number
): HorizontalFit {
  const therapistCount = side50Count + main45Count;
  const hasSide = side50Count > 0;
  const hasMain = main45Count > 0;

  let timeRuler45W = hasSide && hasMain ? CC_TIME_RULER_45_MIN_W : hasMain || hasSide ? CC_TIME_RULER_45_MIN_W + 2 : CC_TIME_RULER_45_MIN_W;
  let timeRuler50W = hasSide ? CC_TIME_RULER_50_MIN_W : 0;
  const timeRulersTotalW = timeRuler45W + timeRuler50W;

  let therapistColWidth = Math.max(
    CC_THERAPIST_COL_MIN,
    Math.min(CC_THERAPIST_COL_MAX, idealColWidth || CC_THERAPIST_COL_MIN)
  );

  const colSlots = Math.max(0, availableWidth - timeRulersTotalW);

  if (therapistCount > 0 && colSlots > 0) {
    const maxPerCol = Math.floor(colSlots / therapistCount);
    if (maxPerCol < therapistColWidth) {
      therapistColWidth = Math.max(CC_THERAPIST_COL_MIN, maxPerCol);
    }
  }

  const boardContentWidth = timeRulersTotalW + therapistCount * therapistColWidth;

  return {
    therapistColWidth,
    colWidthMain45: therapistColWidth,
    colWidthSide50: therapistColWidth,
    timeRuler45W,
    timeRuler50W,
    timeRulersTotalW,
    boardContentWidth,
    fitsWithoutHorizontalScroll: boardContentWidth <= availableWidth + 2,
  };
}
