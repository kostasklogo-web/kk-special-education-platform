# Clinical Access Control (Phase C1)

**Status:** Implemented  
**Last updated:** 2026-05-15

---

## Authoritative check

```typescript
import { assertClinicalChildAccess, loadClinicalAccessScope } from "@/lib/clinical/access";

const scope = await loadClinicalAccessScope({ organizationId, userId, roleCodes });
const result = await assertClinicalChildAccess(scope, childId, "read");
```

**Location:** `src/lib/clinical/access/resolve-clinical-access.ts`

---

## Rules (summary)

| Role | Clinical child file |
|------|---------------------|
| Therapist | Active assignment to `child_id` only |
| Supervisor | Children in supervisee assignments or `supervisor_user_id` on assignment |
| Clinical director (`ORG_OWNER` / `ORG_ADMIN`) | All org children |
| Secretary (`RECEPTION` only) | **Denied** clinical file |
| Parent | Linked children only; parent-visible data (portal policy) |

Actions: `read`, `write`, `confidential_read`, `assign`, `export`.

---

## Scope loading

`loadClinicalAccessScope()` populates:

- `assignedChildIds` — from **assignments**, not sessions
- `supervisorScopedChildIds` — supervisees + supervisor linkage
- `parentChildIds` — (future parent portal)

Passed into `GdprShellBridge` → `GdprProvider` → `GdprPermissionContext.assignedChildIds`.

---

## GDPR integration

`childScopeAllowed()` in `lib/gdpr/permissions.ts`:

- Therapist without elevated roles: **deny** if `targetChildId` not in `assignedChildIds`
- No fallback to “allow all” when list is empty

---

## Audit

`logClinicalAccessAttempt()` — in-memory log (prototype):

- `view` / `denied` on child profile open
- Fields: user, child, resource type, denial reason

Production: persist to `clinical_access_audit_log` (Phase C1+).

---

## Denied UX

`ClinicalAccessDenied` component — Greek message, link back to `/children`.

---

## Enforcement points

1. `ClinicalChildProfilePage` — before bundle load  
2. `children/page.tsx` — list filter  
3. `GdprProvider` — module export / child-scoped actions  
4. Future: RLS on Supabase tables (migration policies)

---

## Why not sessions?

See [clinical-role-boundaries.md](./clinical-role-boundaries.md).
