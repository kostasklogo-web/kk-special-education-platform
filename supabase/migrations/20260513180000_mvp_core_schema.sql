-- =============================================================================
-- MVP core schema: tables expected by the Next.js app + seed.sql
-- =============================================================================
-- Diagnosis: GET /rest/v1/sessions → 404 means PostgREST has no public relation
-- named `sessions`. This repo previously shipped only RLS policies + seed data,
-- with no DDL migrations — remote projects never created the tables.
--
-- Rules: CREATE IF NOT EXISTS only; no DROP TABLE; no destructive renames;
-- no DELETE/TRUNCATE. Safe to run on partially-provisioned databases.
--
-- Part 2 (same file): re-apply demo anon SELECT policies (idempotent) so RLS
-- works immediately after tables exist (policies from 20260513120000 would
-- have skipped when tables were missing).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1) Core tables (column sets aligned with supabase/seed.sql + app selects)
-- ---------------------------------------------------------------------------

create table if not exists public.organizations (
  id uuid primary key,
  name text not null
);

create table if not exists public.therapy_disciplines (
  code text primary key,
  name_el text not null,
  sort_order integer not null default 0
);

create table if not exists public.profiles (
  id uuid primary key,
  display_name text
);

create table if not exists public.roles (
  id uuid primary key,
  code text not null unique,
  sort_order integer not null default 0
);

