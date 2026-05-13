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

## Supabase Demo Data

Demo data lives in `supabase/seed.sql`. It is intended only for local development and product demos.

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
