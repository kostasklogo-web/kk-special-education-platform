# Scheduling — database considerations

This document describes a **target data model** and **migration considerations** from the current simplistic `sessions` table (single child, single therapist, optional room, fixed kinds). **No schema is implemented here.**

## 1. Core problem

Relational scheduling needs to represent:

1. **A logical engagement** (what is being delivered — group program, supervision, parent meeting, child session).
2. **Participants** (children, parents, cohorts, external attendees).
3. **Staffing with roles** (lead, co-therapist, supervisor, trainee).
4. **Resource bookings** (rooms, possibly multiple slices).
5. **Overlaps** that are either **allowed** (policy) or **violations** (constraints).
6. **Variable durations** and **non-standard session types** (reports, multidisciplinary case conference).

Trying to encode all of this in one row leads to duplication (group sessions) or fake overlaps (supervision “shadow” sessions).

## 2. Recommended conceptual entities

Names are illustrative; Greek UI labels map separately.

### 2.1 `engagement` (or `scheduled_event`)

The **canonical scheduled object** shown on the board.

Fields (conceptual):

- `id`, `organization_id`, `center_id` (primary center; see multi-center)
- `title` (optional display; can derive from type + participants)
- `family` enum: `educational_session`, `group_program`, `supervision`, `parent_meeting`, `progress_report_meeting`, `staff_meeting`, `break`, `closure`, `other`
- `status`: `draft`, `published`, `in_progress`, `completed`, `cancelled`, …
- `visibility`: who can see in therapist views
- `starts_at`, `ends_at` (UTC; local TZ = Europe/Athens in UI)
- `recurrence_rule_id` (nullable)
- `metadata` JSON (careful: not a dumping ground; prefer typed columns for query paths)

### 2.2 `engagement_participant`

Many-to-many attaching people/entities to an engagement with a role.

Examples:

- `participant_type`: `child`, `parent`, `external`, `cohort` (group program)
- `participant_id`
- `role`: `primary_client`, `group_member`, `observer`, `translator`
- `attendance_profile_id` (optional FK to per-participant attendance rules)

**Group programs:** either link many children as members **or** link a `cohort_id` that expands to members at query time.

### 2.3 `staff_assignment`

Many staff per engagement, with roles and optional time bounds (subset of engagement).

Fields:

- `engagement_id`, `user_id`
- `role`: `lead`, `co_therapist`, `supervisor`, `assistant`, `shadow`, `host` (parent meeting)
- `starts_at`, `ends_at` (nullable = full engagement)
- `discipline_code` (nullable for non-clinical roles)

**Multi-therapist sessions:** multiple rows with roles; **supervision** uses `supervisor` + supervised delivery linkage (either explicit FK `supervises_assignment_id` or parallel engagement with relation table).

### 2.4 `resource_booking`

Rooms, mobile carts, “virtual”, sensory room stations.

Fields:

- `engagement_id`, `resource_type` (`room`, `equipment`, …), `resource_id`
- `starts_at`, `ends_at`
- `capacity_units` (for divisible spaces)

**Room occupancy:** query overlapping `resource_booking` for `room` in window.

**Overlapping sessions in same room:** allowed only if `capacity_units` supports concurrent bookings; otherwise conflict rule flags violation.

### 2.5 `session_delivery` (optional bridge for clinical documentation)

If educational/legal documentation must remain **per child per discipline**, keep a child-centric record that **references** `engagement_id`:

- Billing / notes / goals may attach here rather than to the whole group engagement.

This avoids duplicating schedule while preserving per-child clinical rows.

### 2.6 `scheduling_conflict`

Materialized or on-demand, but **storing** conflicts helps reception workflows:

- `id`, `organization_id`, `severity` (`hard`, `soft`)
- `code` (`staff_overlap`, `room_overlap`, `child_overlap`, `missing_supervisor`, …)
- `engagement_ids[]` or normalized join
- `detected_at`, `resolved_at`, `resolution_note`

For performance, start with **on-demand compute** + cache; evolve to **incremental** updates on mutation.

### 2.7 `availability_block` / `org_calendar_entry`

Represents breaks, holidays, maintenance.

- Used by conflict engine and as **background** rendering.

## 3. Session kinds vs engagement family (migration mapping)

Current `session_kind` is a coarse enum on `sessions`. Target model:

- Map legacy `individual` → `family=educational_session` + single child participant + lead staff.
- Map `group` → `family=group_program` + cohort participants + multiple staff as needed.
- Map `supervision` → `family=supervision` + supervisor staff_assignment + supervisee link.
- Map `parent_counseling` → `family=parent_meeting` + parent participants.

**Progress report meetings:** new `family=progress_report_meeting` with linked `report_id` (nullable until created).

## 4. Overlap semantics (policy as data)

Introduce **`overlap_policy`** at org/center level, e.g.:

- Allow **child parallel** if disciplines in allowed set (e.g. OT + SLT parallel for same child — if org allows).
- Never allow **same staff** overlapping assignments (hard).
- Room: default hard overlap unless `capacity_units` > 1.

Store as rule rows or JSON with validated schema; **avoid** burying rules only in application code long-term.

## 5. Multi-center

- **`engagement.center_id`**: primary site for operations.
- Optional **`engagement_site`** rows if one logical event uses resources from two centers (rare; start as unsupported + explicit warning).

## 6. Indexing (target)

Minimum recommended indexes for day-board queries:

- `(center_id, starts_at, ends_at)` on `resource_booking` for room/day windows.
- `(user_id, starts_at, ends_at)` on `staff_assignment` for therapist/day.
- `(participant_type, participant_id, starts_at)` on `engagement_participant` joined to `engagement` for child week views.

## 7. Migration path from current `sessions`

Phased approach (low risk):

1. **Phase A — compatibility view:** keep `sessions` as API-facing; add nullable `engagement_id` on `sessions` when engagement exists.
2. **Phase B — dual-write:** create `engagement` graph for new/edited sessions.
3. **Phase C — read path switch:** board reads engagements; legacy sessions still listed if unmigrated.
4. **Phase D — backfill** batch job converting historical rows.

**Group duplication cleanup:** merge duplicated rows into one engagement + participants.

## 8. RLS / permissions (sketch)

- Therapists: read engagements where `staff_assignment.user_id = auth.uid()` OR participant child in caseload.
- Reception/admin: center-scoped read/write as today.
- Parents: not on master board; optional future portal is separate.

## 9. What not to do

- Do not encode **supervision** only as free-text on a session.
- Do not represent **group** as N unrelated `sessions` long-term — reporting and attendance will diverge.
