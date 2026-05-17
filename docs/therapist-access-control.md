# Therapist Access Control — Clinical Layer

**Status:** Architecture (not implemented)  
**Last updated:** 2026-05-15  
**Parent:** [clinical-core-architecture.md](./clinical-core-architecture.md)

---

## 1. Problem statement

Today, therapist access to a child is often **inferred** from sessions and goals (`assignedTherapists` derivation in [clinical-data-relationships.md](./clinical-data-relationships.md)). That is insufficient because:

- A therapist may have a future session cancelled but still see full history.  
- A therapist who **stopped** working with a child may retain access via old session joins.  
- Supervisors need **department/team** scope, not global child list.  
- GDPR requires **demonstrable** access revocation when caseload ends.

**Target:** Explicit **assignment** as the single source of truth for therapist–child clinical access.

---

## 2. Assignment entity

### 2.1 `therapist_child_assignments`

| Field | Type | Description |
|-------|------|-------------|
| `id` | uuid | PK |
| `organization_id` | uuid | Tenant |
| `child_id` | uuid | Beneficiary |
| `therapist_user_id` | uuid | Therapist profile |
| `discipline_code` | text nullable | Primary discipline for this caseload |
| `starts_at` | timestamptz | Access begins (inclusive) |
| `ends_at` | timestamptz nullable | Access ends (exclusive end-of-day policy — define in org settings) |
| `status` | enum | `active`, `suspended`, `ended` |
| `assignment_source` | enum | `manual`, `schedule_rule`, `program_enrollment` |
| `ended_reason` | text nullable | e.g. discharge, therapist_leave, transfer |
| `assigned_by` | uuid | Supervisor / CD / system |
| `created_at`, `updated_at` | timestamptz | Audit |

### 2.2 Active assignment rule

```
status = 'active'
AND starts_at <= now()
AND (ends_at IS NULL OR ends_at > now())
```

All clinical `SELECT`/`INSERT`/`UPDATE` for therapists must satisfy this rule for the row’s `child_id`.

### 2.3 Automatic end (policy, not silent delete)

| Trigger | Action |
|---------|--------|
| Supervisor ends assignment | `status = ended`, `ends_at = now()` |
| Child discharged from program | End all active assignments (batch) |
| Therapist account deactivated | Suspend all assignments |
| Optional: no session in 180 days | **Alert only** — do not auto-end without human confirmation |

Schedule may **suggest** creating an assignment when first session is booked — never grant access without row insert.

---

## 3. Access matrix by role

### 3.1 Therapist (`THERAPIST`)

| Action | Condition |
|--------|-----------|
| View child clinical file | Active assignment to `child_id` |
| Create/edit goals | Active assignment + goal.therapist = self OR team policy |
| Create session note | Session.therapist = self AND active assignment |
| Score goals in session | Same |
| View other specialists’ goals on child | Active assignment (read-only) |
| View confidential notes | Only if `therapist_confidential_grant` on assignment (default **false**) |
| List `/children` | Only children with ≥1 active assignment (or recent ended read-only window) |

### 3.2 Supervisor (`SUPERVISOR`)

| Action | Condition |
|--------|-----------|
| View child file | Child in `supervisor_scope` (center + disciplines) OR explicit watch list |
| Review notes / evaluations | Same scope |
| Edit supervision notes | Yes in scope |
| End / create assignments | Yes in scope |
| View confidential | Yes in scope |

**`supervisor_scope` (proposed):**

```
supervisor_scopes
  user_id, organization_id
  center_ids[], discipline_codes[]
  all_centers boolean
```

### 3.3 Clinical Director / clinical `ORG_ADMIN`

| Action | Condition |
|--------|-----------|
| All clinical read/write | Organization policy flag `clinical_director_full_access` |
| Confidential + management notes | Yes |
| Assignment admin | Yes |
| Audit log export | Yes |

### 3.4 Secretary (`RECEPTION`)

| Action | Condition |
|--------|-----------|
| Clinical file tabs | **Blocked** (403 / hidden) |
| Child demographics | Via `/children` list policy or secretary child picker only |
| Session note bodies | **Never** |

### 3.5 CEO (`ORG_OWNER`)

| Action | Condition |
|--------|-----------|
| Default | No clinical note bodies |
| Optional break-glass | Policy + audit + time-limited grant |

