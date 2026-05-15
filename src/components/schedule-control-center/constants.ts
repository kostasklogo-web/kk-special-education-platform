import { CONTROL_CENTER_WINDOW_MINUTES } from "@/lib/schedule/control-center-prototype-utils";

/** SSR / first paint before ResizeObserver (≈1px/min). */
export const CC_GRID_PX_FALLBACK = 480;

export const CC_GRID_MIN_PX = 340;

/** @deprecated Use `useScheduleScale()`. */
export const CC_GRID_PX = CC_GRID_PX_FALLBACK;

export const CC_PX_PER_MINUTE = CC_GRID_PX_FALLBACK / CONTROL_CENTER_WINDOW_MINUTES;

/** Default until measured; overridden by scale context (unified therapist columns). */
export const CC_THERAPIST_COL_DEFAULT = 64;
/** @deprecated Use `CC_THERAPIST_COL_DEFAULT` / `therapistColWidth`. */
export const CC_COL_WIDTH_MAIN_45 = CC_THERAPIST_COL_DEFAULT;
/** @deprecated Use `CC_THERAPIST_COL_DEFAULT` / `therapistColWidth`. */
export const CC_COL_WIDTH_SIDE_50 = CC_THERAPIST_COL_DEFAULT;

export const CC_TIME_RULER_45_W = 40;
export const CC_TIME_RULER_50_W = 34;
export const CC_TIME_RULERS_TOTAL_W = CC_TIME_RULER_45_W + CC_TIME_RULER_50_W;

export const CC_RULER_HEADER_PX = 18;
export const CC_BOARD_CAPTION_PX = 16;

export const CC_CELL_COLUMN_PAD = 2;
export const CC_CELL_GAP_H = 2;
export const CC_CELL_INSET_V = 2;
/** Extra vertical separation between stacked cells in one column. */
export const CC_CELL_SLOT_GAP_V = 2;

/** @deprecated */
export const CC_BLOCK_GUTTER_PX = CC_CELL_INSET_V;

export const CC_Z_GRID = 0;
export const CC_Z_CELL = 10;
export const CC_Z_CELL_SELECTED = 35;
export const CC_Z_STICKY_TIME = 20;
export const CC_Z_STICKY_HEADER = 30;
