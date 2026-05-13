/** DB-aligned types for public.children (technical field names in English). */

export type ChildStatus = "active" | "on_hold" | "discharged";

export type ChildGender = "male" | "female" | "other" | "unspecified";

export type PreferredLanguage = "el" | "en";

export type ChildRow = {
  id: string;
  organization_id: string;
  primary_center_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  /** DB value; UI maps known codes via CHILD_GENDER_LABELS */
  gender: string | null;
  preferred_language: PreferredLanguage;
  status: ChildStatus;
  school_name: string | null;
  school_grade: string | null;
  enrollment_start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CenterSummary = {
  id: string;
  name: string;
};

export type ChildListItem = ChildRow & {
  center: CenterSummary | null;
};

export type ParentLinkRow = {
  relationship_id: string;
  relationship: string;
  is_primary: boolean;
  parent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string | null;
    phone: string | null;
  };
};

export type TherapyProgramSummary = {
  id: string;
  title: string | null;
  discipline_code: string | null;
};
