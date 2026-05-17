# Operational Reliability Scoring

## Definition

Consistency in **showing up, documenting, reporting, and completing operational obligations** — distinct from clinical excellence or revenue.

## Tracked items (prototype)

| Metric | Source (future) |
|--------|-----------------|
| Lateness | Check-in / schedule |
| Missing notes | Note SLA after session |
| Overdue reports | Report due dates |
| Missed supervision | Supervision calendar |
| Unresolved action plans | IDP / care plan tasks |
| Scheduling reliability | Cancellations, no-shows, gaps |

## Scoring weight

**22%** of composite performance score (`reliability` dimension in `scoring.ts`).

Sub-components for therapist row:

- Punctuality %
- Scheduling reliability %
- Inverse cancellation pressure (high cancellations reduce reliability, not rewarded)

## Center-level summary

`HR_RELIABILITY_SUMMARY` aggregates counts for leadership dashboard.

## Fairness

- Exclusions for approved leave (see management adjustment demo: Γεωργίου Ε.)
- Overrides require explanation + audit entry

## Not included

- Billable hours targets
- Revenue per therapist
- Raw session count rankings

## Implementation reference

- KPIs: `HrTherapistKpi` in overview section
- Table: Reliability section therapist breakdown
- Weights: `SCORE_WEIGHTS.reliability` in `scoring.ts`
