-- =============================================================================
-- Secretary / Front Desk operations schema (Γραμματεία — RECEPTION role in app)
-- Extends MVP core; does not modify existing clinical tables.
-- =============================================================================

-- Lookup: appointment kinds secretary can schedule (beyond therapy sessions)
create table if not exists public.secretary_appointment_types (
  code text primary key,
  name_el text not null,
  default_duration_min integer not null default 45,
  sort_order integer not null default 0,
  is_clinical_session boolean not null default false
);

-- Intake pipeline before / while creating child profile
create table if not exists public.client_intakes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid references public.children (id) on delete set null,
  lead_status text not null default 'new_inquiry',
  child_first_name text not null,
  child_last_name text not null,
  date_of_birth date,
  parent_names text not null default '',
  phone_primary text not null default '',
  phone_secondary text,
  email text,
  address_area text,
  school_name text,
  school_grade text,
  main_reason text not null default '',
  referral_source text,
  existing_diagnosis text,
  diagnosis_document_exists boolean not null default false,
  diagnosis_type text,
  diagnosis_expiry_date date,
  doctor_name text,
  current_therapies text,
  previous_therapies text,
  parent_concerns text,
  preferred_times text,
  interested_services text,
  notes text,
  gdpr_consent boolean not null default false,
  school_doctor_contact_consent boolean not null default false,
  follow_up_reminder_at timestamptz,
  submitted_at timestamptz not null default now(),
  created_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Operational appointments (therapy may also link via session_id)
create table if not exists public.secretary_appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  center_id uuid references public.centers (id),
  room_id uuid references public.rooms (id),
  child_id uuid references public.children (id),
  parent_id uuid references public.parents (id),
  session_id uuid references public.sessions (id) on delete set null,
  appointment_type_code text not null references public.secretary_appointment_types (code),
  location_code text not null default 'nikaia',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  priority text not null default 'normal',
  assigned_staff_user_ids uuid[] not null default '{}',
  notes text not null default '',
  reminder_at timestamptz,
  created_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Weekly program / case assignment
create table if not exists public.case_programs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  service_type_code text not null,
  frequency_per_week integer not null default 1,
  start_date date not null,
  end_date date,
  status text not null default 'active',
  payment_package_label text,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.case_program_therapists (
  case_program_id uuid not null references public.case_programs (id) on delete cascade,
  therapist_user_id uuid not null references public.profiles (id),
  primary key (case_program_id, therapist_user_id)
);

-- Financial obligations
create table if not exists public.payment_obligations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  parent_id uuid references public.parents (id),
  obligation_month date not null,
  expected_amount numeric(12, 2) not null default 0,
  paid_amount numeric(12, 2) not null default 0,
  due_date date not null,
  payment_status text not null default 'due_soon',
  receipt_status text not null default 'pending',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  obligation_id uuid not null references public.payment_obligations (id) on delete cascade,
  amount numeric(12, 2) not null,
  payment_date date not null,
  payment_method text not null default 'cash',
  notes text not null default '',
  recorded_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Secretary task queue
create table if not exists public.secretary_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid references public.children (id),
  task_type_code text not null,
  title text not null,
  assigned_to_user_id uuid references public.profiles (id),
  requested_by_user_id uuid references public.profiles (id),
  priority text not null default 'normal',
  status text not null default 'open',
  due_date date,
  notes text not null default '',
  completion_date date,
  linked_appointment_id uuid references public.secretary_appointments (id),
  linked_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Diagnosis documents per child (multiple allowed)
