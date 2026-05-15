# Scheduling — performance considerations

Targets: **13:00–21:00** dense grids, **~90–100 educational hours/day** aggregated across the organization, **multi-center**, **multidisciplinary** filtering. UI must stay interactive on mid-tier laptops and tablets used at reception.

## 1. Load model (what “90–100 hours/day” implies)

Not necessarily 90–100 *rows*; often **fewer engagements** with **high concurrency** (parallel rooms/staff). Still assume:

- **500–2000 rendered intervals/day** at peak org size (worst case), with **compact** mode showing **subset** (viewport) only.

Design principle: **never fetch “full org year” into the client.”**

## 2. Server-side query strategy

### 2.1 Bounding box queries

All board APIs take:

- `from`, `to` (ISO instant, narrow — typically **one day** or **one week**)
- `center_ids[]`
- optional `room_ids[]`, `therapist_ids[]`, `child_id`

Return **normalized bundles**:

- `engagements[]` (core intervals + family + status)
- `staff_assignments[]` (engagement_id FK)
- `resource_bookings[]` (engagement_id FK)
- `participants_summary[]` (counts + primary labels to avoid huge joins on first paint)
- `conflicts[]` (optional second endpoint if heavy)

### 2.2 Pagination vs single response

- **Day board:** single response acceptable if payload capped (e.g. **< 300KB gzip** budget).
- **Week board:** paginate by **center** or stream with **HTTP/2** multiplexing.

### 2.3 Read replicas / caching

- **CDN not applicable** for personalized boards.
- Use **short TTL cache** (5–30s) for expensive aggregate queries (occupancy heatmap) keyed by `(org, day, centers)`.
- Consider **materialized occupancy** per `(room_id, date)` updated on write (trade write cost for read speed).

## 3. Client-side rendering strategy

### 3.1 Virtualization

Mandatory for:

- **Vertical time** (many small rows in compact mode)
- **Horizontal columns** (many rooms across centers)

Use windowed rendering with **overscan** proportional to scroll velocity.

### 3.2 Layered canvas vs DOM

| Approach | Pros | Cons |
|----------|------|------|
| **DOM blocks** | Accessibility, hit targets | Heavy at extreme density |
| **Canvas/WebGL** | Fast paint | A11y harder |
| **Hybrid** | DOM for interactive window, canvas for background heat | More engineering |

Recommendation: **DOM-first hybrid** — DOM for engagements in viewport + canvas/SVG for heatmap underlay.

### 3.3 Memoization and stable keys

- Stable `engagement_id` keys; avoid re-layout thrash on clock ticks (update **now-line** via CSS transform / single SVG line).

## 4. Drag/drop and mutation performance

- **Debounce** rapid reschedule streams (network coalescing).
- **Optimistic UI** with **version** or `updated_at` conflict detection (409 → refresh slice).
- Server validates in **< 200ms p95** for single move; batch moves may take longer — show progress.

## 5. Conflict detection performance

### 5.1 Tiered detection

| Tier | When | Cost |
|------|------|------|
| **T0 inline** | On drag preview | O(k) local check using loaded slice |
| **T1 server fast** | On commit | indexed overlap queries limited to affected users/rooms/children |
| **T2 global audit** | nightly / on-demand | full scan |

### 5.2 Incremental indexing

Maintain per-user and per-room **interval trees** or sorted interval lists for the active day in memory on the app server for hot paths (advanced; start with SQL overlap).

## 6. Database query patterns (PostgreSQL-oriented)

Overlap pattern (staff example):

```sql
-- conceptual: find overlaps for same user_id between t0 and t1
WHERE assignment.user_id = $user
  AND assignment.starts_at < $t1
  AND assignment.ends_at > $t0
```

Ensure **range types** or ** btree on (user_id, starts_at)** + filter on end.

Avoid `OR` across large tables without partial indexes.

## 7. Real-time / multi-user editing

Reception may have **two users** editing concurrently.

Options:

- **Supabase Realtime** on `engagement` / `staff_assignment` channels scoped by `center_id + date`.
- **Operational transform** not required initially; **last-write-wins** with explicit conflict banner is acceptable MVP if versions enforced.

Minimum: **subscribe to “schedule_version bumped”** events to trigger soft refresh of slice.

## 8. Observability

Instrument:

- p95 **board payload build**
- p95 **conflict check**
- client **FPS** during scroll (RUM)
- error rate on **optimistic rollback**

## 9. Performance anti-patterns to avoid

- Loading full participant lists for every engagement on first paint.
- N+1 queries per block in admin view.
- Recomputing full-day conflicts client-side from unbounded data.
- Storing huge JSON blobs that must be parsed for every list query.

## 10. Capacity planning numbers (planning assumptions)

Design for:

- **Up to 30–60 rooms** across centers visible with horizontal scroll (virtualized columns).
- **Up to 200 staff** in org; typical day query touches **10–40** on a filtered board.
- **Default API** returns **summary labels**; **inspector** loads details on demand.
