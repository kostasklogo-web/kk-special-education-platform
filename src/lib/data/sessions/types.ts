export type SessionStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "no_show"
  | "absence"
  | "to_reschedule";

export type SessionKind =
  | "individual"
  | "group"
  | "assessment"
  | "parent_counseling"
  | "supervision";

export type SessionRow = {
  id: string;
  organization_id: string;
  center_id: string;
  room_id: string | null;
  child_id: string;
  therapist_user_id: string;
  discipline_code: string;
  starts_at: string;
  ends_at: string;
  status: SessionStatus;
  session_kind: SessionKind;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SessionListItem = SessionRow & {
  child_name: string;
  therapist_name: string | null;
  center_name: string | null;
  room_name: string | null;
  discipline_name_el: string | null;
};

export type SessionFilters = {
  centerId?: string | null;
  therapistId?: string | null;
  childId?: string | null;
  disciplineCode?: string | null;
  roomId?: string | null;
  status?: string | null;
};
