# Supervisor Evaluation Model

## Role

Supervisors provide **qualitative** and **developmental** input — not sole determinants of pay.

## Capabilities

- Evaluate assigned therapists per period (e.g. quarterly)
- Free-text qualitative feedback (separate from clinical notes)
- Recommend action plans (support, not punishment by default)
- Recommend incentive tier: `none` | `recognition` | `bonus_review`

## Separation from clinical record

- Stored in **management evaluation** partition
- Not visible to parents; not mixed with session clinical notes
- Therapists see summarized feedback on self-view; HR sees full record

## Scoring interaction

Supervisor input **modulates** but does not replace automated KPIs:

- KPI engine: objective metrics (notes SLA, supervision attendance, etc.)
- Supervisor: context (leave, caseload change, mentoring)
- Management: override with mandatory explanation + audit

## Demo data

See `HR_SUPERVISOR_EVALUATIONS` in `demo-data.ts` — includes support-oriented plan for high-risk therapist (Κωνσταντίνου Μ.).

## Future fields

- Rubric dimensions (communication, ethics, teamwork) — optional scores 1–5
- Sign-off timestamp, supervisor `user_id`
- Link to supervision session records
