# HR Incentive Model

## Principles

1. **Clinical quality first** — documentation, supervision, collaboration outweigh volume.
2. **No pure revenue or session-count bonuses** — avoids unsafe clinical incentives (overbooking, rushed notes, avoiding complex cases).
3. **Balanced inputs** — operational consistency, documentation quality, collaboration, supervisor and management evaluation, center goals.
4. **Transparency for staff** — therapists see eligibility and recognition; not colleagues’ euro amounts.

## Incentive types (prototype)

| Type | Example |
|------|---------|
| Monthly | Recognition badge, small non-financial |
| Quarterly | Bonus after multi-KPI threshold + supervisor sign-off |
| Annual | CE day, training budget |
| Recognition | Public / internal acknowledgment |
| Non-financial | Extra supervision time, flexible scheduling |

## Eligibility logic (demo)

- Composite score ≥ threshold (organization-defined, not revenue)
- No critical reliability failures (e.g. chronic missing notes + missed supervision)
- Supervisor recommendation optional; management approval required for financial
- **Support plans** for struggling staff precede punitive withholding

## Approval workflow (target)

```
Supervisor evaluation → Proposal → Management review → Audit log → Payroll (future)
```

## Why not revenue-only

Revenue correlates with access and payer mix, not clinical quality. Tying bonus to revenue encourages volume over safety, equity, and interdisciplinary care.

## Payroll (future)

Export approved rows: `therapist_id`, `period`, `amount`, `reason_code`, `approved_by`, `audit_id` — no automatic payment from KPI engine.
