# HR Performance & Incentive Architecture

## Purpose

Fair, clinically-safe staff performance visibility for a multidisciplinary therapy organization. **Not** a sales commission system.

## Route & module

- **UI:** `/management/hr-performance`
- **Code:** `web/src/lib/management/hr-performance/` (types, demo-data, scoring, risk-rules, read-model, permissions)
- **Components:** `web/src/components/management/hr-performance/`

## Sections (prototype)

| Section | Focus |
|--------|--------|
| Therapist overview | 10 KPI domains (sessions, notes, reports, supervision, punctuality, cancellations, interdisciplinary, parents, action plans, admin) |
| Operational reliability | Lateness, missing notes, overdue reports, supervision, action plans, scheduling |
| Clinical contribution | Goals, collaboration, protocols, continuity, education, mentoring |
| Team contribution | Meetings, training, colleague support, initiative |
| Performance scoring | Weighted dimensions (no revenue / session volume) |
| Incentives | Monthly / quarterly / annual, financial & non-financial |
| Management controls | Override, approval, audit log |
| Supervisor evaluation | Qualitative feedback, action plans, incentive recommendations |
| Therapist self | Own KPIs only; no peer financial data |
| Risk detection | Burnout, overload, documentation decline |

## Role-based access

| Role | Access |
|------|--------|
| ORG_OWNER / ORG_ADMIN | Full: all therapists, financial incentives, adjustments, audit |
| SUPERVISOR | Team therapists, evaluations, risks; limited financial |
| THERAPIST | Self KPIs, obligations, achievements; amounts hidden |
| RECEPTION | No access |

## GDPR / privacy separation

Logical partitions (future DB tables):

- HR notes
- Clinical notes (existing clinical module)
- Management evaluations
- Bonus decisions
- Disciplinary records

Prototype enforces separation via `permissions.ts` and read-model filtering.

## Prototype constraints

- Static demo data only
- No schema migration
- No payroll integration

## Future integration

1. Persist KPIs from sessions, notes, reports, supervision modules
2. Workflow for incentive approval → payroll export API
3. RLS per partition above
