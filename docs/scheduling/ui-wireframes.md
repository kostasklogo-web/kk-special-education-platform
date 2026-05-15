# Scheduling UI — wireframe descriptions (textual)

Wireframes are **descriptive** (no Figma in repo). Greek labels noted where they map to product copy.

---

## WF-0: Global shell (all schedule views)

**Chrome**

- **Top:** org logo, user menu, role badge, “Τώρα” clock (Europe/Athens).
- **Left sidebar:** unchanged global nav; **Schedule** expands sub-views (Master, Therapist, Rooms, Child, Supervisor).
- **Content:** page title + view tabs + filter strip + main canvas + optional right rail.

**Persistent footer (optional on board):** legend for colors + conflict iconography + density toggle.

---

## WF-1: Master Operation Board (reception/admin)

**Layout:** 3-column desktop; 2-column tablet; stacked mobile.

### Column A (240px, collapsible): Presets & centers

- Checklist: **Κέντρα** (multi-select, search).
- **Αποθηκευμένα φίλτρα** (list + pin icon).
- **Στατιστικά ημέρας** mini-cards: “Συνολικές ώρες”, “Ενεργά δωμάτια”, “Ανοιχτά θέματα”.

### Column B (fluid): Main board canvas

**Header row (sticky within canvas):**

- Date picker (week arrows), **“Σήμερα”**.
- **Ώρες:** segmented 13:00–21:00 (expand icon).
- **Πυκνότητα:** Compact / Standard / Comfort.
- **Zoom:** 5′ / 10′ / 15′ / 30′.
- **Toggle:** Δωμάτια | Θεραπευτές (swimlane overlay).
- **Φίλτρα:** discipline chips, session family chips, “Μόνο προβλήματα”.

**Grid body:**

- **Y-axis:** time ticks every zoom step; **now line** in clinical red (distinct from conflict red — use thickness + label “Τώρα”).
- **X-axis:** grouped columns:
  - Group header: **Κέντρο Α**
  - Subcolumns: **Αίθ. 1**, **Αίθ. 2**, … **Χωρίς αίθουσα**
  - Repeat for **Κέντρο Β** …
- **Blocks:** rounded rectangles; **stack** with +N chip when >3 concurrent in same column (if policy allows parallel use of room stations—otherwise conflicts dominate).

**Hover state:**

- Tooltip: time range, title, participants summary, staff roles summary, attendance state.

**Click state:**

- Opens **Inspector Drawer** (40% width) from right **without** hiding grid (push layout on large screens; overlay on small).

### Column C (320px): Intelligence rail

Sections (tabs or accordion):

1. **Τρέχον & επόμενο** (queue list).
2. **Συγκρούσεις** (ranked cards).
3. **Παρουσίες σε εκκρεμότητα** (deep links).
4. **Κενά / ρήξεις** (suggested slots).

**Empty states:** each section has Greek empty copy + CTA (“Προσθήκη συνεδρίας”).

---

## WF-2: Therapist view

**Default:** single column timeline **“Οι συνεδρίες μου”** for selected day.

**Main:**

- Vertical timeline 13:00–21:00.
- Blocks color by **discipline stripe** + family fill.
- Row tracks:
  - **Track 1:** direct delivery.
  - **Track 2 (toggle):** supervision / meetings (lighter chrome).

**Header actions:**

- Toggle “Εμφάνιση ομάδων” (show cohort label on block).
- “Άνοιγμα πίνακα αιθουσών” shortcut.

**Mobile:**

- Agenda list with sticky **Επόμενη** card at top.

---

## WF-3: Room view

**Similar grid to Master**, but **X-axis = only rooms** (no therapist lanes).

**Column header enrichment:**

- Small bar meter: **πληρότητα** for selected window.
- **Icon** for turnover risk.

**Interactions:**

- Drag block horizontally between rooms (same center by default).
- Click block → inspector emphasizes **resource_booking** section.

---

## WF-4: Child view

**Week strip (desktop):** 7 columns (Δε–Κυ), each column is mini day timeline.

**Alternative toggle:** **Μία ημέρα** detailed (larger blocks).

**Block content priority:**

1. Time range
2. Discipline
3. Room
4. Therapists (roles abbreviated: Υπεύθ. / Συν.)

**Footer:** link “Πλήρες προφίλ παιδιού”.

---

## WF-5: Supervisor view

**Default columns:** supervisees (therapists) as **swimlanes**.

**Rows:** time.

**Blocks:**

- Supervision engagements solid.
- Optional ghost blocks showing supervisee’s load (toggle “Επικάλυψη φόρτου”).

**Right rail:** “Ρίσκο εποπτείας” — stacked supervisions, missing notes, chronic overruns.

---

## WF-6: Inspector drawer (shared)

**Tabs:**

1. **Γενικά** (title, family, status, center, recurrence).
2. **Συμμετέχοντες** (children/parents/cohort).
3. **Προσωπικό** (staff roles, times if partial).
4. **Χώροι** (room bookings, capacity).
5. **Παρουσίες** (quick actions + table).
6. **Έγγραφα** (notes, progress report links — future integration).

**Footer actions:** Αποθήκευση, Ακύρωση, Διαγραφή (gated), **Δημιουργία συνδεδεμένης** (e.g. supervision from delivery).

---

## WF-7: Create / edit engagement (wizard modal)

**Step 1:** Τύπος (educational / group / supervision / parent / report meeting).  
**Step 2:** Συμμετέχοντες (search children, add cohort, add parents).  
**Step 3:** Προσωπικό + ρόλοι.  
**Step 4:** Χρόνος + διάρκεια (presets 25′, 40′, 45′, 50′, 60′ + custom).  
**Step 5:** Χώρος (suggested rooms ranked by availability).  
**Step 6:** Επισκόπηση + **προειδοποιήσεις/συγκρούσεις** before publish.

---

## WF-8: Drag/drop microcopy & feedback

- Cursor states: grab / not-allowed.
- Toast patterns:
  - **Επιτυχία:** “Η μετακίνηση αποθηκεύτηκε.”
  - **Σφάλμα:** “Αδύνατη μετακίνηση — διπλή κράτηση θεραπευτή.” + **Εμφάνιση λεπτομερειών**.

---

## WF-9: Conflict resolution mode

Full-width list + mini map:

- Left: sortable conflict list.
- Right: zoomed mini-board focusing implicated resources with highlights.

**CTA per row:** “Πρόταση διόρθωσης” (opens wizard on suggested change).

---

## WF-10: Print / handoff (optional later)

- Reception printable **room sheet** for a time window (A4 landscape): columns rooms, rows time, handwritten margin.

(Out of MVP but informs grid density choices.)
