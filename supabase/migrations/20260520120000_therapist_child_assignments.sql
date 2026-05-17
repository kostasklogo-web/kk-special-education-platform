-- Phase C1: explicit therapist–child clinical assignments (access control foundation)

CREATE TYPE therapist_assignment_status AS ENUM ('active', 'suspended', 'ended');
CREATE TYPE therapist_assignment_source AS ENUM ('manual', 'schedule_rule', 'program_enrollment', 'temporary');
CREATE TYPE therapist_assignment_role AS ENUM (
  'primary_therapist',
  'co_therapist',
  'supervisor_oversight',
  'interdisciplinary'
);

CREATE TABLE therapist_child_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id),
  child_id uuid NOT NULL REFERENCES children(id),
  therapist_user_id uuid NOT NULL,
  therapist_display_name text,
  discipline_code text,
  discipline_label_el text,
  assignment_role therapist_assignment_role NOT NULL DEFAULT 'primary_therapist',
  status therapist_assignment_status NOT NULL DEFAULT 'active',
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  assignment_source therapist_assignment_source NOT NULL DEFAULT 'manual',
  assigned_by_user_id uuid,
  assigned_by_display_name text,
  assignment_reason text,
  ended_reason text,
  notes text,
  supervisor_user_id uuid,
  supervisor_display_name text,
  can_view_confidential boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX idx_tca_org_child ON therapist_child_assignments (organization_id, child_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tca_org_therapist ON therapist_child_assignments (organization_id, therapist_user_id)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_tca_active ON therapist_child_assignments (organization_id, therapist_user_id, child_id)
  WHERE deleted_at IS NULL AND status = 'active';

COMMENT ON TABLE therapist_child_assignments IS
  'Explicit clinical caseload; therapists access child records only via active rows (not session history).';
