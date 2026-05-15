import {
  blockIntervalInWindowMs,
  CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13,
  type ControlBoardBlock,
} from "@/lib/schedule/control-center-model";
import { intervalOverlap } from "@/lib/schedule/control-center-window";

/** Συνολικό παράθυρο πίνακα (13:00–21:00 = 480′). */
export const CONTROL_CENTER_WINDOW_MINUTES = 480;
/** Κύριο πλέγμα: μόνο γραμμές 45′, όχι υποδιαιρέσεις 15′ στον πίνακα. */
export const CONTROL_CENTER_MAIN_GRID_UNIT_MINUTES = 45;
/** @deprecated Χρησιμοποιήστε `mainGridLineMinutesFrom13()` για γραμμές (τελευταία γραμμή στο 480′). */
export const CONTROL_CENTER_MAIN_GRID_STEPS = CONTROL_CENTER_WINDOW_MINUTES / CONTROL_CENTER_MAIN_GRID_UNIT_MINUTES;

/** Κάθετες γραμμές πλέγματος 45′ + λήξη παραθύρου (480′). */
export function mainGridLineMinutesFrom13(): number[] {
  const lines: number[] = [];
  for (let m = 0; m < CONTROL_CENTER_WINDOW_MINUTES; m += CONTROL_CENTER_MAIN_GRID_UNIT_MINUTES) {
    lines.push(m);
  }
  if (lines[lines.length - 1] !== CONTROL_CENTER_WINDOW_MINUTES) {
    lines.push(CONTROL_CENTER_WINDOW_MINUTES);
  }
  return lines;
}

export type TimelineSlot45 = { startMin: number; endMin: number };

/** Χρονοθυρίδες 45′ από 13:00 (13:00–13:45, 13:45–14:30, …). */
export function timelineSlots45From13(): TimelineSlot45[] {
  const out: TimelineSlot45[] = [];
  for (let m = 0; m < CONTROL_CENTER_WINDOW_MINUTES; m += CONTROL_CENTER_MAIN_GRID_UNIT_MINUTES) {
    const endMin = Math.min(m + CONTROL_CENTER_MAIN_GRID_UNIT_MINUTES, CONTROL_CENTER_WINDOW_MINUTES);
    out.push({ startMin: m, endMin });
    if (endMin >= CONTROL_CENTER_WINDOW_MINUTES) break;
  }
  return out;
}

export type TimelineSlot50 = { startMin: number; endMin: number; kind: "session" | "break" };

/** Χρονοθυρίδες 50′+10′ από 13:00 (8 κύκλοι έως 21:00). */
export function timelineSlots50From13(): TimelineSlot50[] {
  const out: TimelineSlot50[] = [];
  for (let cycle = 0; cycle < 8; cycle++) {
    const base = cycle * 60;
    out.push({ startMin: base, endMin: base + 50, kind: "session" });
    out.push({ startMin: base + 50, endMin: base + 60, kind: "break" });
  }
  return out;
}

/** Γραμμές πλέγματος για στήλες 50′ (όρια συνεδρίας / διαλείμματος). */
export function side50GridLineMinutesFrom13(): number[] {
  const lines = new Set<number>([0, CONTROL_CENTER_WINDOW_MINUTES]);
  for (let cycle = 0; cycle < 8; cycle++) {
    const base = cycle * 60;
    lines.add(base);
    lines.add(base + 50);
    lines.add(base + 60);
  }
  return [...lines].sort((a, b) => a - b);
}

/** @deprecated Χρησιμοποιείται μόνο για εσωτερικούς υπολογισμούς (π.χ. παλιά helpers)· ο πίνακας είναι 45′. */
export const CONTROL_CENTER_SLOT_MINUTES = 15;
export const CONTROL_CENTER_SLOT_COUNT = CONTROL_CENTER_WINDOW_MINUTES / CONTROL_CENTER_SLOT_MINUTES;

export type WindowMs = { startMs: number; endMs: number; durationMs: number };

export type BlockWithInterval = { b: ControlBoardBlock; iv: { startMs: number; endMs: number } };

export type LaidOutBlock = BlockWithInterval & {
  lane: number;
  laneCount: number;
};

/** Λεπτά από έναρξη παραθύρου 13:00 (0…480). */
export function minutesFromWindowStart(iv: { startMs: number; endMs: number }, win: WindowMs): { start: number; end: number } {
  return {
    start: Math.max(0, (iv.startMs - win.startMs) / 60_000),
    end: Math.min(CONTROL_CENTER_WINDOW_MINUTES, (iv.endMs - win.startMs) / 60_000),
  };
}

export function blockDurationMinutes(b: ControlBoardBlock): number {
  const a = Date.parse(b.starts_at);
  const z = Date.parse(b.ends_at);
  if (!Number.isFinite(a) || !Number.isFinite(z) || z <= a) return 0;
  return (z - a) / 60_000;
}

/**
 * Ανάθεση λωρίδων: επικαλυπτόμενα μπλοκ σε παράλληλες «λωρίδες»
 * ώστε να μην καλύπτουν οπτικά το ένα το άλλο.
 */
