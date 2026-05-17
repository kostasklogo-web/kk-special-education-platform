-- Extended intake / lead fields for secretary new-case workflow

alter table public.client_intakes
  add column if not exists parent_primary_name text,
  add column if not exists parent_secondary_name text,
  add column if not exists address_full text,
  add column if not exists has_existing_diagnosis boolean not null default false,
  add column if not exists multiple_diagnosis_documents boolean not null default false,
  add column if not exists urgency_level text not null default 'normal',
  add column if not exists completeness text not null default 'complete',
  add column if not exists consent_phone boolean not null default false,
  add column if not exists consent_sms boolean not null default false,
  add column if not exists consent_email boolean not null default false,
  add column if not exists consent_viber boolean not null default false,
  add column if not exists consent_whatsapp boolean not null default false,
  add column if not exists consent_external_professionals boolean not null default false;

comment on column public.client_intakes.completeness is 'draft | incomplete | complete';
comment on column public.client_intakes.lead_status is 'new_interest, awaiting_contact, contact_made, parent_info_scheduled, history_scheduled, evaluation_scheduled, awaiting_parent, active_case, closed_unsuitable, incomplete_inquiry, draft';

-- Optional leads alias view (intakes are leads in MVP)
create or replace view public.leads as
  select
    id,
    organization_id,
    child_id,
    lead_status as status,
    child_first_name,
    child_last_name,
    parent_names,
    phone_primary,
    submitted_at as created_at,
    updated_at
  from public.client_intakes
  where deleted_at is null;

-- intake_forms mirrors client_intakes for reporting (1:1 in MVP)
create or replace view public.intake_forms as
  select * from public.client_intakes where deleted_at is null;
