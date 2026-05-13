export type SessionNoteStatus = "draft" | "finalized";

export type SessionNoteRow = {
  id: string;
  organization_id: string;
  session_id: string;
  author_user_id: string;
  status: SessionNoteStatus;
  linked_goal_ids: string[];
  body: string;
  goals_worked: string;
  activities: string;
  child_response: string;
  observations: string;
  suggestions_next: string;
  visible_to_supervisor: boolean;
  visible_to_parent: boolean;
  finalized_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SessionNoteListItem = SessionNoteRow & {
  session_starts_at: string;
  session_therapist_user_id: string;
  child_id: string;
  child_name: string;
  therapist_name: string | null;
  discipline_name_el: string | null;
  discipline_code: string;
  author_display_name: string | null;
};

export type SessionNoteFilters = {
  childId?: string | null;
  therapistId?: string | null;
  disciplineCode?: string | null;
};
