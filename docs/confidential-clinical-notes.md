# Confidential Clinical Notes — Architecture

**Status:** Architecture (not implemented)  
**Last updated:** 2026-05-15  
**Parent:** [clinical-core-architecture.md](./clinical-core-architecture.md)  
**Related:** [access-boundaries.md](./access-boundaries.md), [secretary-vs-clinical-responsibilities.md](./secretary-vs-clinical-responsibilities.md)

---

## 1. Two-tier clinical information model

| Tier | Code | Who sees | Parent portal | Secretary |
|------|------|----------|---------------|-----------|
| **General clinical** | `clinical_general` | Assigned therapists, supervisors, CD | Summary only if approved | **No** |
| **Confidential / restricted** | `confidential` | Permitted clinical roles only | **Never** | **Never** |

**Principle:** Default to general; opt-in confidential per field or note block.

---

## 2. Visibility levels (granular)

Extend `ClinicalNoteField` / note visibility enum:

| Level | Code | Audience |
|-------|------|----------|
| Parent-visible snippet | `parent_visible` | Parent portal (curated) |
| General clinical | `clinical_general` | Clinical staff on child |
| Supervisor-only | `supervisor_only` | Supervisor + CD |
| Confidential | `confidential` | CD + explicit grant + author |
| Management / CD notes | `management_clinical` | CD, optional CEO break-glass |

**Session note UI:** Radio group — «Γονέας», «Κλινικό (γενικό)», «Μόνο επόπτης», «Εμπιστευτικό».

---

## 3. What belongs in confidential tier

| Category | Examples |
|----------|----------|
| Sensitive behavior | Self-harm disclosure, aggression detail |
| Family risk | DV concerns, custody disputes, neglect flags |
| Internal clinical disagreement | Preliminary diagnostic uncertainty |
| Supervision-only | Supervisor debrief, trainee feedback |
| Management | CD staffing concerns, fit for program |

**Not confidential:** Routine progress, goal scores, general behavior in session (unless identifying third parties).

---

## 4. Storage model

### 4.1 Field-level (preferred)

```typescript
type ClinicalContentBlock = {
  body: string;
  visibility: "clinical_general" | "supervisor_only" | "confidential" | "parent_visible";
  authorUserId: string;
  createdAt: string;
};
```

Session notes: `blocks[]` or separate columns:

- `note_general`  
- `note_supervisor`  
- `note_confidential`  

### 4.2 Entity-level flag

`clinical_evaluations`, standalone notes:

- `has_confidential_content: boolean`  
- RLS strips confidential JSON paths for unauthorized roles.

### 4.3 `therapist_confidential_grant`

On `therapist_child_assignments`:

| Field | Default |
|-------|---------|
| `can_view_confidential` | `false` |
| `granted_by` | supervisor user id |
| `granted_at` | timestamp |

Trainees / rotating staff: general only until grant.

---

## 5. Enforcement

### 5.1 API response filtering

```typescript
function filterClinicalPayload<T>(
  payload: T,
  access: ClinicalAccessResult
): T;
```

- Therapist without grant: `note_confidential` → omitted (not `null` leak).  
- Secretary: entire clinical bundle → 403 or operational-only DTO.

### 5.2 RLS policy pattern

```sql
-- confidential column visible only if
is_clinical_director()
OR is_supervisor_for_child(child_id)
OR (
  therapist_has_confidential_grant(child_id)
  AND active_assignment(child_id)
)
```

### 5.3 Audit

| Action | Log level |
|--------|-----------|
| View confidential block | `clinical_access_audit_log` + `resource_type=confidential_note` |
| Export confidential addendum | heightened |

---

## 6. Confidential addendum (document)

Separate artifact from parent-facing progress report — see [progress-report-generation.md](./progress-report-generation.md).

### 6.1 `confidential_addenda`

| Field | Description |
|-------|-------------|
| `id` | uuid |
| `child_id` | |
| `reporting_period_start`, `end` | |
| `author_user_id` | CD or supervisor |
| `sections_json` | risk_flags, supervision_concerns, internal_recommendations |
| `linked_note_ids` | Optional references |
| `status` | `draft`, `final` |
| `pdf_storage_path` | |

**Rules:**

- Never merged into parent PDF by default.  
- Optional checkbox at export: «Συμπερίληψη εμπιστευτικού παραρτήματος» — CD only, double confirm + audit.

---

## 7. Parent-facing vs clinical separation

```
┌─────────────────────┐     ┌─────────────────────┐
│ Progress Report     │     │ Confidential        │
│ (parent-safe)       │     │ Addendum            │
│ - goals, charts     │     │ - risk, supervision │
│ - general summary   │     │ - internal recs     │
│ NO confidential     │     │ NOT parent-facing   │
└─────────────────────┘     └─────────────────────┘
```

Parent portal receives **approved excerpts** from `parent_visible` blocks only — workflow: therapist drafts → supervisor approves release.

---

## 8. UX (Greek)

| Pattern | Implementation |
|---------|----------------|
| Visual distinction | Amber lock icon + «Εμπιστευτικό» badge |
| Accidental disclosure guard | Confirm dialog when switching from confidential to parent-visible |
| Separate tab | «Εμπιστευτικά» — only if user has grant |
| Empty state (no grant) | «Δεν έχετε πρόσβαση σε εμπιστευτικά σημειώματα.» |

---

## 9. Export & GDPR

- Confidential addendum export: CD/supervisor; logged.  
- Data subject access request: legal review workflow — confidential may be redacted in copy to parents per law/policy.  
- Retention: align with org clinical record policy (typically longer than operational data).

---

## 10. Migration from current code

Existing: `ClinicalNoteField` in `lib/gdpr/permissions.ts`, session note visibility in clinical profile.

| Step | Action |
|------|--------|
| 1 | Unify enums with table above |
| 2 | Split monolithic session note text into blocks |
| 3 | Add grant column on assignments |
| 4 | Filter in `getClinicalChildProfileBundle` |
