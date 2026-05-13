# Therapy Center Platform

Local MVP for a Greek multidisciplinary special education center.

## Setup

Install dependencies:

```powershell
npm install
```

Copy the environment template and fill it with values from a development Supabase project:

```powershell
Copy-Item .env.local.example .env.local
```

Required public environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Use only a development Supabase project. Do not commit `.env.local`; it is ignored by Git.

### Vercel (production / preview)

Set these in **Vercel → Project → Settings → Environment Variables** (same names as in `.env.local.example`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Yes** | Supabase project URL (public). |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Yes** | Supabase anon key (public; RLS must protect data). |
| `AUTH_GATING_TEMPORARILY_DISABLED` | Recommended | `true` = MVP demo mode (fixed demo org, no `user_roles` for org id). If **unset**, the app still defaults to demo mode for backwards compatibility; set to `false` when auth is enforced. |
| `DEMO_ORGANIZATION_ID` | Optional | UUID of the demo organization; must match `supabase/seed.sql` and anon read RLS policies. Omit to use the built-in seed default. |
| `DEMO_DEBUG` | Optional | `true` shows a **diagnostics strip** on shell pages (env flags + PostgREST errors) when demo gating is on—use on Preview to debug RLS without `NODE_ENV=development`. |

Optional mirrors (only if you need the same values in client bundles): `NEXT_PUBLIC_AUTH_GATING_TEMPORARILY_DISABLED`, `NEXT_PUBLIC_DEMO_ORGANIZATION_ID`, `NEXT_PUBLIC_DEMO_DEBUG`.

**Do not** set `SUPABASE_SERVICE_ROLE_KEY` (or any service role material) on Vercel for this Next.js app; the codebase uses only the anon key on the server and client.

Demo anon read policies for the seed organization live in `supabase/migrations/20260513120000_mvp_demo_anon_read_policies.sql`—apply with `npx supabase db push` or the Supabase SQL editor.

## Local Development

Start the Next.js development server:

```powershell
npm run dev
```

Useful validation commands:

```powershell
npm run type-check
npm run build
npm run lint
```

The MVP currently keeps local development access open while role-based authentication is finalized. Login and signup pages remain available, but dashboard and MVP routes are not blocked in development mode.

## Supabase schema & migrations

DDL for the MVP lives in `supabase/migrations/`:

| File | Purpose |
|------|---------|
| `20260513120000_mvp_demo_anon_read_policies.sql` | Anonymous **read** RLS policies for the fixed demo org (policies are skipped if a table does not exist yet). |
| `20260513180000_mvp_core_schema.sql` | **`CREATE TABLE IF NOT EXISTS`** for all `public.*` relations the app and `seed.sql` expect (including **`sessions`**), optional trigger to backfill `attendance.organization_id`, seed rows for **`roles`**, enable RLS, and **re-apply** the same demo anon policies so PostgREST exposes `/rest/v1/sessions` after tables exist. |

Apply to the linked remote database:

```powershell
npx supabase db push
```

If `GET /rest/v1/<table>` returns **404**, the relation is missing from `public` — run the core schema migration above, then ensure `seed.sql` (or your data) has been applied.

## Supabase Demo Data

Demo data lives in `supabase/seed.sql`. It is intended only for local development and product demos.

Apply **`npx supabase db push`** (or your CI pipeline) so **schema migrations run before** `seed.sql`; the seed assumes tables such as `sessions`, `children`, and `organizations` already exist.

The seed creates fictional Greek data for:

- Organization: `Κωνσταντίνος Κωνσταντινίδης`
- Centers: `Εύοσμος Θεσσαλονίκης`, `Νίκαια`
- Therapy disciplines, rooms, staff, children, parents, sessions, attendance, therapy goals, session notes, and sample progress reports

Run the seed with your local Supabase workflow after the database schema has been applied:

```powershell
supabase db reset
```

Or apply the file manually in the Supabase SQL editor for a local development project:

```sql
-- Run the contents of supabase/seed.sql
```

## Safety Warning

This seed file is for local development/demo only. Do not run it against production or a database containing real patient, family, staff, or clinical data.

The seed is written with stable demo UUIDs and `on conflict` upserts so it can be re-run safely in a local demo database without deleting existing rows.
