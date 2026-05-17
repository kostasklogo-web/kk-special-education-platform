# Measurable Goals & 0–5 Scoring System

**Status:** Architecture (not implemented)  
**Last updated:** 2026-05-15  
**Parent:** [clinical-core-architecture.md](./clinical-core-architecture.md)

---

## 1. Purpose

Therapeutic and educational goals must be **measurable** and tracked **session-by-session** using a unified **0–5 performance scale**. This enables progress charts, report generation, and interdisciplinary visibility without ambiguous free-text-only tracking.

**Extends existing:** `therapy_goals` table (`lib/data/therapy-goals/types.ts`) with new scoring fields and `session_goal_scores` entity.

---

## 2. Performance scale (canonical)

| Score | Label (EL) | Definition |
|-------|------------|------------|
| **0** | Δεν παρατηρείται / αδυναμία | Skill/behavior not observed or child unable in context |
| **1** | Πολύ χαμηλή επίδοση | Rare, fragmented, requires full support |
| **2** | Αναδυόμενη | Emerging with heavy prompting |
| **3** | Μέτρια / μερική επίτευξη | Inconsistent; partial criterion met |
| **4** | Καλή με υποστήριξη | Good performance with cues/support |
| **5** | Ανεξάρτητη / επιτεύχθηκε | Independent; success criterion met |

Store as `smallint` with CHECK `score BETWEEN 0 AND 5`.

**UI:** Large tap targets (0–5 chips) + optional long-press for definition tooltip.

---

## 3. Goal entity (extended)

### 3.1 Fields

| Field | Required | Description |
|-------|----------|-------------|
| `child_id` | Yes | Beneficiary |
| `discipline_code` / specialty | Yes | Links to specialty |
| `therapist_user_id` | Yes | Accountable therapist |
| `title` | Yes | Short label |
| `measurable_description` | Yes | Observable behavior (SMART) |
| `success_criterion` | Yes | Text: what “5” looks like in practice |
| `baseline_score` | Yes | 0–5 at goal creation |
| `target_score` | Yes | Typically 4 or 5 |
| `domain_code` | Yes | See [clinical-progress-charts.md](./clinical-progress-charts.md) |
| `start_date` | Yes | |
| `target_date` | Yes | |
| `status` | Yes | `active`, `in_progress`, `met`, `on_hold`, `cancelled` |
| `linked_session_ids` | Derived | Via `session_goal_scores` |
| `linked_report_ids` | Optional | M2M when cited in reports |

### 3.2 Example (EL)

**Τίτλος:** Αυτονομία στην οργάνωση σχολικού υλικού  

**Μετρήσιμη περιγραφή:** Το παιδί θα τακτοποιεί την τσάντα του με ελάχιστες υπενθυμίσεις.  

**Κριτήριο επιτυχίας (5):** Οργανώνει τσάντα σε &lt; 5 λεπτά χωρίς λεκτική υπενθύμιση, 4/5 σχολικές μέρες.  

**Baseline:** 1 · **Target:** 4  

---

## 4. Session performance recording

### 4.1 `session_goal_scores`

| Field | Description |
|-------|-------------|
| `session_id` | FK sessions |
| `goal_id` | FK therapy_goals |
| `therapist_user_id` | Recorder (must match session therapist) |
| `performance_score` | 0–5 |
| `qualitative_note` | Optional short observation |
| `recorded_at` | Default session end time |

**Rules:**

- One row per (session, goal) maximum — upsert on save.  
- Only goals **selected for this session** appear in UI (checkbox list pre-filtered: active goals for child + own discipline).  
- Cannot score goals on child without active assignment.

### 4.2 Session note bundle (same form)

| Block | Visibility default |
|-------|-------------------|
| Goals 0–5 grid | N/A (scores stored separately) |
| Ποιότητα / συμπεριφορά | `clinical_general` |
| Συμμετοχή / engagement | `clinical_general` |
| Γενικές παρατηρήσεις | `clinical_general` |
| Εμπιστευτική σημείωση | `confidential` (separate field) |
| Γονέας (parent snippet) | `parent_visible` |

See [confidential-clinical-notes.md](./confidential-clinical-notes.md).

---

## 5. Goal status automation (suggested, not mandatory)

| Condition | Suggested status |
|-----------|------------------|
| Latest 3 sessions avg ≥ target_score | `met` (therapist confirms) |
| Past target_date and avg &lt; target − 1 | Alert «στόχος εκτός ημερομηνίας» |
| No score in 60 days | Obligation «missing scores» |

Auto-status change **requires** therapist confirmation in v1.

---

## 6. Interdisciplinary visibility

| Viewer | Sees |
|--------|------|
| Therapist (assigned) | All goals on child (read); edit own discipline goals |
| Supervisor | All goals + all scores |
| CD | All |
| Secretary | **None** |
| Parent portal | Approved summary only (no raw session scores unless policy) |

---

## 7. UX: post-session flow (minimal clicks)

```
Συνεδρία ολοκληρώθηκε
  → [Αυτόματα] Λίστα ενεργών στόχων (pre-checked τελευταίοι 3)
  → Tap 0-5 ανά στόχο (horizontal chips)
  → Optional: μία γραμμή παρατήρηση
  → [Αποθήκευση] (ένα κουμπί)
```

**Offline / draft:** Local draft until save; warn on navigate away.

---

## 8. API / service operations

| Operation | Description |
|-----------|-------------|
| `listGoalsForChild(childId)` | Assignment-guarded |
| `listGoalsForSession(sessionId)` | Pre-select |
| `upsertSessionGoalScores(sessionId, scores[])` | Batch |
| `getGoalProgressSeries(goalId)` | For charts |

---

## 9. Data integrity

- Historical scores **immutable** after 7 days except supervisor/CD correction (audit trail).  
- Deleting session soft-deletes scores.  
- Goal merge/split — rare admin tool with score migration map.

---

## 10. Relation to existing `TherapyGoalStatus`

Map existing statuses:

| Existing | Use with scoring |
|----------|------------------|
| `active` | Open for scoring |
| `in_progress` | Default when first score recorded |
| `met` | Criterion reached |
| `on_hold` | Hidden from session picker |
| `cancelled` | Read-only history |
