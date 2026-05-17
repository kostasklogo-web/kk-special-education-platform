/**
 * Στατικά ενδεικτικά δεδομένα για το πρωτότυπο `/schedule/control-center`.
 * Αποκλειστικά client/server module· χωρίς Supabase· χωρίς αλλαγή σχήματος βάσης.
 */

import { athensStartOfDayUtcIso, getSafeAthensYmd } from "@/lib/schedule/athens-civil";
import { annotateConflicts } from "@/lib/schedule/control-center-model";
import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import type { SessionKind, SessionStatus } from "@/lib/data/sessions/types";

/** Σταθερή ημερομηνία αγκύρωσης ISO (Αθήνα) — όλα τα `starts_at`/`ends_at` ορίζονται γι' αυτή την ημέρα και μετατοπίζονται αριθμητικά για άλλες ημερομηνίες. */
export const CONTROL_CENTER_DEMO_ANCHOR_YMD = "2026-01-15" as const;

const YMD_SAFE = /^\d{4}-\d{2}-\d{2}$/;

/** Συμπαγές σετ θεραπευτών για πρωτότυπο (ΚΔ → ψυχολόγοι → λοιποί). */
export const CONTROL_CENTER_DEMO_THERAPISTS: { user_id: string; display_name: string }[] = [
  { user_id: "proto-th-01", display_name: "Δρ. Ανδρέου (ΚΔ)" },
  { user_id: "proto-th-03", display_name: "Γεωργίου Ε. (Ψυχ.)" },
  { user_id: "proto-th-07", display_name: "Ιωαννίδου Α. (Ψυχ.)" },
  { user_id: "proto-th-02", display_name: "Βασιλείου Ν. (Εργ.)" },
  { user_id: "proto-th-05", display_name: "Ζωγράφου Σ. (Λογ.)" },
  { user_id: "proto-th-08", display_name: "Κωνσταντίνου Λ. (Λογ.)" },
  { user_id: "proto-th-04", display_name: "Δημητρίου Κ. (Ειδ.)" },
  { user_id: "proto-th-10", display_name: "Μιχαηλίδου Χ. (Ειδ.)" },
];

/** Επιλογές παιδιού/ομάδας για φόρμα δημιουργίας (πρωτότυπο). */
export const CONTROL_CENTER_DEMO_CHILDREN: { id: string; label: string; kind: "child" | "group" }[] = [
  { id: "c1", label: "Παπαδόπουλος Ν.", kind: "child" },
  { id: "c2", label: "Οικονομίδου Ε.", kind: "child" },
  { id: "c3", label: "Τσίτσος Μ.", kind: "child" },
  { id: "c4", label: "Φωτίου Κ.", kind: "child" },
  { id: "c5", label: "Σταματίου Λ.", kind: "child" },
  { id: "g1", label: "Ομάδα «Άστρα»", kind: "group" },
  { id: "g2", label: "Ομάδα «Κύμα»", kind: "group" },
];

export const CONTROL_CENTER_DEMO_CENTERS = [
  { id: "proto-c-1", name: "Κέντρο Α · Εύοσμος" },
  { id: "proto-c-2", name: "Κέντρο Β · Νίκαια" },
] as const;

export const CONTROL_CENTER_DEMO_ROOMS = [
  { id: "proto-r-1", name: "Αίθ. Λογοθεραπείας 1", short_label: "Αίθ. 1", center_id: "proto-c-1" },
  { id: "proto-r-2", name: "Αίθ. Εργοθεραπείας 2", short_label: "Αίθ. 2", center_id: "proto-c-1" },
  { id: "proto-r-3", name: "Αίθ. Ψυχολογίας 3", short_label: "Αίθ. 3", center_id: "proto-c-1" },
  { id: "proto-r-4", name: "Αίθ. Ομαδικών Α", short_label: "Αίθ. 4", center_id: "proto-c-1" },
  { id: "proto-r-5", name: "Αίθ. Ομαδικών Β", short_label: "Αίθ. 5", center_id: "proto-c-2" },
] as const;

/** Υποσύνολο αιθουσών για πάνελ διαθεσιμότητας (λιγότερο DOM). */
export const CONTROL_CENTER_DEMO_ROOMS_PANEL = CONTROL_CENTER_DEMO_ROOMS;

