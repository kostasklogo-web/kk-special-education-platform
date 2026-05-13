import type { RoleCode } from "@/lib/auth/roles";

export type EmploymentStatus = "active" | "inactive" | "on_leave";

export type StaffRow = {
  id: string;
  organization_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  work_email: string;
  phone: string;
  job_title: string | null;
  hire_date: string | null;
  discipline_code: string | null;
  supervisor_user_id: string | null;
  employment_status: EmploymentStatus;
  observations: string;
  primary_center_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type StaffListItem = StaffRow & {
  role_code: RoleCode | null;
  role_id: string | null;
  user_role_id: string | null;
  center_name: string | null;
  discipline_name_el: string | null;
  supervisor_name: string | null;
};

export type StaffFilters = {
  centerId?: string | null;
  roleCode?: string | null;
  disciplineCode?: string | null;
  employmentStatus?: string | null;
};

export type EligibleStaffUser = {
  user_id: string;
  display_name: string | null;
  role_code: RoleCode;
  user_role_id: string;
};
