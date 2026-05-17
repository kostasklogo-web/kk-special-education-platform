# Clinical Role Boundaries

**Status:** Phase C1  
**Last updated:** 2026-05-15

---

## Separation of modules

| Module | Roles | Clinical note bodies |
|--------|-------|----------------------|
| Clinical child file | Therapist, supervisor, CD | Yes (if access granted) |
| Therapy goals / session notes | Same | Yes |
| Secretary (`/secretary/*`) | Reception, management | **No** |
| Parent portal | Parent | Approved excerpts only |
| Management analytics | ORG_OWNER, ORG_ADMIN | Aggregates only |

Secretary **never** receives clinical access through an assignment row.

---

## Assignment vs session-derived access

### Unsafe: session-derived

Previously, `assignedTherapists` was built from `buildAssignedTherapists(sessions, goals)`:

- Therapist who **stopped** caseload still appears after last session  
- Cancelled future sessions do not revoke access  
- No explicit end date or audit of access removal  
- GDPR cannot demonstrate **revocation** on discharge  

### Safe: assignment-derived

`therapist_child_assignments` is the **only** source for:

- `assignedChildIds`
- `assertClinicalChildAccess()`
- Children list filter for therapists
- Caseload dashboard

Session history remains for **display** (session counts in overview) but not for **authorization**.

---

## Role capabilities (clinical)

| Capability | Therapist | Supervisor | CD | Secretary |
|------------|-----------|--------------|-----|-----------|
| View child file | Assigned | Scoped | All | No |
| Assign / end assignment | No | Yes | Yes | No |
| Confidential notes | If grant | Yes | Yes | No |
| Parent report body | No | Review | Approve | Package only |

---

## Production security implications

1. **RLS** — All child-scoped clinical tables must `EXISTS` active assignment (see migration comments).  
2. **Server actions** — Every write path calls `assertClinicalChildAccess` (goals, notes in C2+).  
3. **No client-only checks** — UI hide is not enough; API must deny.  
4. **Audit retention** — Access denials and confidential views logged ≥ 2 years.  
5. **Break-glass** — CEO clinical access requires policy flag + time limit + audit (not default).  
6. **Parent data** — Separate DTO; strip confidential fields server-side.  
7. **Demo mode** — `demo-store` must not ship to production without Supabase enforcement.

---

## Next phases

| Phase | Adds |
|-------|------|
| C2 | Goal scoring; assignment check on write |
| C3 | Note visibility + confidential |
| C1+ | RLS policies, persisted audit table |
