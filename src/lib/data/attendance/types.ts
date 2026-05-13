import type { SessionListItem } from "@/lib/data/sessions/types";

export type AttendanceStatus =
  | "expected"
  | "present"
  | "absent"
  | "cancel_parent"
  | "cancel_therapist"
  | "cancel_center"
  | "to_makeup"
  | "made_up";

export type AttendanceRow = {
  session_id: string;
  organization_id: string;
  status: AttendanceStatus;
  recorded_by_user_id: string | null;
  checked_in_at: string | null;
  notes: string | null;
  actual_starts_at: string | null;
  actual_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceListFilters = {
  centerId?: string | null;
  therapistId?: string | null;
  childId?: string | null;
  attendanceStatus?: string | null;
};

export type AttendanceSessionRow = SessionListItem & {
  attendance: AttendanceRow | null;
  recorded_by_name: string | null;
};

export type AttendanceDetail = {
  session: SessionListItem;
  attendance: AttendanceRow | null;
  recorded_by_name: string | null;
};
