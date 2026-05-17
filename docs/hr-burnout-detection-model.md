# Burnout & Risk Detection Model

## Goal

Early **support** signals — not automated punishment or bonus clawback.

## Signals (rule-based, prototype)

| Signal | Example threshold |
|--------|-------------------|
| Overload | Workload hours ≥ 34/week |
| Documentation deterioration | Note completion < 80% or ≥3 overdue notes |
| Supervision disengagement | >28 days since supervision or participation < 70% |
| High cancellations | Cancellation rate ≥ 10% |
| Report backlog | ≥2 overdue reports |

## Severity

Combined signal count maps to `low` | `medium` | `high` | `critical`.

Implementation: `detectBurnoutRisks()` in `risk-rules.ts`.

## Suggested actions

- Caseload redistribution
- Secretary support for documentation
- Increased supervision frequency
- Schedule review with parents (cancellations)

## UX

- Warning alerts in **Κίνδυνοι** section
- Management and supervisors see team risks; therapists see **own** risk card only

## Explicit non-goals

- Auto-reduce pay on risk flag
- Auto-terminate or disciplinary workflow (separate HR partition)

## Future

- Trend detection over 4–8 weeks
- Optional anonymized aggregate for leadership
- Integration with wellbeing / EAP referrals (out of scope for prototype)
