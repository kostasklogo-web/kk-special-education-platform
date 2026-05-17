/**
 * Stable demo data API for `/schedule/control-center` (no Supabase).
 * All board content originates from `lib/demo/schedule-control-center-data.ts`.
 */

import {
  CONTROL_CENTER_DEMO_ANCHOR_YMD,
  CONTROL_CENTER_DEMO_SESSION_BLOCKS,
  CONTROL_CENTER_DEMO_THERAPISTS,
  CONTROL_CENTER_SIDE50_THERAPIST_IDS,
  controlCenterTherapistColumnTier,
  indexControlCenterBlocksByTherapist,
  isControlCenterSide50Therapist,
  shiftControlCenterDemoBlocksToYmd,
} from "@/lib/demo/schedule-control-center-data";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import { getSafeAthensYmd } from "@/lib/schedule/athens-civil";

export {
  CONTROL_CENTER_DEMO_ANCHOR_YMD,
  CONTROL_CENTER_DEMO_SESSION_BLOCKS,
  CONTROL_CENTER_DEMO_THERAPISTS,
  CONTROL_CENTER_SIDE50_THERAPIST_IDS,
  controlCenterTherapistColumnTier,
  isControlCenterSide50Therapist,
  indexControlCenterBlocksByTherapist,
};

/** Full demo board for a civil day — never returns an empty array. */
export function getControlCenterDemoBlocksForDate(dateYmd?: string | null): ControlBoardBlock[] {
  const ymd = getSafeAthensYmd(dateYmd ?? CONTROL_CENTER_DEMO_ANCHOR_YMD);
  const blocks = shiftControlCenterDemoBlocksToYmd(ymd);
  return blocks.length > 0 ? blocks : CONTROL_CENTER_DEMO_SESSION_BLOCKS;
}

/** All therapist columns (side50 + main45), fixed order for the prototype. */
export function getControlCenterTherapistColumnDefs(): {
  side50: { userId: string; displayName: string }[];
  main45: { userId: string; displayName: string }[];
} {
  const ordered = [...CONTROL_CENTER_DEMO_THERAPISTS].sort((a, b) => {
    const t = controlCenterTherapistColumnTier(a.user_id) - controlCenterTherapistColumnTier(b.user_id);
    return t !== 0 ? t : a.display_name.localeCompare(b.display_name, "el");
  });
  const side50 = ordered
    .filter((t) => isControlCenterSide50Therapist(t.user_id))
    .map((t) => ({ userId: t.user_id, displayName: t.display_name }));
  const main45 = ordered
    .filter((t) => !isControlCenterSide50Therapist(t.user_id))
    .map((t) => ({ userId: t.user_id, displayName: t.display_name }));
  return { side50, main45 };
}

/** Stable width heuristic input — full anchor day, independent of UI filters. */
export function getControlCenterBlocksForColumnWidth(): ControlBoardBlock[] {
  return CONTROL_CENTER_DEMO_SESSION_BLOCKS;
}