export const CONTROL_CENTER_DEMO_DISCIPLINES = [
  { code: "slt", name_el: "Λογοθεραπεία" },
  { code: "ot", name_el: "Εργοθεραπεία" },
  { code: "psy", name_el: "Ψυχοθεραπεία" },
  { code: "sped", name_el: "Ειδική Διαπαιδαγώγηση" },
  { code: "oel", name_el: "Ομάδα Επιτελικών Λειτουργιών" },
  { code: "okd", name_el: "Ομάδα Κοινωνικών Δεξιοτήτων" },
  { code: "sup", name_el: "Εποπτεία" },
  { code: "par", name_el: "Συμβουλευτική Γονέων" },
  { code: "lead", name_el: "Κλινική διεύθυνση" },
  { code: "brk", name_el: "Διάλειμμα" },
] as const;

/** Κύρια ειδικότητα ανά θεραπευτή (πρωτότυπο). */
export const CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE: Record<string, string> = {
  "proto-th-01": "lead",
  "proto-th-03": "psy",
  "proto-th-07": "psy",
  "proto-th-02": "ot",
  "proto-th-05": "slt",
  "proto-th-08": "slt",
  "proto-th-04": "sped",
  "proto-th-10": "sped",
};

/** Στήλη 50′ (άκρη πίνακα): Κλινικός Διευθυντής + Ψυχολόγοι. */
export function isControlCenterSide50Therapist(userId: string): boolean {
  const p = CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[userId];
  return p === "lead" || p === "psy";
}

/** Θεραπευτές με ρυθμό 50′+10′ — χωρίς δομημένο διάλειμμα ομάδας 15′ στο πρωτότυπο. */
export const CONTROL_CENTER_SIDE50_THERAPIST_IDS: ReadonlySet<string> = new Set(
  CONTROL_CENTER_DEMO_THERAPISTS.filter((t) => isControlCenterSide50Therapist(t.user_id)).map((t) => t.user_id)
);

/** Σειρά στηλών: 0 = ΚΔ, 1 = ψυχολόγοι, 2 = λοιποί. */
export function controlCenterTherapistColumnTier(userId: string): 0 | 1 | 2 {
  const p = CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[userId];
  if (p === "lead") return 0;
  if (p === "psy") return 1;
  return 2;
}

/** Ετικέτες φίλτρου κατάστασης (τιμές API + ελληνικό κείμενο). */
export const CONTROL_CENTER_DEMO_STATUSES = [
  { value: "scheduled" as const, label_el: "Προγραμματισμένη" },
  { value: "completed" as const, label_el: "Ολοκληρωμένη" },
  { value: "cancelled" as const, label_el: "Ακυρωμένη" },
  { value: "no_show" as const, label_el: "Δεν προσήλθε" },
  { value: "absence" as const, label_el: "Απουσία" },
  { value: "to_reschedule" as const, label_el: "Προς επαναπρογραμματισμό" },
] as const;

const CHILD = [
  "Παπαδόπουλος Ν.",
  "Οικονομίδου Ε.",
  "Τσίτσος Μ.",
  "Φωτίου Κ.",
  "Σταματίου Λ.",
  "Καραγιάννης Π.",
  "Μελά Α.",
  "Βλασίδου Σ.",
  "Πέτρου Δ.",
  "Χατζής Θ.",
];

const GROUPS = [
  "Ομάδα «Άστρα»",
  "Ομάδα «Κύμα»",
  "Ομάδα «Φάρος»",
  "Ομάδα «Ρίζα»",
  "Ομάδα «Φτερό»",
];

function isoForAthensYmd(ymd: string, minuteFrom13: number, durationMin: number): { starts_at: string; ends_at: string } {
  const day0 = Date.parse(athensStartOfDayUtcIso(ymd));
  if (!Number.isFinite(day0)) {
    throw new Error(`schedule-control-center-data: invalid anchor ymd "${ymd}"`);
  }
  const startMs = day0 + (13 * 60 + Math.max(0, minuteFrom13)) * 60 * 1000;
  const endMs = startMs + Math.max(1, durationMin) * 60 * 1000;
  return { starts_at: new Date(startMs).toISOString(), ends_at: new Date(endMs).toISOString() };
}

