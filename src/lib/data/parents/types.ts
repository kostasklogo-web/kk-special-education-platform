/** public.parents — technical English field names. */

export type ParentRow = {
  id: string;
  organization_id: string;
  user_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type ParentListItem = ParentRow & {
  linked_children_count: number;
};

/** child_parent_relationships.relationship — stored codes (Greek labels in UI). */
export type ChildParentRelationshipCode = "mother" | "father" | "guardian" | "other";

export type ChildParentRelationshipRow = {
  id: string;
  child_id: string;
  parent_id: string;
  relationship: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type LinkedChildSummary = {
  link_id: string;
  relationship: string;
  is_primary: boolean;
  child: {
    id: string;
    first_name: string;
    last_name: string;
  };
};

export type ParentSummary = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
};
