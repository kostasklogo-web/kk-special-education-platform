# Therapist–Child Assignments (Phase C1)

**Status:** Implemented (application layer + demo store; Supabase migration scaffold)  
**Last updated:** 2026-05-15  
**Related:** [clinical-access-control.md](./clinical-access-control.md), [therapist-access-control.md](./therapist-access-control.md)

---

## Model

Table / entity: `therapist_child_assignments`

| Field | Purpose |
|-------|---------|
| `therapist_user_id` | Staff user with clinical access |
| `child_id` | Beneficiary |
| `discipline_code` / `discipline_label_el` | Specialty (λογοθεραπεία, εργοθεραπεία, …) |
| `assignment_role` | `primary_therapist`, `co_therapist`, `supervisor_oversight`, `interdisciplinary` |
| `status` | `active`, `suspended`, `ended` |
| `starts_at` / `ends_at` | Access window; end is automatic revoke |
| `assignment_source` | `manual`, `temporary`, `program_enrollment`, `schedule_rule` |
| `assigned_by_user_id` | Supervisor / CD |
| `assignment_reason` / `ended_reason` | Audit trail |
| `notes` | Free text |
| `supervisor_user_id` | Team linkage |
| `can_view_confidential` | Per-assignment confidential grant |

**Code:** `src/lib/data/therapist-assignments/`

---

## Active rule

```
status = 'active'
AND starts_at <= now()
AND (ends_at IS NULL OR ends_at > now())
```

Implemented in `active.ts` → `isAssignmentActive()`.

---

## Workflows

| Action | API |
|--------|-----|
| Assign | `createTherapistAssignment()` / `assignTherapistToChildAction` |
| End | `endTherapistAssignment()` / `endTherapistAssignmentAction` |
| List for therapist | `listActiveAssignmentsForTherapist()` |
| List for child | `listAssignmentsForChild()` |
| Child IDs for access | `listAssignedChildIdsForTherapist()` |

Assignment changes logged in `assignment-change-log.ts` (in-memory prototype).

---

## Demo data

- **Client-safe seed:** `src/lib/demo/therapist-assignments-demo.ts` — static rows (`buildDemoTherapistAssignmentsSeed`)
- **Server mutable store:** `src/lib/data/therapist-assignments/demo-store.ts` (`server-only`) — clones seed, supports create/end in prototype

Demo IDs: `src/lib/demo/clinical-demo-ids.ts` (safe for client components).

Used when Supabase table is missing or empty (prototype mode).

---

## UI

- Child profile → **Ενεργή διεπιστημονική ομάδα (αναθέσεις)** (`ClinicalTeamAssignmentsSection`)
- Home → **Τα παιδιά μου** (`TherapistCaseloadPanel`) for therapist-only role
- Children list filtered by `filterChildrenForClinicalScope()`

---

## Migration

`supabase/migrations/20260520120000_therapist_child_assignments.sql` — apply when ready; app falls back to demo until then.
