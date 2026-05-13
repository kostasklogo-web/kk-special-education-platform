export type CenterRow = {
  id: string;
  organization_id: string;
  name: string;
  timezone: string;
  address_line: string | null;
  city: string;
  phone: string | null;
  contact_email: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CenterListItem = CenterRow;

export type CenterRoomSummary = {
  id: string;
  name: string;
  room_code: string;
  status: string;
};

export type CenterStaffSummary = {
  id: string;
  first_name: string;
  last_name: string;
  role_code: string | null;
};
