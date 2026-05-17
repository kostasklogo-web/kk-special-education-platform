-- Secretary reminders & communication automation

create table if not exists public.reminder_templates (
  code text primary key,
  name_el text not null,
  category text not null default 'general',
  body_template text not null,
  default_channel text not null default 'sms',
  sort_order integer not null default 0,
  active boolean not null default true
);

create table if not exists public.communication_consents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  child_id uuid references public.children (id) on delete cascade,
  parent_id uuid references public.parents (id) on delete cascade,
  recipient_name text not null default '',
  phone text,
  email text,
  sms_consent boolean not null default false,
  email_consent boolean not null default false,
  whatsapp_consent boolean not null default false,
  viber_consent boolean not null default false,
  notes text not null default '',
  updated_at timestamptz not null default now(),
  constraint communication_consents_child_or_parent check (child_id is not null or parent_id is not null)
);

create unique index if not exists idx_communication_consents_child
  on public.communication_consents (organization_id, child_id) where child_id is not null;

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  template_code text not null references public.reminder_templates (code),
  channel text not null,
  status text not null default 'pending',
  recipient_name text not null default '',
  recipient_phone text,
  recipient_email text,
  child_id uuid references public.children (id),
  parent_id uuid references public.parents (id),
  entity_type text not null,
  entity_id text not null,
  message_body text not null default '',
  scheduled_for timestamptz,
  sent_at timestamptz,
  copied_at timestamptz,
  created_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_reminders_org_status on public.reminders (organization_id, status) where deleted_at is null;
create index if not exists idx_reminders_child on public.reminders (child_id) where deleted_at is null;
create index if not exists idx_reminders_scheduled on public.reminders (scheduled_for) where deleted_at is null and status = 'scheduled';

create table if not exists public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  reminder_id uuid not null references public.reminders (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  action text not null,
  channel text,
  status_after text,
  message_snapshot text,
  communication_log_id uuid references public.communication_logs (id),
  created_by_user_id uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- Seed Greek templates
insert into public.reminder_templates (code, name_el, category, body_template, default_channel, sort_order)
values
  ('appointment_confirmation', 'Επιβεβαίωση ραντεβού', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, επιβεβαιώνουμε το ραντεβού για τον/την {{child_name}}: {{appointment_type}}, {{appointment_date}} στις {{appointment_time}}, {{location}}. Τηλ. κέντρου: {{center_phone}}. Ευχαριστούμε!',
   'sms', 10),
  ('appointment_reminder_24h', 'Υπενθύμιση ραντεβού (24 ώρες πριν)', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, σας υπενθυμίζουμε το ραντεβού του/της {{child_name}} αύριο {{appointment_date}} στις {{appointment_time}} ({{appointment_type}}, {{location}}). Τηλ.: {{center_phone}}.',
   'sms', 20),
  ('appointment_reminder_same_day', 'Υπενθύμιση ραντεβού (σήμερα)', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, σας υπενθυμίζουμε ότι σήμερα {{appointment_date}} στις {{appointment_time}} έχετε ραντεβού για τον/την {{child_name}} ({{appointment_type}}, {{location}}). Τηλ.: {{center_phone}}.',
   'sms', 30),
  ('evaluation_reminder', 'Υπενθύμιση αξιολόγησης', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, υπενθυμίζουμε την αξιολόγηση του/της {{child_name}} στις {{appointment_date}} {{appointment_time}}, {{location}}. Παρακαλούμε 10 λεπτά νωρίτερα. Τηλ.: {{center_phone}}.',
   'sms', 40),
  ('parent_info_reminder', 'Υπενθύμιση συνάντησης ενημέρωσης', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, σας περιμένουμε για συνάντηση ενημέρωσης γονέων σχετικά με τον/την {{child_name}}: {{appointment_date}} {{appointment_time}}, {{location}}. Τηλ.: {{center_phone}}.',
   'sms', 50),
  ('payment_due_soon', 'Πληρωμή — προσεχώς λήξη', 'payment',
   'Αγαπητέ/ή {{recipient_name}}, σας ενημερώνουμε ότι για τον/την {{child_name}} οφείλεται ποσό {{amount_due}}€ με προθεσμία {{due_date}}. Για οποιαδήποτε διευκρίνιση: {{center_phone}}. Ευχαριστούμε.',
   'sms', 60),
  ('payment_overdue_1_30', 'Καθυστερημένη πληρωμή (1–30 ημέρες)', 'payment',
   'Αγαπητέ/ή {{recipient_name}}, υπενθυμίζουμε εκκρεμές υπόλοιπο {{amount_due}}€ για τον/την {{child_name}} (λήξη {{due_date}}). Παρακαλούμε επικοινωνήστε μαζί μας: {{center_phone}}.',
   'sms', 70),
  ('payment_overdue_30_60', 'Καθυστερημένη πληρωμή (30–60 ημέρες)', 'payment',
   'Αγαπητέ/ή {{recipient_name}}, το υπόλοιπο {{amount_due}}€ για τον/την {{child_name}} παραμένει ανεξόφλητο (λήξη {{due_date}}). Χρειάζεται άμεση επικοινωνία: {{center_phone}}.',
   'sms', 80),
  ('diagnosis_renewal', 'Ανανέωση εγγράφου διάγνωσης', 'diagnosis',
   'Αγαπητέ/ή {{recipient_name}}, το έγγραφο διάγνωσης του/της {{child_name}} λήγει στις {{due_date}}. Παρακαλούμε προγραμματίστε ανανέωση. Τηλ.: {{center_phone}}.',
   'sms', 90),
  ('no_show_followup', 'Δεν προσήλθε — παρακολούθηση', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, δεν εντοπίσαμε τον/την {{child_name}} στο ραντεβού {{appointment_type}} της {{appointment_date}}. Επικοινωνήστε μαζί μας για επαναπρογραμματισμό: {{center_phone}}.',
   'sms', 100),
  ('therapy_session_reminder', 'Υπενθύμιση θεραπευτικής συνεδρίας', 'appointment',
   'Αγαπητέ/ή {{recipient_name}}, υπενθυμίζουμε τη θεραπευτική συνεδρία του/της {{child_name}}: {{appointment_date}} {{appointment_time}}, {{location}}. Τηλ.: {{center_phone}}.',
   'sms', 45),
  ('pending_report_reminder', 'Εκκρεμής αναφορά / συνάντηση', 'report',
   'Αγαπητέ/ή {{recipient_name}}, σχετικά με τον/την {{child_name}}: {{appointment_type}} — παρακαλούμε επικοινωνήστε μαζί μας. Τηλ.: {{center_phone}}.',
   'email', 110)
on conflict (code) do update set
  name_el = excluded.name_el,
  body_template = excluded.body_template,
  category = excluded.category;

alter table public.reminder_templates enable row level security;
alter table public.communication_consents enable row level security;
alter table public.reminders enable row level security;
alter table public.reminder_logs enable row level security;

do $t$
declare
  demo_org uuid := '10000000-0000-4000-8000-000000000001';
  tbl text;
begin
  execute 'drop policy if exists mvp_demo_anon_select_reminder_templates on public.reminder_templates';
  execute 'create policy mvp_demo_anon_select_reminder_templates on public.reminder_templates for select to anon using (true)';

  foreach tbl in array['communication_consents', 'reminders', 'reminder_logs'] loop
    execute format('drop policy if exists mvp_demo_anon_select_%s on public.%I', tbl, tbl);
    execute format(
      'create policy mvp_demo_anon_select_%s on public.%I for select to anon using (organization_id = %L::uuid)',
      tbl, tbl, demo_org
    );
  end loop;
end $t$;