create table if not exists public.diagnosis_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  document_type text not null,
  issuing_authority text not null default '',
  issue_date date,
  expiry_date date not null,
  renewal_required boolean not null default true,
  status text not null default 'active',
  notes text not null default '',
  file_id uuid references public.files (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Communication log
create table if not exists public.communication_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid references public.children (id),
  contact_person text not null,
  contact_role text not null default 'parent',
  communication_type_code text not null,
  reason text not null default '',
  summary text not null default '',
  next_action text,
  follow_up_date date,
  responsible_user_id uuid references public.profiles (id),
  occurred_at timestamptz not null default now(),
  created_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Report request workflow (secretary-facing; clinical draft stays in progress_reports)
create table if not exists public.report_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  report_type_code text not null,
  requested_by_user_id uuid references public.profiles (id),
  assigned_therapist_user_id uuid references public.profiles (id),
  supervisor_user_id uuid references public.profiles (id),
  status text not null default 'requested',
  request_date date not null default current_date,
  due_date date,
  delivery_date date,
  notes text not null default '',
  progress_report_id uuid references public.progress_reports (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Supervision / internal meetings
create table if not exists public.internal_meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid references public.children (id),
  meeting_type_code text not null,
  agenda text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  location_code text not null default 'nikaia',
  status text not null default 'scheduled',
  notes text not null default '',
  created_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.internal_meeting_attendees (
  meeting_id uuid not null references public.internal_meetings (id) on delete cascade,
  staff_user_id uuid not null references public.profiles (id),
  primary key (meeting_id, staff_user_id)
);

-- Automation reminder log (idempotent triggers / cron can insert)
create table if not exists public.secretary_reminders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  reminder_kind text not null,
  entity_type text not null,
  entity_id uuid not null,
  child_id uuid references public.children (id),
  due_at timestamptz not null,
  acknowledged_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_intakes_org on public.client_intakes (organization_id) where deleted_at is null;
create index if not exists idx_secretary_appointments_org_starts on public.secretary_appointments (organization_id, starts_at) where deleted_at is null;
create index if not exists idx_payment_obligations_org_due on public.payment_obligations (organization_id, due_date) where deleted_at is null;
create index if not exists idx_secretary_tasks_org_due on public.secretary_tasks (organization_id, due_date) where deleted_at is null;
create index if not exists idx_diagnosis_documents_child_expiry on public.diagnosis_documents (child_id, expiry_date) where deleted_at is null;

-- Seed appointment types (idempotent)
insert into public.secretary_appointment_types (code, name_el, default_duration_min, sort_order, is_clinical_session)
values
  ('initial_inquiry', 'Αρχική τηλεφωνική επικοινωνία', 15, 10, false),
  ('parent_info', 'Συνάντηση ενημέρωσης γονέων', 45, 20, false),
  ('history_taking', 'Λήψη ιστορικού', 60, 30, false),
  ('evaluation', 'Αξιολόγηση', 60, 40, true),
  ('reevaluation', 'Επαναξιολόγηση', 60, 50, true),
  ('therapy_session', 'Θεραπευτική συνεδρία', 45, 60, true),
  ('group_session', 'Ομαδική συνεδρία', 90, 70, true),
  ('study_program', 'Πρόγραμμα μελέτης', 45, 80, true),
  ('early_intervention', 'Πρώιμη παρέμβαση', 45, 90, true),
  ('parent_counseling', 'Συμβουλευτική γονέων', 50, 100, false),
  ('parent_training', 'Εκπαίδευση γονέων', 60, 110, false),
  ('supervision', 'Εποπτεία', 60, 120, false),
  ('internal_meeting', 'Εσωτερική συνάντηση', 45, 130, false),
  ('emergency_meeting', 'Επείγουσα συνάντηση', 30, 140, false),
  ('school_comm', 'Επικοινωνία σχολείου', 30, 150, false),
  ('doctor_comm', 'Επικοινωνία γιατρού', 30, 160, false),
  ('teacher_comm', 'Επικοινωνία εκπαιδευτικού', 30, 170, false),
  ('parallel_support_comm', 'Επικοινωνία παράλληλης στήριξης', 30, 180, false),
  ('report_delivery', 'Παράδοση αναφοράς', 30, 190, false),
  ('diagnosis_followup', 'Παρακολούθηση ανανέωσης διάγνωσης', 30, 200, false)
on conflict (code) do update set
  name_el = excluded.name_el,
  default_duration_min = excluded.default_duration_min,
  sort_order = excluded.sort_order,
  is_clinical_session = excluded.is_clinical_session;

-- RLS + demo anon read (demo org UUID from seed)
alter table public.secretary_appointment_types enable row level security;
alter table public.client_intakes enable row level security;
alter table public.secretary_appointments enable row level security;
alter table public.case_programs enable row level security;
alter table public.case_program_therapists enable row level security;
alter table public.payment_obligations enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.secretary_tasks enable row level security;
alter table public.diagnosis_documents enable row level security;
alter table public.communication_logs enable row level security;
alter table public.report_requests enable row level security;
alter table public.internal_meetings enable row level security;
alter table public.internal_meeting_attendees enable row level security;
alter table public.secretary_reminders enable row level security;

do $t$
declare
  tbl text;
  tables text[] := array[
    'secretary_appointment_types',
    'client_intakes',
    'secretary_appointments',
    'case_programs',
    'payment_obligations',
    'secretary_tasks',
    'diagnosis_documents',
    'communication_logs',
    'report_requests',
    'internal_meetings',
    'secretary_reminders'
  ];
  demo_org uuid := '10000000-0000-4000-8000-000000000001';
begin
  foreach tbl in array tables loop
    if to_regclass('public.' || tbl) is not null then
      execute format('drop policy if exists mvp_demo_anon_select_%s on public.%I', tbl, tbl);
      if tbl = 'secretary_appointment_types' then
        execute format(
          'create policy mvp_demo_anon_select_%s on public.%I for select to anon using (true)',
          tbl, tbl
        );
      else
        execute format(
          'create policy mvp_demo_anon_select_%s on public.%I for select to anon using (organization_id = %L::uuid and (deleted_at is null or deleted_at is not null))',
          tbl, tbl, demo_org
        );
      end if;
    end if;
  end loop;
end
$t$;
