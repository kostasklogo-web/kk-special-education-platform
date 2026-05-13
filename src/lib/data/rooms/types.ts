export type RoomType =
  | "speech_therapy"
  | "occupational_therapy"
  | "psychotherapy"
  | "group_program"
  | "assessment"
  | "office"
  | "other";

export type RoomStatus = "active" | "inactive" | "maintenance";

export type RoomRow = {
  id: string;
  organization_id: string;
  center_id: string;
  name: string;
  room_code: string;
  capacity: number | null;
  room_type: RoomType;
  status: RoomStatus;
  description: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type RoomListItem = RoomRow & {
  center_name: string | null;
};

export type RoomFilters = {
  centerId?: string | null;
  roomType?: string | null;
  status?: string | null;
};