function baseBlock(
  ymd: string,
  id: string,
  minuteFrom13: number,
  durationMin: number,
  therapistUserIds: string[],
  sessionKind: SessionKind,
  status: SessionStatus,
  disciplineCode: string,
  disciplineNameEl: string,
  title: string,
  subtitle: string,
  roomIdx: number,
  centerIdx: 0 | 1,
  childId: string | null,
  sessionGroupId?: string | null
): ControlBoardBlock {
  const room = CONTROL_CENTER_DEMO_ROOMS[roomIdx % CONTROL_CENTER_DEMO_ROOMS.length];
  const center = CONTROL_CENTER_DEMO_CENTERS[centerIdx];
  const { starts_at, ends_at } = isoForAthensYmd(ymd, minuteFrom13, durationMin);
  return {
    id,
    source: "demo",
    starts_at,
    ends_at,
    therapistUserIds,
    title,
    subtitle,
    roomLabel: room.name,
    centerLabel: center.name,
    centerId: center.id,
    roomId: room.id,
    disciplineCode,
    disciplineNameEl,
    sessionKind,
    status,
    childId,
    sessionGroupId: sessionGroupId ?? null,
  };
}

/** Δομημένα διαλείμματα 15′ (λεπτά από 13:00) μόνο για πλέγμα 45′· λήξη ημέρας 21:00 χωρίς επιπλέον διάλειμμα στο τέλος. */
const TEAM_BREAK_15_FROM_13: readonly [number, number][] = [[135, 150]];

const WINDOW_MIN = 480;

function overlapsTeamBreak(s: number, e: number): boolean {
  return TEAM_BREAK_15_FROM_13.some(([bs, be]) => s < be && e > bs);
}

function usable45SlotStarts(): number[] {
  const out: number[] = [];
  for (let m = 0; m + 45 <= WINDOW_MIN; m += 45) {
    if (!overlapsTeamBreak(m, m + 45)) out.push(m);
  }
  return out;
}

