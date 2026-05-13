import type { TherapyGoalPriority, TherapyGoalStatus } from "@/lib/data/therapy-goals/types";

export const THERAPY_GOAL_STATUS_LABELS_EL: Record<TherapyGoalStatus, string> = {
  active: "Ενεργός",
  in_progress: "Σε εξέλιξη",
  met: "Επιτεύχθηκε",
  on_hold: "Σε παύση",
  cancelled: "Ακυρώθηκε",
};

export const THERAPY_GOAL_PRIORITY_LABELS_EL: Record<TherapyGoalPriority, string> = {
  high: "Υψηλή",
  medium: "Μεσαία",
  low: "Χαμηλή",
};

export function therapyGoalStatusLabelEl(code: string | null | undefined): string {
  if (!code) return THERAPY_GOAL_STATUS_LABELS_EL.active;
  if (code in THERAPY_GOAL_STATUS_LABELS_EL) {
    return THERAPY_GOAL_STATUS_LABELS_EL[code as TherapyGoalStatus];
  }
  return code;
}

export function therapyGoalPriorityLabelEl(code: string | null | undefined): string {
  if (!code) return THERAPY_GOAL_PRIORITY_LABELS_EL.medium;
  if (code in THERAPY_GOAL_PRIORITY_LABELS_EL) {
    return THERAPY_GOAL_PRIORITY_LABELS_EL[code as TherapyGoalPriority];
  }
  return code;
}
