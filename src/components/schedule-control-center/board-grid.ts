import {
  CONTROL_CENTER_WINDOW_MINUTES,
  mainGridLineMinutesFrom13,
  side50GridLineMinutesFrom13,
} from "@/lib/schedule/control-center-prototype-utils";
import type { CSSProperties } from "react";

/** CSS background for grid lines — one layer instead of dozens of divs per column. */
function gridLinesBackgroundImage(
  lineMinutes: number[],
  minorColor: string,
  hourColor: string,
  hourWidth = 1,
  minorWidth = 1
): string {
  const wM = CONTROL_CENTER_WINDOW_MINUTES;
  const stops: string[] = [];
  for (const m of lineMinutes) {
    const pct = (m / wM) * 100;
    const isHour = m > 0 && m % 60 === 0;
    const color = isHour ? hourColor : minorColor;
    const w = isHour ? hourWidth : minorWidth;
    stops.push(`transparent ${pct}%`, `${color} ${pct}%`, `${color} calc(${pct}% + ${w}px)`, `transparent calc(${pct}% + ${w}px)`);
  }
  return `linear-gradient(to bottom, ${stops.join(", ")})`;
}

/** 45′ grid: thin slot lines, slightly stronger hour marks. */
export const MAIN_45_GRID_BG = gridLinesBackgroundImage(
  mainGridLineMinutesFrom13(),
  "rgb(226 232 240 / 0.55)",
  "rgb(203 213 225 / 0.72)",
  1,
  1
);

/** 50′+10′ zone: same logic, soft violet tone. */
export const SIDE_50_GRID_BG = gridLinesBackgroundImage(
  side50GridLineMinutesFrom13(),
  "rgb(221 214 254 / 0.45)",
  "rgb(196 181 253 / 0.58)",
  1,
  1
);

export function structuredBreakShadeStyle(gridPx: number, startMin: number, endMin: number): CSSProperties {
  const wM = CONTROL_CENTER_WINDOW_MINUTES;
  return {
    top: (startMin / wM) * gridPx,
    height: Math.max(1, ((endMin - startMin) / wM) * gridPx),
  };
}
