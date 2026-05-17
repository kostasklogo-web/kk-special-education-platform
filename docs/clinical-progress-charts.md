# Clinical Progress Charts — Architecture

**Status:** Architecture (not implemented)  
**Last updated:** 2026-05-15  
**Parent:** [clinical-core-architecture.md](./clinical-core-architecture.md)  
**Depends on:** [goal-scoring-system.md](./goal-scoring-system.md)

---

## 1. Purpose

Visualize **measurable change** over time for:

- individual goals  
- specialties (disciplines)  
- developmental / therapeutic **domains**  
- whole-child summary  

Charts are **read models** — computed from `session_goal_scores`, `therapy_goals`, and evaluation snapshots — not stored pixel data.

---

## 2. Progress domains (`domain_code`)

Canonical enum for aggregation (Greek labels in UI):

| Code | Label (EL) |
|------|----------------|
| `speech_language` | Λόγος / Ομιλία |
| `communication` | Επικοινωνία |
| `receptive_language` | Κατανόηση |
| `expressive_language` | Έκφραση |
| `social_interaction` | Κοινωνική Αλληλεπίδραση |
| `self_regulation` | Αυτορρύθμιση |
| `executive_functions` | Επιτελικές Λειτουργίες |
| `fine_motor` | Λεπτή Κινητικότητα |
| `gross_motor` | Αδρή Κινητικότητα |
| `sensory_processing` | Αισθητηριακή Επεξεργασία |
| `academic_skills` | Μαθησιακές Δεξιότητες |
| `behavior` | Συμπεριφορά |
| `emotional_regulation` | Συναισθηματική Ρύθμιση |
| `autonomy` | Αυτονομία |
| `other` | Άλλο (με ετικέτα) |

Each `therapy_goal.domain_code` maps to one domain. Evaluations may score multiple domains via template fields.

---

## 3. Chart types

### 3.1 Per-goal line chart

- **X:** session date (or week bucket)  
- **Y:** 0–5  
- **Markers:** baseline (horizontal), target (horizontal)  
- **Tooltip:** date, score, therapist, short note  

### 3.2 Per-goal session table

| Ημερομηνία | Συνεδρία | Βαθμός | Θεραπευτής |
|------------|----------|--------|------------|

### 3.3 Per-specialty aggregate

For each `discipline_code` on child:

- Average score of active goals per week  
- Count of sessions with scores  
- Trend: Δ βαθμολογία vs 90 days ago  

### 3.4 Per-domain radar / bar (current snapshot)

- Current period avg score per domain (0–5)  
- Compare to baseline period (enrollment quarter)  

### 3.5 Child summary sparklines

- One sparkline per domain — last 12 weeks  
- Color: green ↑, amber →, red ↓ (threshold ±0.5)

### 3.6 Baseline vs current comparison card

```
Domain: Έκφραση
  Baseline (μέσος στόχων): 1.8
  Τρέχον (τελευταίες 8 συνεδρίες): 3.4
  Δ: +1.6
```

---

## 4. Read model: `GoalProgressMap` (extend existing)

Existing: `buildGoalProgressMap()` in clinical child profile.

**Extend with:**

```typescript
type GoalProgressSeries = {
  goalId: string;
  title: string;
  domainCode: string;
  disciplineCode: string;
  baselineScore: number;
  targetScore: number;
  points: { dateYmd: string; sessionId: string; score: number }[];
  movingAvg4: number | null;
  status: TherapyGoalStatus;
};

type DomainProgressSnapshot = {
  domainCode: string;
  labelEl: string;
  currentAvg: number;
  baselineAvg: number;
  delta: number;
  goalCount: number;
  sessionCount: number;
};

type SpecialtyProgressSnapshot = {
  disciplineCode: string;
  labelEl: string;
  goals: GoalProgressSeries[];
  periodAvg: number;
};
```

---

## 5. Aggregation rules

| Rule | Detail |
|------|--------|
| Missing session | Gap in line — do not interpolate |
| Multiple scores same day | Last score wins or average — **config: last** |
| Cancelled sessions | Exclude unless score recorded |
| Goals on hold | Exclude from domain avg unless supervisor toggle |
| Confidential sessions | Scores count; note text excluded from tooltips in parent export |

---

## 6. Time ranges (UI filters)

| Preset (EL) | Range |
|-------------|-------|
| Τελευταίες 8 συνεδρίες | Rolling count |
| 30 ημέρες | Calendar |
| 90 ημέρες | Calendar |
| Από έναρξη στόχου | goal.start_date → now |
| Περίοδος αναφοράς | User-selected for reports |

---

## 7. UX placement

**Child tab «Πρόοδος»:**

```
┌─────────────────────────────────────────┐
│ Φίλτρο: [90 ημέρες ▼]  [Όλες ειδικότητες]│
├─────────────────────────────────────────┤
│ Domain snapshot (bars)                   │
├─────────────────────────────────────────┤
│ Accordion per specialty                  │
│   └ goal line charts                     │
├─────────────────────────────────────────┤
│ [Εξαγωγή γραφήματος για αναφορά]        │
└─────────────────────────────────────────┘
```

**Therapist home:** Top 3 goals trending down.

---

## 8. Performance

- Pre-aggregate weekly buckets in materialized view if child has &gt; 500 scores (Phase 2).  
- v1: client-side from bundle query (limit 24 months sessions).  
- Index: `(goal_id, recorded_at)`, `(child_id, session_id)`.

---

## 9. Export

- PNG/SVG for report embedding  
- CSV for research (CD only, audit)  
- Never include confidential notes in chart export metadata