export function assignLanes(blocks: BlockWithInterval[]): LaidOutBlock[] {
  if (blocks.length === 0) return [];
  /** Non-break blocks claim lanes first so breaks sit beside (not under) overlapping sessions. */
  const sorted = [...blocks].sort((a, b) => {
    const t = a.iv.startMs - b.iv.startMs || a.iv.endMs - b.iv.endMs;
    if (t !== 0) return t;
    const aBrk = a.b.disciplineCode === "brk" ? 1 : 0;
    const bBrk = b.b.disciplineCode === "brk" ? 1 : 0;
    return aBrk - bBrk;
  });
  const laneEndTimes: number[] = [];
  const withLane: (BlockWithInterval & { lane: number })[] = [];

  for (const row of sorted) {
    let lane = 0;
    while (lane < laneEndTimes.length && laneEndTimes[lane] > row.iv.startMs) {
      lane++;
    }
    if (lane === laneEndTimes.length) laneEndTimes.push(row.iv.endMs);
    else laneEndTimes[lane] = row.iv.endMs;
    withLane.push({ ...row, lane });
  }

  return withLane.map((x) => {
    const overlapping = withLane.filter((y) => intervalOverlap(x.iv, y.iv));
    const laneCount = Math.max(1, ...overlapping.map((y) => y.lane + 1));
    return { ...x, laneCount };
  });
}

