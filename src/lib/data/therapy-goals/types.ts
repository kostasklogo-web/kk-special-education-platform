export type TherapyGoalStatus = "active" | "in_progress" | "met" | "on_hold" | "cancelled";

export type TherapyGoalPriority = "high" | "medium" | "low";

export type TherapyGoalRow = {
  id: string;
  organization_id: string;
  child_id: string;
  treatment_plan_id: string | null;
  discipline_code: string;
  therapist_user_id: string | null;
  title: string;
  description: string | null;
  success_criterion: string;
  start_date: string | null;
  target_completion_date: string | null;
  status: TherapyGoalStatus;
  priority: TherapyGoalPriority;
  observations: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type TherapyGoalListItem = TherapyGoalRow & {
  child_name: string;
  plan_title: string | null;
  discipline_name_el: string | null;
  therapist_name: string | null;
};

export type TherapyGoalFilters = {
  childId?: string | null;
  therapistId?: string | null;
  disciplineCode?: string | null;
  status?: string | null;
  priority?: string | null;
};

export type TreatmentPlanOption = {
  id: string;
  title: string;
  child_id: string;
};