function buildControlCenterDemoBlocksForYmd(ymd: string): ControlBoardBlock[] {
  const out: ControlBoardBlock[] = [];
  let seq = 0;
  const nextId = () => `proto-cc-${String(++seq).padStart(4, "0")}`;

  const nameEl = (code: string) => CONTROL_CENTER_DEMO_DISCIPLINES.find((d) => d.code === code)?.name_el ?? code;

  const therapistIndex = (uid: string) => CONTROL_CENTER_DEMO_THERAPISTS.findIndex((t) => t.user_id === uid);

  /** Δομημένο διάλειμμα 15′ μόνο για θεραπευτές πλέγματος 45′ (ξεχωριστή αίθουσα· χωρίς 15′ στους ρυθμούς 50′). */
  for (const th of CONTROL_CENTER_DEMO_THERAPISTS) {
    if (isControlCenterSide50Therapist(th.user_id)) continue;
    const ti = therapistIndex(th.user_id);
    for (const [bs] of TEAM_BREAK_15_FROM_13) {
      out.push(
        baseBlock(
          ymd,
          nextId(),
          bs,
          15,
          [th.user_id],
          "individual",
          "scheduled",
          "brk",
          nameEl("brk"),
          "Διάλειμμα 15′",
          "Δομημένο · χωρίς ραντεβού",
          ti % CONTROL_CENTER_DEMO_ROOMS.length,
          (ti % 2) as 0 | 1,
          null,
          null
        )
      );
    }
  }

  /** Ομαδικά 90′ = ακριβώς δύο μονάδες 45′, ευθυγραμμισμένα στο πλέγμα. */
  const groupDefs: { m: number; therapistIds: string[]; room: number; gid: string; code: "okd" | "oel"; gidx: number }[] = [
    { m: 150, therapistIds: ["proto-th-08", "proto-th-05"], room: 3, gid: "proto-grp-001", code: "okd", gidx: 0 },
    { m: 300, therapistIds: ["proto-th-02", "proto-th-04", "proto-th-05"], room: 4, gid: "proto-grp-002", code: "oel", gidx: 1 },
  ];

  for (const g of groupDefs) {
    const dn = nameEl(g.code);
    const childLine = `${CHILD[g.gidx % CHILD.length]}, ${CHILD[(g.gidx + 2) % CHILD.length]}, ${CHILD[(g.gidx + 4) % CHILD.length]}`;
    out.push(
      baseBlock(
        ymd,
        nextId(),
        g.m,
        90,
        g.therapistIds,
        "group",
        "scheduled",
        g.code,
        dn,
        childLine,
        `${GROUPS[g.gidx]} · ${CONTROL_CENTER_DEMO_ROOMS[g.room].short_label}`,
        g.room,
        0,
        null,
        g.gid
      )
    );
  }

  const groupSpans: { s: number; e: number; therapistIds: string[] }[] = groupDefs.map((g) => ({
    s: g.m,
    e: g.m + 90,
    therapistIds: g.therapistIds,
  }));

  const overlapsSpan = (therapistId: string, s: number, e: number) =>
    groupSpans.some((sp) => sp.therapistIds.includes(therapistId) && s < sp.e && e > sp.s);

  /** Ζώνη 50′ + υποχρεωτικό 10′ μετά: Κλινικός Διευθυντής & Ψυχολόγοι. */
  const sideIds = CONTROL_CENTER_DEMO_THERAPISTS.filter((t) => isControlCenterSide50Therapist(t.user_id)).map((t) => t.user_id);

  for (const uid of sideIds) {
    const primary = CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[uid] ?? "psy";
    const isLead = primary === "lead";
    const dc = isLead ? "lead" : "psy";
    const ti = therapistIndex(uid);

    // Ακριβές 50′ + 10′ καθημερινό μοτίβο (8 κύκλοι):
    // 13:00–13:50, 13:50–14:00, 14:00–14:50, ..., 20:00–20:50, 20:50–21:00.
    // Η «προσαρμογή»/τοποθέτηση είναι μόνο για τη σταθερή επίδειξη (όχι για πραγματική βελτιστοποίηση).
    for (let cycle = 0; cycle < 8; cycle++) {
      const sessionStartM = cycle * 60;
      const breakStartM = sessionStartM + 50;

      const ch = CHILD[(ti * 7 + cycle) % CHILD.length];
      const childId = `proto-child-side-${uid}-${cycle}`;

      // Κατανομή αίθουσας ώστε να κρατάμε την εικόνα καθαρή.
      const roomIdx = (ti + cycle) % CONTROL_CENTER_DEMO_ROOMS.length;

      out.push(
        baseBlock(
          ymd,
          nextId(),
          sessionStartM,
          50,
          [uid],
          "individual",
          "scheduled",
          dc,
          nameEl(dc),
          ch,
          "",
          roomIdx,
          (ti % 2) as 0 | 1,
          childId,
          null
        )
      );

      out.push(
        baseBlock(
          ymd,
          nextId(),
          breakStartM,
          10,
          [uid],
          "individual",
          "scheduled",
          "brk",
          nameEl("brk"),
          "Μετά συνεδρία 50′ (ανάπαυση)",
          "",
          roomIdx,
          (ti % 2) as 0 | 1,
          null,
          null
        )
      );
    }
  }

  /** Κύριο πλέγμα 45′: λοιποί θεραπευτές. */
  const usable = usable45SlotStarts();
  const mainTherapists = CONTROL_CENTER_DEMO_THERAPISTS.filter((t) => !isControlCenterSide50Therapist(t.user_id));
  const slotRoomUsed = new Set<string>();

  for (const th of mainTherapists) {
    const ti = therapistIndex(th.user_id);
    const primary = CONTROL_CENTER_DEMO_THERAPIST_PRIMARY_CODE[th.user_id] ?? "slt";
    let slotPick = ti % Math.max(1, usable.length);
    let placed = 0;
    for (let k = 0; k < usable.length && placed < 4; k++) {
      const startM = usable[(slotPick + k) % usable.length];
      if (overlapsSpan(th.user_id, startM, startM + 45)) continue;
      if (overlapsTeamBreak(startM, startM + 45)) continue;

      const ch = CHILD[(ti + placed * 3) % CHILD.length];
      const childId = `proto-child-main-${th.user_id}-${placed}`;
      const roomIdx = (ti + placed * 2 + k) % 8;
      const roomId = CONTROL_CENTER_DEMO_ROOMS[roomIdx % CONTROL_CENTER_DEMO_ROOMS.length].id;
      const slotKey = `${startM}-${roomId}`;
      if (slotRoomUsed.has(slotKey)) continue;
      slotRoomUsed.add(slotKey);

      out.push(
        baseBlock(
          ymd,
          nextId(),
          startM,
          45,
          [th.user_id],
          "individual",
          placed % 8 === 0 ? "completed" : "scheduled",
          primary,
          nameEl(primary),
          ch,
          "",
          roomIdx,
          (ti % 2) as 0 | 1,
          childId,
          null
        )
      );
      placed += 1;
    }
  }

  return out;
}