/** Εμφάνιση ώρας (HH:MM) στο Europe/Athens. */
export function formatAthensHmFromUtcMs(ms: number): string {
  return new Intl.DateTimeFormat("el-GR", {
    timeZone: "Europe/Athens",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(ms));
}

export type BusyInterval = { startMs: number; endMs: number };

export function mergeBusyIntervals(raw: BusyInterval[]): BusyInterval[] {
  if (raw.length === 0) return [];
  const s = [...raw].sort((a, b) => a.startMs - b.startMs);
  const out: BusyInterval[] = [];
  let cur = { ...s[0] };
  for (let i = 1; i < s.length; i++) {
    const n = s[i];
    if (n.startMs <= cur.endMs) cur.endMs = Math.max(cur.endMs, n.endMs);
    else {
      out.push(cur);
      cur = { ...n };
    }
  }
  out.push(cur);
  return out;
}

export function computeFreeGapsWithinWindow(
  win: WindowMs,
  busy: BusyInterval[],
  minGapMinutes: number
): { startMs: number; endMs: number; minutes: number }[] {
  const merged = mergeBusyIntervals(busy);
  const gaps: { startMs: number; endMs: number; minutes: number }[] = [];
  let t = win.startMs;
  for (const b of merged) {
    if (b.startMs > t) {
      const minutes = (b.startMs - t) / 60_000;
      if (minutes >= minGapMinutes) gaps.push({ startMs: t, endMs: b.startMs, minutes });
    }
    t = Math.max(t, b.endMs);
  }
  if (win.endMs > t) {
    const minutes = (win.endMs - t) / 60_000;
    if (minutes >= minGapMinutes) gaps.push({ startMs: t, endMs: win.endMs, minutes });
  }
  return gaps;
}

export function therapistBusyIntervals(
  therapistUserId: string,
  blocks: ControlBoardBlock[],
  dateYmd: string,
  treatBreaksAsFree: boolean
): BusyInterval[] {
  const raw: BusyInterval[] = [];
  for (const b of blocks) {
    if (!(b.therapistUserIds ?? []).includes(therapistUserId)) continue;
    if (treatBreaksAsFree && b.disciplineCode === "brk") continue;
    const iv = blockIntervalInWindowMs(b, dateYmd);
    if (!iv) continue;
    raw.push({ startMs: iv.startMs, endMs: iv.endMs });
  }
  return raw;
}

export function roomBusyIntervals(roomId: string, blocks: ControlBoardBlock[], dateYmd: string): BusyInterval[] {
  const raw: BusyInterval[] = [];
  for (const b of blocks) {
    if (b.roomId !== roomId) continue;
    const iv = blockIntervalInWindowMs(b, dateYmd);
    if (!iv) continue;
    raw.push({ startMs: iv.startMs, endMs: iv.endMs });
  }
  return raw;
}

export function formatFreeWindowsEl(gaps: { startMs: number; endMs: number }[], maxParts = 4): string {
  if (gaps.length === 0) return "—";
  const parts = gaps.slice(0, maxParts).map((g) => `${formatAthensHmFromUtcMs(g.startMs)}–${formatAthensHmFromUtcMs(g.endMs)}`);
  const extra = gaps.length > maxParts ? ` (+${gaps.length - maxParts})` : "";
  return parts.join(", ") + extra;
}

export type SuggestedSlotEl = {
  dateYmd: string;
  therapistUserId: string;
  therapistName: string;
  specialtyCode: string;
  specialtyNameEl: string;
  roomShort: string;
  roomAvailabilityEl: string;
  startMs: number;
  endMs: number;
  durationMin: number;
  /** Σύντομη ένδειξη για γραμματεία (αξιολόγηση vs σταθερό πρόγραμμα). */
  suitabilityEl: string;
  label: string;
};

/** Κείμενο καταλληλότητας πρότασης για γραμματεία (πρωτότυπο). */
export function controlCenterSlotSuitabilityEl(durationMin: number, specialtyCode: string): string {
  if (durationMin === 90) return "Σταθερό ομαδικό πρόγραμμα";
  if (durationMin === 50 && (specialtyCode === "psy" || specialtyCode === "lead"))
    return "Κατάλληλο για αξιολόγηση / ειδική συνεδρία (50′)";
  if (durationMin === 45 && (specialtyCode === "psy" || specialtyCode === "lead"))
    return "Σταθερό ατομικό ή υποστηρικτική συνεδρία";
  if (durationMin === 45) return "Σταθερό ατομικό πρόγραμμα (45′)";
  return "Πρόταση χρονοθυρίδας";
}

export function computeSuggestedSlots(params: {
  blocks: ControlBoardBlock[];
  dateYmd: string;
  win: WindowMs;
  durationMin: 45 | 50 | 90;
  therapistIdsAllow: string[] | null;
  disciplineTherapistIds: string[] | null;
  rooms: { id: string; short_label: string }[];
  therapistNames: Record<string, string>;
  therapistPrimarySpecialtyCode: Record<string, string>;
  specialtyNameElByCode: Record<string, string>;
  maxResults?: number;
}): SuggestedSlotEl[] {
  const {
    blocks,
    dateYmd,
    win,
    durationMin,
    therapistIdsAllow,
    disciplineTherapistIds,
    rooms,
    therapistNames,
    therapistPrimarySpecialtyCode,
    specialtyNameElByCode,
    maxResults = 12,
  } = params;
  const needMs = durationMin * 60_000;
  const allT = Object.keys(therapistNames);
  const candidates = allT.filter((id) => {
    if (therapistIdsAllow && therapistIdsAllow.length > 0 && !therapistIdsAllow.includes(id)) return false;
    if (disciplineTherapistIds && disciplineTherapistIds.length > 0 && !disciplineTherapistIds.includes(id)) return false;
    return true;
  });

  const suggestions: SuggestedSlotEl[] = [];

  for (const tid of candidates) {
    /** Τα διαλείμματα και τα προστατευμένα κενά μετρούν ως δεσμευμένα — όχι ως διαθέσιμα ραντεβού. */
    const busy = therapistBusyIntervals(tid, blocks, dateYmd, false);
    const gaps = computeFreeGapsWithinWindow(win, busy, durationMin);
    const primaryCode = therapistPrimarySpecialtyCode[tid] ?? "";
    const specialtyNameEl = specialtyNameElByCode[primaryCode] ?? primaryCode;
    const suitabilityEl = controlCenterSlotSuitabilityEl(durationMin, primaryCode);
    for (const g of gaps) {
      if (g.endMs - g.startMs < needMs) continue;
      const slotEnd = g.startMs + needMs;
      for (const room of rooms) {
        const rBusy = roomBusyIntervals(room.id, blocks, dateYmd);
        const clash = rBusy.some((rb) => intervalOverlap({ startMs: g.startMs, endMs: slotEnd }, rb));
        if (clash) continue;
        const hm = `${formatAthensHmFromUtcMs(g.startMs)}–${formatAthensHmFromUtcMs(slotEnd)}`;
        suggestions.push({
          dateYmd,
          therapistUserId: tid,
          therapistName: therapistNames[tid] ?? tid,
          specialtyCode: primaryCode,
          specialtyNameEl,
          roomShort: room.short_label,
          roomAvailabilityEl: `${room.short_label} · ελεύθερη`,
          startMs: g.startMs,
          endMs: slotEnd,
          durationMin,
          suitabilityEl,
          label: `${therapistNames[tid] ?? tid} · ${specialtyNameEl} · ${hm} · ${room.short_label}`,
        });
        break;
      }
    }
  }

  return suggestions.sort((a, b) => a.startMs - b.startMs || a.therapistName.localeCompare(b.therapistName, "el")).slice(0, maxResults);
}

/** Έναρξη δομημένου διαλείμματος 15′ (λεπτά από 13:00) για πλέγμα 45′ — λήξη ημέρας 21:00 χωρίς επιπλέον διάλειμμα στο τέλος. */
export const CONTROL_CENTER_STRUCTURED_BREAK_STARTS_FROM_13: readonly number[] =
  CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13.map(([s]) => s);

export function structuredBreakMinuteIntervalsFrom13(): ReadonlyArray<{ start: number; end: number }> {
  return CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13.map(([start, end]) => ({ start, end }));
}

export function intervalOverlapsStructuredBreak(startMinFrom13: number, endMinFrom13: number): boolean {
  return structuredBreakMinuteIntervalsFrom13().some((b) => startMinFrom13 < b.end && endMinFrom13 > b.start);
}
