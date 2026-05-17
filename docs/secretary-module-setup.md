# Secretary / Front Desk Control Center — Setup

Module path: `/secretary` (role **RECEPTION** in app = secretary).

## Prerequisites

- Node.js 20+
- Supabase CLI (local or hosted project)
- Existing MVP seed (`10000000-0000-4000-8000-000000000001`)

## Database

1. Apply migration:

```bash
cd web
npx supabase db push
# or
npx supabase migration up
```

Migration file: `supabase/migrations/20260516120000_secretary_operations_schema.sql`

Tables: `client_intakes`, `secretary_appointments`, `case_programs`, `payment_obligations`, `secretary_tasks`, `diagnosis_documents`, `communication_logs`, `report_requests`, `internal_meetings`, `secretary_reminders`, plus lookup `secretary_appointment_types`.

2. Demo anon policies allow **SELECT** on these tables for the demo org. Writes use authenticated server actions when Supabase is reachable.

## App routes

| Route | Purpose |
|-------|---------|
| `/secretary` | Dashboard KPIs + urgent alerts |
| `/secretary/intake` | Intake list |
| `/secretary/intake/new` | New client intake form |
| `/secretary/schedule` | Appointments + conflict hints |
| `/secretary/programs` | Weekly therapy programs |
| `/secretary/payments` | Obligations & balances |
| `/secretary/tasks` | Operational tasks |
| `/secretary/diagnoses` | Document expiry tracking |
| `/secretary/communications` | Communication log |
| `/secretary/reports` | Report request workflow |
| `/secretary/meetings` | Supervision / internal meetings |
| `/secretary/search` | Global search (demo seed) |
| `/secretary/exports` | CSV exports |

Full visual schedule: `/schedule/control-center` (existing board).

## Permissions

- `canAccessSecretaryModule`: ORG_OWNER, ORG_ADMIN, RECEPTION, SUPERVISOR
- `canMutateSecretaryOperations`: ORG_OWNER, ORG_ADMIN, RECEPTION
- Secretary **cannot** edit clinical notes or approve clinical reports (`canAccessClinicalNotes` / `canApproveClinicalReports` exclude RECEPTION-only flows)

## Demo mode

Without DB rows, pages use `src/lib/demo/secretary-demo-data.ts`. Set `AUTH_GATING_TEMPORARILY_DISABLED=true` (default) for local demo session.

## Reminders & communication automation

- Route: `/secretary/reminders`
- Migration: `20260517140000_secretary_reminders_schema.sql`
- Tables: `reminder_templates`, `reminders`, `reminder_logs`, `communication_consents`
- MVP: copy-to-clipboard + mark sent + phone log; persists in `localStorage` until Supabase write actions are wired
- GDPR: per-child consent flags block SMS/email/WhatsApp/Viber when not consented

## Automations (planned cron)

`secretary_reminders` legacy table plus new `reminders` support:

- payment due / overdue
- diagnosis expiry
- pending report / evaluation
- intake follow-up

Wire via Supabase cron or Edge Function calling reminder insert — not enabled in prototype.

## TypeScript check

```bash
cd web
npx tsc --noEmit
```

## Greek UI

Labels in `src/lib/secretary/labels.ts`. Add strings there for new fields.
