# Scheduling UX architecture — operational control center

## 1. Product framing

### 1.1 From “calendar” to “control center”

The scheduling UX is organized around **four simultaneous lenses** (user-selectable, combinable):

| Lens | Question it answers |
|------|---------------------|
| **Time** | What happens when (13:00–21:00 default window) |
| **Resource** | Rooms, therapists, groups, supervisors — who/what is occupied |
| **Demand** | Children, cohorts, families — who needs service |
| **Execution** | Attendance, cancellations, no-shows, documentation state |

**Reception/admin** default: **Time + Resource** (Master Operation Board).  
**Therapist** default: **Time + Demand (mine)**.  
**Supervisor** default: **Time + Staff risk + Supervision obligations**.

### 1.2 Master Operation Board (reception/admin)

**Purpose:** single operational picture for **multi-center** evening density.

**Primary layout (recommended):**

- **Top control strip:** date, center selector (multi-select with “all”), discipline filter, session-type filter, conflict toggle, density mode, search (child/parent/staff).
- **Left rail (collapsible):** saved filter presets (“Σήμερα — Κέντρο Α”, “Αναπληρώσεις”, “Κενά δωμάτια”).
- **Main grid:** **time on vertical axis** (13:00→21:00), **columns = resources** (rooms grouped by center, then “unassigned / TBD” lane).
- **Secondary overlay toggles:** therapist swimlanes (split view), child-centric lens (temporary column set).
- **Right intelligence rail:** ranked issues (conflicts, missing room, missing co-therapist, attendance backlog), “now+next” queue, staffing gaps.

**Key interactions:**

- **Click empty cell:** create engagement (wizard respects center, room rules, templates).
- **Click block:** inspector drawer (participants, staff roles, room bookings, attendance, linked notes/reports).
- **Hover block:** micro-tooltip (duration, counts, overlap hint).
- **Quick attendance:** icon buttons on block (expected → present/absent) without leaving board; deep link to full attendance form.

**Density modes (explicit UX contract):**

| Mode | Row height | Labeling | Use |
|------|------------|----------|-----|
| **Compact** | ~14–18 px / 5–10 min | initials, icons | 90–100 h / day |
| **Standard** | ~22–28 px / 10–15 min | short names | default admin |
| **Comfort** | ~36–44 px / 15–30 min | full names + badges | training / audits |

**Time zoom:** independent from density — snap to **5 / 10 / 15 / 30** minutes.

---

## 2. View catalog (five canonical views)

Each view is a **configuration** of the same underlying components (grid engine, inspector, conflict engine), not a separate app.

### 2.1 Admin Master View

- **Columns:** rooms (+ optional “no room” lane per center).
- **Rows:** time buckets within configured org hours.
- **Blocks:** engagements with **stacking** when multiple engagements share a room (overlap permitted by policy).
- **Global toggles:** show/hide breaks, show/hide supervision-only rows, show therapist load heatmap.

### 2.2 Therapist View

- **Default columns:** “My sessions” timeline (includes groups where therapist has a role).
- **Toggle:** add **supervision owed** and **parent meetings** as distinct track rows.
- **Privacy:** show other therapists’ names only where policy allows; children shown as needed for delivery.
- **Mobile-first strip:** agenda list + “next 3” card; board on tablet+.

### 2.3 Room View

- **Columns:** rooms (filter by center/floor).
- **Purpose:** **occupancy visibility** and **turnover** (buffer between sessions).
- **Enhancement:** “turnover risk” when end(A) + buffer > start(B) same room.

### 2.4 Child View

- **Columns:** days of week (or single day detailed) depending on density.
- **Rows:** time (or disciplines as swimlanes — user toggle).
- **Blocks:** all engagements for child + **linked group programs** (show cohort label).

### 2.5 Supervisor View

- **Columns:** supervisees (therapists) or centers (toggle).
- **Rows:** time.
- **Blocks:** supervision sessions + **delivery overlays** (optional ghost of supervisee load).
- **Risk signals:** stacked supervisions, missing documentation, chronic overruns.

---

## 3. Visual system

### 3.1 Color system (semantic + neutral chrome)

**Base rule:** color encodes **meaning**, not decoration. Use **two layers**:

1. **Fill hue:** `session family` (educational therapy, speech, OT, psychology, group program, admin meeting…).
2. **Stripe / corner:** `discipline` or `program track` (consistent across org).
3. **Border / outline:** `execution state` (scheduled / in-progress / completed / cancelled / issue).
4. **Badge dots:** `documentation` (note draft, report meeting pending).

**Conflict and risk (orthogonal to hue):**

- **Red/orange outline** + **issue glyph** (never rely on color alone — icon + tooltip).
- **Pattern hatch** for “policy violation” vs solid outline for “hard double-book”.

**Accessibility:**

- Minimum contrast for text on fills; in **Compact** mode prefer **high-contrast border + neutral fill** if needed.

### 3.2 Visual hierarchy

Order of salience (highest first):

