# Scheduling architecture — operational control center

This package **redesigns** scheduling as an **operational scheduling control center** for a **multidisciplinary special education** organization. It is **design-only** (no implementation in this step).

## Why the current model is insufficient (baseline)

The current domain model centers on a **single `sessions` row** with one `child_id`, one `therapist_user_id`, optional `room_id`, and a small `session_kind` enum. That supports a **simple calendar** but not:

- **High density** (many parallel engagements in the same window)
- **True overlaps** (multiple simultaneous roles/resources for one logical event)
- **Group programs** as first-class cohorts (not “many duplicated one-child sessions”)
- **Multi-therapist** delivery and **supervision** as structured participation
- **Operational visibility** (room occupancy, conflicts, breaks) at reception scale

## Documents in this package

| Document | Contents |
|----------|----------|
| [`ux-architecture.md`](./ux-architecture.md) | Master Operation Board, five role views, color system, hierarchy, occupancy, conflicts, breaks, attendance quick actions, drag/drop and filtering strategies, 13:00–21:00 + multi-center workflow optimization |
| [`database-considerations.md`](./database-considerations.md) | Normalized entities, overlap semantics, group programs, staffing roles, meetings, durations, multi-center, migration path from current `sessions` |
| [`performance-considerations.md`](./performance-considerations.md) | 90–100 educational hours/day, indexing, caching, query patterns, real-time, client virtualization |
| [`ui-wireframes.md`](./ui-wireframes.md) | Textual wireframes per view (panels, rails, density modes) |

## Master Operation Board (definition)

The **Master Operation Board** is the **reception/admin** primary surface for **one organization across one or more centers**, answering in one screen:

- **What is happening now and next** (time-now line, density-safe rendering)
- **Where** (rooms, centers, virtual/hybrid lanes)
- **Who** (children, groups, therapists, supervisors, parents)
- **Health of the plan** (conflicts, overload, missing attendance, breaks)
- **What to do next** (quick actions, drill-down)

It is not “a bigger calendar.” It is an **operations console**: schedule + capacity + risk + execution (attendance) tied together.

## Guiding principles

1. **Separate “planned work” from “resources.”** One logical session can **book** multiple staff and rooms across overlapping intervals.
2. **Treat groups and supervision as participants + roles**, not as ad-hoc notes.
3. **Make conflicts explicit objects** (queryable, explainable, actionable).
4. **Optimize for dense evening blocks** (13:00–21:00) with **zoom**, **stacking**, and **performance budgets**.
5. **Preserve MVP discipline:** ship incrementally, but **schema and APIs** must not paint the product into a corner.

## Greek UI note (product)

End-user copy remains **Greek**; these engineering documents are **English** for precision. UI labels should map cleanly (e.g. *Master Operation Board* → *Κεντρικός πίνακας λειτουργίας*).