---

## 4. Enforcement layers (defense in depth)

```
Request → Middleware (auth)
       → Server action: resolveAssignment(childId, userId)
       → Service: throw Forbidden if !allowed
       → Supabase RLS: therapist policies join assignments
       → UI: hide routes / empty states
```

### 4.1 Application guard (TypeScript)

```typescript
// Target: lib/clinical/access/resolve-clinical-access.ts

type ClinicalAccessResult =
  | { allowed: true; mode: "therapist" | "supervisor" | "director"; assignmentId?: string }
  | { allowed: false; reason: "no_assignment" | "ended" | "role" };

async function assertClinicalChildAccess(
  ctx: SessionContext,
  childId: string,
  action: "read" | "write" | "confidential_read"
): Promise<ClinicalAccessResult>;
```

Integrate with existing `GdprPermissionContext.assignedChildIds` — populate from assignments query, not session distinct.

### 4.2 Row Level Security (sketch)

```sql
-- Therapist read child clinical rows
USING (
  EXISTS (
    SELECT 1 FROM therapist_child_assignments a
    WHERE a.child_id = therapy_goals.child_id
      AND a.therapist_user_id = auth.uid()
      AND a.status = 'active'
      AND a.starts_at <= now()
      AND (a.ends_at IS NULL OR a.ends_at > now())
  )
);
```

Supervisor and CD policies use separate helper functions `is_supervisor_for_child(child_id)` / `is_clinical_director()`.

---

## 5. Clinical access audit log

### 5.1 `clinical_access_audit_log`

| Field | Description |
|-------|-------------|
| `user_id` | Who |
| `child_id` | Which child |
| `resource_type` | `child_profile`, `session_note`, `evaluation`, `progress_report`, `confidential_addendum` |
| `resource_id` | UUID nullable |
| `action` | `view`, `list`, `export_pdf`, `print` |
| `occurred_at` | Timestamp |
| `metadata` | JSONB — tab name, user agent hash |

### 5.2 When to log

| Event | Log? |
|-------|------|
| Open child clinical tab | Yes (`view` child_profile) |
| Open session note body | Yes |
| Export progress report PDF | Yes |
| Export confidential addendum | Yes + heightened retention |
| List children (bulk) | Optional aggregate daily |

### 5.3 Retention

Align with GDPR audit policy in `lib/gdpr/` — clinical access logs **minimum** 2 years for healthcare accountability; configurable per org.

---

## 6. Assignment lifecycle workflows

### 6.1 New child enters program

1. Secretary completes intake / schedule (operational).  
2. Clinical lead or supervisor creates assignments per discipline.  
3. Therapists see child in «Τα παιδιά μου» only after assignment active.

### 6.2 Therapist transfer

1. End assignment A (`ended`, reason transfer).  
2. Create assignment B for new therapist.  
3. Old therapist: read-only window optional (30 days).  
4. New therapist: full access; prior notes visible per policy.

### 6.3 Discharge

1. Clinical discharge recorded.  
2. All assignments `ended`.  
3. Reports finalized; secretary handles operational closure separately.

---

## 7. UI surfaces (Greek)

| Surface | Behavior |
|---------|----------|
| **Τα παιδιά μου** | Filtered child list — active assignments only |
| Child profile header | Badge: «Ενεργή ανάθεση έως …» / «Ανάθεση έληξε» |
| Blocked access | «Δεν έχετε ενεργή ανάθεση για αυτό το παιδί. Επικοινωνήστε με τον επόπτη.» |
| Supervisor panel | «Διαχείριση αναθέσεων» — assign/end/suspend |

---

## 8. Migration from current model

| Current | Target |
|---------|--------|
| `assignedTherapists` derived from sessions | Backfill assignments from distinct session therapists (last 12 months) |
| `canViewSessionNoteClinicalBody` role-only | Add assignment check |
| Therapist opens any child in list | Restrict list query |

---

## 9. Testing checklist

- [ ] Therapist without assignment → 403 on `getClinicalChildProfileBundle`  
- [ ] Ended assignment → read-only or 403 per policy  
- [ ] Supervisor out of scope → 403  
- [ ] Secretary → never receives note bodies in API response  
- [ ] Audit row on child tab view  
- [ ] RLS direct SQL bypass attempt fails for therapist role  