create table if not exists public.centers (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  timezone text not null default 'Europe/Athens',
  address_line text,
  city text not null default '',
  phone text,
  contact_email text not null default '',
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.rooms (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  center_id uuid not null references public.centers (id) on delete cascade,
  name text not null,
  room_code text not null default '',
  capacity integer not null default 1,
  room_type text not null default 'therapy',
  status text not null default 'active',
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.staff (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null,
  first_name text not null,
  last_name text not null,
  work_email text not null default '',
  phone text not null default '',
  job_title text,
  hire_date date,
  discipline_code text,
  supervisor_user_id uuid,
  employment_status text not null default 'active',
  observations text not null default '',
  primary_center_id uuid references public.centers (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.children (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  primary_center_id uuid not null references public.centers (id),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  gender text not null,
  preferred_language text not null default 'el',
  status text not null default 'active',
  school_name text,
  school_grade text,
  enrollment_start_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.parents (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  address_line text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.child_parent_relationships (
  id uuid primary key,
  child_id uuid not null references public.children (id) on delete cascade,
  parent_id uuid not null references public.parents (id) on delete cascade,
  relationship text not null,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.treatment_plans (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.therapy_goals (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  treatment_plan_id uuid references public.treatment_plans (id) on delete set null,
  discipline_code text not null references public.therapy_disciplines (code),
  therapist_user_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text,
  success_criterion text not null default '',
  start_date date,
  target_completion_date date,
  status text not null default 'active',
  priority text not null default 'medium',
  observations text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.sessions (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  center_id uuid not null references public.centers (id),
  room_id uuid references public.rooms (id) on delete set null,
  child_id uuid not null references public.children (id),
  therapist_user_id uuid not null references public.profiles (id),
  discipline_code text not null references public.therapy_disciplines (code),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'scheduled',
  session_kind text not null default 'individual',
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.attendance (
  session_id uuid primary key references public.sessions (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  status text not null default 'expected',
  recorded_by_user_id uuid references public.profiles (id) on delete set null,
  checked_in_at timestamptz,
  notes text,
  actual_starts_at timestamptz,
  actual_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.attendance_fill_organization_id()
returns trigger
language plpgsql
as $$
begin
  if new.organization_id is null and new.session_id is not null then
    select s.organization_id into new.organization_id
    from public.sessions s
    where s.id = new.session_id;
  end if;
  return new;
end;
$$;

drop trigger if exists attendance_fill_organization_id on public.attendance;
create trigger attendance_fill_organization_id
  before insert or update on public.attendance
  for each row
  execute procedure public.attendance_fill_organization_id();

create table if not exists public.session_notes (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  author_user_id uuid not null references public.profiles (id),
  status text not null default 'draft',
  linked_goal_ids uuid[] not null default '{}',
  goals_worked text not null default '',
  activities text not null default '',
  child_response text not null default '',
  observations text not null default '',
  suggestions_next text not null default '',
  visible_to_supervisor boolean not null default true,
  visible_to_parent boolean not null default false,
  body text not null default '',
  finalized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.progress_reports (
  id uuid primary key,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  period_start date,
  period_end date,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete restrict,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.supervision_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  supervisor_user_id uuid not null,
  supervisee_user_id uuid not null,
  starts_on date not null,
  ends_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.therapy_programs (
  id uuid primary key,
  child_id uuid not null references public.children (id) on delete cascade,
  title text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations (id) on delete cascade,
  child_id uuid not null references public.children (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------------------------------------------------------------------------
-- 2) Role seed (staff actions resolve role_id by code)
-- ---------------------------------------------------------------------------

insert into public.roles (id, code, sort_order)
select x.id, x.code, x.sort_order
from (
  values
    ('60000000-0000-4000-8000-000000000001'::uuid, 'ORG_OWNER', 10),
    ('60000000-0000-4000-8000-000000000002'::uuid, 'ORG_ADMIN', 20),
    ('60000000-0000-4000-8000-000000000003'::uuid, 'RECEPTION', 30),
    ('60000000-0000-4000-8000-000000000004'::uuid, 'SUPERVISOR', 40),
    ('60000000-0000-4000-8000-000000000005'::uuid, 'THERAPIST', 50),
    ('60000000-0000-4000-8000-000000000006'::uuid, 'PARENT', 60)
) as x (id, code, sort_order)
where not exists (select 1 from public.roles r where r.code = x.code);

-- ---------------------------------------------------------------------------
-- 3) Enable RLS (policies applied in section 4)
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.therapy_disciplines enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.centers enable row level security;
alter table public.rooms enable row level security;
alter table public.staff enable row level security;
alter table public.children enable row level security;
alter table public.parents enable row level security;
alter table public.child_parent_relationships enable row level security;
alter table public.treatment_plans enable row level security;
alter table public.therapy_goals enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance enable row level security;
alter table public.session_notes enable row level security;
alter table public.progress_reports enable row level security;
alter table public.user_roles enable row level security;
alter table public.supervision_relationships enable row level security;
alter table public.therapy_programs enable row level security;
alter table public.files enable row level security;

-- ---------------------------------------------------------------------------
-- 4) Demo anon read policies (keep in sync with 20260513120000)
-- ---------------------------------------------------------------------------

do $roles$
begin
  if to_regclass('public.roles') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_roles" on public.roles';
    execute $sql$
      create policy "mvp_demo_anon_select_roles"
        on public.roles
        for select
        to anon
        using (true)
    $sql$;
  end if;
end
$roles$;

do $disc$
begin
  if to_regclass('public.therapy_disciplines') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_therapy_disciplines" on public.therapy_disciplines';
    execute $sql$
      create policy "mvp_demo_anon_select_therapy_disciplines"
        on public.therapy_disciplines
        for select
        to anon
        using (true)
    $sql$;
  end if;
end
$disc$;

do $org$
begin
  if to_regclass('public.organizations') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_organizations" on public.organizations';
    execute $sql$
      create policy "mvp_demo_anon_select_organizations"
        on public.organizations
        for select
        to anon
        using (id = '10000000-0000-4000-8000-000000000001'::uuid)
    $sql$;
  end if;
end
$org$;

do $cen$
begin
  if to_regclass('public.centers') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_centers" on public.centers';
    execute $sql$
      create policy "mvp_demo_anon_select_centers"
        on public.centers
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$cen$;

do $room$
begin
  if to_regclass('public.rooms') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_rooms" on public.rooms';
    execute $sql$
      create policy "mvp_demo_anon_select_rooms"
        on public.rooms
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$room$;

do $child$
begin
  if to_regclass('public.children') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_children" on public.children';
    execute $sql$
      create policy "mvp_demo_anon_select_children"
        on public.children
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$child$;

do $par$
begin
  if to_regclass('public.parents') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_parents" on public.parents';
    execute $sql$
      create policy "mvp_demo_anon_select_parents"
        on public.parents
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$par$;

do $stf$
begin
  if to_regclass('public.staff') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_staff" on public.staff';
    execute $sql$
      create policy "mvp_demo_anon_select_staff"
        on public.staff
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$stf$;

do $ur$
begin
  if to_regclass('public.user_roles') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_user_roles" on public.user_roles';
    execute $sql$
      create policy "mvp_demo_anon_select_user_roles"
        on public.user_roles
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$ur$;

do $sup$
begin
  if to_regclass('public.supervision_relationships') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_supervision_relationships" on public.supervision_relationships';
    execute $sql$
      create policy "mvp_demo_anon_select_supervision_relationships"
        on public.supervision_relationships
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$sup$;

do $sess$
begin
  if to_regclass('public.sessions') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_sessions" on public.sessions';
    execute $sql$
      create policy "mvp_demo_anon_select_sessions"
        on public.sessions
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$sess$;

do $att$
begin
  if to_regclass('public.attendance') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_attendance" on public.attendance';
    execute $sql$
      create policy "mvp_demo_anon_select_attendance"
        on public.attendance
        for select
        to anon
        using (organization_id = '10000000-0000-4000-8000-000000000001'::uuid)
    $sql$;
  end if;
end
$att$;

do $sn$
begin
  if to_regclass('public.session_notes') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_session_notes" on public.session_notes';
    execute $sql$
      create policy "mvp_demo_anon_select_session_notes"
        on public.session_notes
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$sn$;

do $tg$
begin
  if to_regclass('public.therapy_goals') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_therapy_goals" on public.therapy_goals';
    execute $sql$
      create policy "mvp_demo_anon_select_therapy_goals"
        on public.therapy_goals
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$tg$;

do $tp$
begin
  if to_regclass('public.treatment_plans') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_treatment_plans" on public.treatment_plans';
    execute $sql$
      create policy "mvp_demo_anon_select_treatment_plans"
        on public.treatment_plans
        for select
        to anon
        using (
          organization_id = '10000000-0000-4000-8000-000000000001'::uuid
          and deleted_at is null
        )
    $sql$;
  end if;
end
$tp$;

do $pr$
begin
  if to_regclass('public.progress_reports') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_progress_reports" on public.progress_reports';
      execute $pol$
        create policy "mvp_demo_anon_select_progress_reports"
          on public.progress_reports
          for select
          to anon
          using (
            organization_id = '10000000-0000-4000-8000-000000000001'::uuid
            and deleted_at is null
          )
      $pol$;
    exception
      when undefined_column then
        execute 'drop policy if exists "mvp_demo_anon_select_progress_reports" on public.progress_reports';
        execute $pol2$
          create policy "mvp_demo_anon_select_progress_reports"
            on public.progress_reports
            for select
            to anon
            using (organization_id = '10000000-0000-4000-8000-000000000001'::uuid)
        $pol2$;
    end;
  end if;
end
$pr$;

do $cpr$
begin
  if to_regclass('public.child_parent_relationships') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_child_parent_relationships" on public.child_parent_relationships';
      execute $sql$
        create policy "mvp_demo_anon_select_child_parent_relationships"
          on public.child_parent_relationships
          for select
          to anon
          using (
            deleted_at is null
            and (
              exists (
                select 1
                from public.children c
                where
                  c.id = child_parent_relationships.child_id
                  and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and c.deleted_at is null
              )
              or exists (
                select 1
                from public.parents p
                where
                  p.id = child_parent_relationships.parent_id
                  and p.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and p.deleted_at is null
              )
            )
          )
      $sql$;
    exception
      when undefined_column then
        execute 'drop policy if exists "mvp_demo_anon_select_child_parent_relationships" on public.child_parent_relationships';
        execute $sql2$
          create policy "mvp_demo_anon_select_child_parent_relationships"
            on public.child_parent_relationships
            for select
            to anon
            using (
              exists (
                select 1
                from public.children c
                where
                  c.id = child_parent_relationships.child_id
                  and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and c.deleted_at is null
              )
              or exists (
                select 1
                from public.parents p
                where
                  p.id = child_parent_relationships.parent_id
                  and p.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and p.deleted_at is null
              )
            )
        $sql2$;
    end;
  end if;
end
$cpr$;

do $prof$
begin
  if to_regclass('public.profiles') is not null and to_regclass('public.staff') is not null then
    execute 'drop policy if exists "mvp_demo_anon_select_profiles" on public.profiles';
    begin
      execute $sql$
        create policy "mvp_demo_anon_select_profiles"
          on public.profiles
          for select
          to anon
          using (
            exists (
              select 1
              from public.staff s
              where
                s.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and s.deleted_at is null
                and (s.user_id = profiles.id or s.supervisor_user_id = profiles.id)
            )
            or exists (
              select 1
              from public.therapy_goals g
              where
                g.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and g.deleted_at is null
                and g.therapist_user_id = profiles.id
            )
            or exists (
              select 1
              from public.session_notes n
              where
                n.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and n.deleted_at is null
                and n.author_user_id = profiles.id
            )
            or exists (
              select 1
              from public.attendance a
              where
                a.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and a.recorded_by_user_id = profiles.id
            )
            or exists (
              select 1
              from public.parents pa
              where
                pa.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and pa.deleted_at is null
                and pa.user_id = profiles.id
            )
            or exists (
              select 1
              from public.supervision_relationships sr
              where
                sr.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and sr.deleted_at is null
                and (sr.supervisor_user_id = profiles.id or sr.supervisee_user_id = profiles.id)
            )
          )
      $sql$;
    exception
      when undefined_table then
        raise notice 'mvp_demo profiles: full policy skipped (missing table), using staff-only: %', sqlerrm;
        execute 'drop policy if exists "mvp_demo_anon_select_profiles" on public.profiles';
        execute $fb$
          create policy "mvp_demo_anon_select_profiles"
            on public.profiles
            for select
            to anon
            using (
              exists (
                select 1
                from public.staff s
                where
                  s.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                  and s.deleted_at is null
                  and (s.user_id = profiles.id or s.supervisor_user_id = profiles.id)
              )
            )
        $fb$;
    end;
  end if;
end
$prof$;

do $files$
begin
  if to_regclass('public.files') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_files" on public.files';
      execute $p$
        create policy "mvp_demo_anon_select_files"
          on public.files
          for select
          to anon
          using (
            exists (
              select 1
              from public.children c
              where
                c.id = files.child_id
                and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and c.deleted_at is null
            )
          )
      $p$;
    exception
      when undefined_column then
        raise notice 'Skipping files demo policy (needs child_id): %', sqlerrm;
    end;
  end if;
end
$files$;

do $tprog$
begin
  if to_regclass('public.therapy_programs') is not null then
    begin
      execute 'drop policy if exists "mvp_demo_anon_select_therapy_programs" on public.therapy_programs';
      execute $p$
        create policy "mvp_demo_anon_select_therapy_programs"
          on public.therapy_programs
          for select
          to anon
          using (
            exists (
              select 1
              from public.children c
              where
                c.id = therapy_programs.child_id
                and c.organization_id = '10000000-0000-4000-8000-000000000001'::uuid
                and c.deleted_at is null
            )
          )
      $p$;
    exception
      when undefined_column then
        raise notice 'Skipping therapy_programs demo policy: %', sqlerrm;
    end;
  end if;
end
$tprog$;