/** Πλήρες στατικό πλέγμα για την ημερομηνία αγκύρωσης (μία φόρτωση module = σταθερό αποτέλεσμα). */
export const CONTROL_CENTER_DEMO_SESSION_BLOCKS: ControlBoardBlock[] = buildControlCenterDemoBlocksForYmd(CONTROL_CENTER_DEMO_ANCHOR_YMD);

/** Έναρξη δομημένου διαλείμματος 15′ (λεπτά από 13:00) — επίδειξη στον πίνακα (μόνο πλέγμα 45′). */
export const CONTROL_CENTER_DEMO_UI_PRESET_BREAK_MINUTES_FROM_13: readonly number[] = [135];

const conflictMapAnchor = annotateConflicts(CONTROL_CENTER_DEMO_SESSION_BLOCKS, CONTROL_CENTER_DEMO_ANCHOR_YMD, {
  exemptStructuredBreakTherapistIds: CONTROL_CENTER_SIDE50_THERAPIST_IDS,
});

/** Μπλοκ με τουλάχιστον μία ενδεικτική σύγκρουση (ίδια λογική με τον πίνακα). */
export const CONTROL_CENTER_DEMO_CONFLICTS: { block_id: string; reasons_el: string[] }[] = [...conflictMapAnchor.entries()]
  .filter(([, reasons]) => reasons.length > 0)
  .map(([block_id, reasons_el]) => ({ block_id, reasons_el: [...reasons_el] }));

const placementTotal = CONTROL_CENTER_DEMO_SESSION_BLOCKS.reduce((acc, b) => acc + (b.therapistUserIds?.length ?? 0), 0);
const conflictBlockCount = CONTROL_CENTER_DEMO_SESSION_BLOCKS.filter((b) => (conflictMapAnchor.get(b.id)?.length ?? 0) > 0).length;
const distinctRooms = new Set(CONTROL_CENTER_DEMO_SESSION_BLOCKS.map((b) => b.roomLabel ?? "—")).size;

/** Σύνοψη για την ημέρα αγκύρωσης (χωρίς φίλτρα UI). */
export const CONTROL_CENTER_DEMO_SUMMARY_METRICS = {
  anchor_ymd: CONTROL_CENTER_DEMO_ANCHOR_YMD,
  unique_block_count: CONTROL_CENTER_DEMO_SESSION_BLOCKS.length,
  total_placement_count: placementTotal,
  conflict_block_count: conflictBlockCount,
  distinct_room_count: distinctRooms,
} as const;

/**
 * Μετατοπίζει όλα τα μπλοκ από την ημέρα αγκύρωσης στην επιλεγμένη πολιτική ημέρα Αθήνας (ίδια σχετική διάταξη 13:00–21:00).
 */
export function shiftControlCenterDemoBlocksToYmd(ymd: string): ControlBoardBlock[] {
  const target = getSafeAthensYmd(ymd);
  if (target === CONTROL_CENTER_DEMO_ANCHOR_YMD) {
    return CONTROL_CENTER_DEMO_SESSION_BLOCKS;
  }
  const a0 = Date.parse(athensStartOfDayUtcIso(CONTROL_CENTER_DEMO_ANCHOR_YMD));
  const t0 = Date.parse(athensStartOfDayUtcIso(target));
  if (!Number.isFinite(a0) || !Number.isFinite(t0)) {
    return CONTROL_CENTER_DEMO_SESSION_BLOCKS;
  }
  const deltaMs = t0 - a0;
  return CONTROL_CENTER_DEMO_SESSION_BLOCKS.map((b) => ({
    ...b,
    starts_at: new Date(Date.parse(b.starts_at) + deltaMs).toISOString(),
    ends_at: new Date(Date.parse(b.ends_at) + deltaMs).toISOString(),
  }));
}

/** Ευρετήριο μπλοκ ανά θεραπευτή — μία φόρτωση ανά ημέρα, όχι φιλτράρισμα ανά στήλη. */
export function indexControlCenterBlocksByTherapist(blocks: ControlBoardBlock[]): Map<string, ControlBoardBlock[]> {
  const map = new Map<string, ControlBoardBlock[]>();
  for (const b of blocks) {
    for (const tid of b.therapistUserIds ?? []) {
      const arr = map.get(tid);
      if (arr) arr.push(b);
      else map.set(tid, [b]);
    }
  }
  return map;
}
