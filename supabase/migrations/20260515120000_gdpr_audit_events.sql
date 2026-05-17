-- GDPR audit trail (production). Client MVP uses localStorage until wired.
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  user_label text not null default '',
  action text not null,
  module text not null,
  summary text not null default '',
  child_id uuid references public.children (id) on delete set null,
  child_label text,
  entity_type text,
  entity_id text,
  ip_address inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index if not exists audit_events_org_occurred_idx
  on public.audit_events (organization_id, occurred_at desc);

alter table public.audit_events enable row level security;

-- Policies: management roles only (adjust to match org_members roles in production)
create policy audit_events_select_management on public.audit_events
  for select
  using (
    exists (
      select 1 from public.org_members m
      where m.organization_id = audit_events.organization_id
        and m.user_id = auth.uid()
        and m.role in ('ORG_OWNER', 'ORG_ADMIN')
    )
  );

create policy audit_events_insert_authenticated on public.audit_events
  for insert
  with check (auth.uid() is not null);
