/**
 * Scheduling rules for the control-center prototype grid.
 *
 * ## 45-minute grid (main therapists)
 * - Operational window: 13:00–21:00 Athens (480 minutes).
 * - Session slots align to 45′ boundaries from 13:00 (0, 45, 90, …).
 * - Individual appointments default to 45′; start times must land on grid lines.
 * - A structured team break blocks 15′ at minutes 135–150 from 13:00 (visual shading only on main grid).
 *
 * ## 50+10-minute grid (clinical / psychology side columns)
 * - Side therapists use 50′ therapy + 10′ break slots (not 45′ alignment).
 * - Break slots are labeled separately; they do not consume a 45′ main-grid cell.
 *
 * ## Breaks
 * - `disciplineCode === "brk"`: rendered as BreakCell (10′ amber or 15′ hatched).
 * - Structured 15′ team break on main grid is background-only unless a break block exists.
 * - Side-column 10′ breaks come from the 50+10 timeline slots.
 *
 * ## 90-minute groups
 * - `sessionKind === "group"` with 90′ duration spans two 45′ grid rows.
 * - Snap start to nearest 45′ boundary; fixed 90′ height in layout (see cell-layout).
 *
 * ## Overlap prevention
 * - `assignLanes` splits concurrent blocks into horizontal lanes within a column.
 * - `annotateConflicts` flags therapist/room overlaps; cells show conflict rings.
 * - Draft creation uses `evaluateDraftAppointment` for therapist + room interval checks.
 */

export const SCHEDULE_GRID_SLOT_MINUTES = 45;
export const SCHEDULE_SIDE_SLOT_THERAPY_MINUTES = 50;
export const SCHEDULE_SIDE_SLOT_BREAK_MINUTES = 10;
export const SCHEDULE_GROUP_DURATION_MINUTES = 90;
export const SCHEDULE_STRUCTURED_TEAM_BREAK_FROM_13: [number, number] = [135, 150];
