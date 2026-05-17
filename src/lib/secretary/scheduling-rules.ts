/**
 * Secretary scheduling rules (operational layer).
 *
 * ## Working hours
 * Default board window 13:00–21:00 Europe/Athens (see control-center-window).
 * Appointments outside this window raise `hours` conflicts.
 *
 * ## 45-minute main grid (therapy / most clinical)
 * Aligns with existing `sessions` and control-center prototype.
 *
 * ## 50+10 side columns (clinical director / psychology)
 * Used on control-center side columns; secretary appointments use explicit start/end.
 *
 * ## Conflict detection (secretary_appointments + sessions)
 * - Therapist double-booking: overlapping intervals for same staff user id
 * - Room double-booking: overlapping intervals for same room_id
 * - Child overlap: overlapping intervals for same child_id
 * - Missing room / therapist: required when status is scheduled/confirmed
 *
 * ## Overlap prevention in UI
 * - `assignLanes` in control-center for visual columns
 * - Secretary list views flag conflicts before save via `detectAppointmentConflicts`
 *
 * ## Breaks
 * Structured 15′ team break on main grid (minutes 135–150 from 13:00) — visual only unless block exists.
 * Side 50′ grid uses 10′ break slots between therapy cycles.
 *
 * ## 90-minute groups
 * Span exactly two 45′ rows; snapped start in cell-layout.
 */

export const SECRETARY_WORKING_HOUR_START = 13;
export const SECRETARY_WORKING_HOUR_END = 21;
