-- Add short/long Greek templates (app is primary source; DB mirrors for reporting)

alter table public.reminder_templates
  add column if not exists body_short text,
  add column if not exists body_long text;

-- Sync codes with app (placeholders use {snake_case})
update public.reminder_templates set
  name_el = 'Επιβεβαίωση ραντεβού',
  body_short = 'Χαίρετε κ./κυρία {parent_name}, επιβεβαιώνουμε το ραντεβού του/της {child_name} ({appointment_type}) την {appointment_date}, ώρα {appointment_time}, {location}. {center_name} · {center_phone}.',
  body_long = 'Αγαπητέ/ή κ./κυρία {parent_name}, επιβεβαιώνουμε το ραντεβού του/της {child_name}: {appointment_type}, {appointment_date} {appointment_time}, {location}. {center_name} · {center_phone}.'
where code = 'appointment_confirmation';

-- Additional codes: run app templates from src/lib/secretary/reminders/templates.ts as source of truth until full DB seed script.

insert into public.reminder_templates (code, name_el, category, body_template, body_short, body_long, default_channel, sort_order)
values
  ('history_taking_reminder', 'Υπενθύμιση λήψης ιστορικού', 'appointment', '', '', '', 'sms', 35),
  ('payment_overdue_polite', 'Καθυστερημένη πληρωμή (ευγενική)', 'payment', '', '', '', 'sms', 72),
  ('payment_overdue_second', 'Καθυστερημένη πληρωμή (δεύτερη)', 'payment', '', '', '', 'sms', 82),
  ('progress_report_ready', 'Αναφορά προόδου έτοιμη', 'report', '', '', '', 'email', 112)
on conflict (code) do nothing;