1. **Time-now line** and **next 30 minutes** highlighting.
2. **Conflicts / missing critical resource** (room/staff).
3. **Attendance not finalized** for sessions that already started or ended (configurable rule).
4. **Standard session blocks**.
5. **Background:** breaks, org closures, room maintenance.

### 3.3 Occupancy indicators

Three complementary indicators (pick 2 visible by default):

- **Per-room column header:** numeric `active/max` concurrent capacity (for rooms that allow parallel stations).
- **Background heat** (low opacity) for utilization over the window.
- **Turnover clock** icon when < N minutes between consecutive engagements.

### 3.4 Scheduling conflicts (UX contract)

Conflicts are **first-class UI objects**:

- **Inline:** on affected blocks.
- **Aggregated:** right rail + filter “μόνο προβλήματα”.
- **Explainability:** every conflict chip expands to **plain-language cause** + **suggested fixes** (move room, shorten duration, swap co-therapist).

Conflict classes (examples):

- **Staff double-book** (same user overlapping roles).
- **Room double-book** (non-splittable room).
- **Child overlap** (solo sessions) vs **allowed parallel** (different domains — policy-driven).
- **Supervision missing** when org requires supervisor presence for a given delivery type.
- **Break violation** (session intersects mandatory break window).

### 3.5 Break visibility

Breaks render as **non-draggable background bands** (org-wide, center-specific, or per-staff).

**Controls:**

- Toggle “Εμφάνιση διαλειμμάτων”.
- Option: **hide breaks in Compact** mode except when conflict involves break.

### 3.6 Quick attendance actions

On blocks (permissions gated):

- **Present / Absent / Late / Cancel** micro-actions.
- **Open full attendance** for exceptions (make-up flags, notes).

Rules:

- Actions are **idempotent** where possible; optimistic UI with rollback banner on failure.
- Show **disabled** state with reason (“μόνο γραμματεία”, “συνεδρία σε εξέλιξη”).

---

## 4. Drag / drop strategy (design)

### 4.1 Principles

- **Server is source of truth** for conflicts and policy.
- DnD is **a proposal UI**: preview ghost + conflict badges before commit.

### 4.2 Interaction levels

| Level | Behavior |
|-------|----------|
| **Move** | Change start/end preserving duration (snap grid) |
| **Resize** | Change end (duration) with min/max per session type |
| **Reassign room** | Horizontal drag across room columns |
| **Reassign staff** | Drag to staff swimlane (Admin / Supervisor) |
| **Batch** | Multi-select blocks → move together with conflict summary |

### 4.3 Conflict preview

While dragging:

- **Green ghost:** valid.
- **Yellow ghost:** valid with warnings (e.g. outside preferred hours).
- **Red ghost:** invalid — show **list of blockers** beside pointer.

### 4.4 Undo

- **Undo stack** for last N scheduling mutations (session-scoped undo in MVP; global undo later).

---

## 5. Filtering strategy

### 5.1 Faceted filters (URL-persisted)

Stable query parameters for shareable links:

- centers[], rooms[], therapists[], children[], disciplines[], session_families[], statuses[], conflict_states[], attendance_states[].

### 5.2 Presets

System presets + org-defined:

- “Σημερινή βάρδια 15:00–21:00”
- “Όλα τα κέντρα — conflicts only”
- “Ομάδες σήμερα”
- “Γονικές συναντήσεις εβδομάδας”

### 5.3 “Problem-first” workflow

A dedicated mode that **hides healthy sessions** to keep cognitive load manageable at 90–100 hours/day.

---

## 6. Optimization for real operational constraints

### 6.1 13:00–21:00 dense scheduling

- Default window pinned; **scroll only inside** window unless user expands.
- **Auto-collapse weekends** optional.
- **Lane stacking** with +N overflow chip (“+4 ακόμη”) expandable.

### 6.2 90–100 daily educational hours

Interpreted as **sum of scheduled educational hours** across the org/day (not one room). UX must support:

- **Compact** as default for admin board.
- **Progressive disclosure** (hover/click to expand stack).
- **Pre-aggregation** in side rails (counts by center/discipline).

### 6.3 Multi-center operations

- **Center grouping** in column headers with sticky group labels during horizontal scroll.
- **Cross-center transfer** flows (child moves center — rare but supported in inspector).

### 6.4 Multidisciplinary workflows

- Visual **handoff** links (optional): same child adjacent sessions across disciplines (soft suggestion, not hard link).
- **Report meeting** type ties to progress report pipeline (status chips).

---

## 7. Information architecture (navigation)

Recommended routes (conceptual):

- `/schedule` → last-used view mode
- `/schedule/master` (admin)
- `/schedule/therapist`
- `/schedule/rooms`
- `/schedule/child/:id`
- `/schedule/supervisor`

Shared deep links preserve filters and date.

---

## 8. Non-goals (this redesign phase)

- No AI-assisted scheduling (explicitly out of scope for now).
- No automatic solver — only **detection + explain + assist** (suggestions optional later).
