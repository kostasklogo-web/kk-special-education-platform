import type { SessionListItem } from "@/lib/data/sessions/types";
import { athensOperationalWindowMs, clampIntervalToWindow, intervalOverlap } from "@/lib/schedule/control-center-window";
export type ControlBlockSource = "database" | "demo";

export type ControlBoardBlock = {
  id: string;
  source: ControlBlockSource;
  starts_at: string;
  ends_at: string;
  therapistUserIds: string[];
  title: string;
  subtitle: string;
  roomLabel: string | null;
  centerLabel: string | null;
  centerId?: string | null;
  roomId?: string | null;
  disciplineCode: string;
  disciplineNameEl: string | null;
  sessionKind: SessionListItem["session_kind"];
  status: SessionListItem["status"];
  childId?: string | null;
  /** Πρωτότυπο: ίδιο id για συνδεδεμένα μπλοκ πολυθεραπευτικής συνεδρίας. */
  sessionGroupId?: string | null;
};

export type TherapistColumn = {
  userId: string;
  displayName: string;
  isDemo: boolean;
};

export function sessionToBoardBlock(s: SessionListItem): ControlBoardBlock {
  return {
    id: s.id,
    source: "database",
    starts_at: s.starts_at,
    ends_at: s.ends_at,
    therapistUserIds: [s.therapist_user_id],
    title:
      s.session_kind === "group"
        ? `Ομαδικό · ${s.discipline_name_el ?? s.discipline_code}`
        : `Ατομικό · ${s.discipline_name_el ?? s.discipline_code}`,
    subtitle: s.child_name,
    roomLabel: s.room_name,
    centerLabel: s.center_name,
    centerId: s.center_id,
    roomId: s.room_id,
    disciplineCode: s.discipline_code,
    disciplineNameEl: s.discipline_name_el,
    sessionKind: s.session_kind,
    status: s.status,
    childId: s.child_id,
    sessionGroupId: null,
  };
}

export function blockIntervalInWindowMs(
  b: ControlBoardBlock,
  ymd: string
): { startMs: number; endMs: number } | null {
  const win = athensOperationalWindowMs(ymd);
  const startMs = Date.parse(b.starts_at);
  const endMs = Date.parse(b.ends_at);
  return clampIntervalToWindow(startMs, endMs, win);
}

/** Which therapist columns should show this block (multi-therapist = duplicate placement). */
export function therapistIdsForColumns(b: ControlBoardBlock): string[] {
  return b.therapistUserIds ?? [];
}

export function buildTherapistColumns(
  blocks: ControlBoardBlock[],
  orgTherapists: { user_id: string; display_name: string | null }[]
): TherapistColumn[] {
  const ids = new Set<string>();
  for (const b of blocks) {
    for (const id of b.therapistUserIds ?? []) ids.add(id);
  }
  const orgMap = new Map(orgTherapists.map((t) => [t.user_id, t.display_name ?? "—"]));
  const list: TherapistColumn[] = [];
  for (const id of ids) {
    list.push({
      userId: id,
      displayName: orgMap.get(id) ?? "Θεραπευτής",
      isDemo: id.startsWith("proto-") || id.startsWith("__demo"),
    });
  }
  list.sort((a, b) => a.displayName.localeCompare(b.displayName, "el"));
  return list;
}

/** Δομημένα διαλείμματα ομάδας 15′ (λεπτά από 13:00) — μόνο για πλέγμα 45′ στο πρωτότυπο. */
export const CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13: ReadonlyArray<readonly [number, number]> = [[135, 150]];

export type AnnotateConflictsOptions = {
  /** Θεραπευτές που δεν δεσμεύονται από τα δομημένα διαλείμματα 15′ (πρόγραμμα 50′). */
  exemptStructuredBreakTherapistIds?: ReadonlySet<string>;
};

export function annotateConflicts(
  blocks: ControlBoardBlock[],
  ymd: string,
  options?: AnnotateConflictsOptions
): Map<string, string[]> {
  const reasons = new Map<string, string[]>();
  const exemptStructured = options?.exemptStructuredBreakTherapistIds;
  const win = athensOperationalWindowMs(ymd);
  const add = (id: string, r: string) => {
    const arr = reasons.get(id) ?? [];
    arr.push(r);
    reasons.set(id, arr);
  };

  const intervals = blocks
    .map((b) => {
      const iv = blockIntervalInWindowMs(b, ymd);
      return iv ? { b, iv } : null;
    })
    .filter(Boolean) as { b: ControlBoardBlock; iv: { startMs: number; endMs: number } }[];

  const byTherapist = new Map<string, { b: ControlBoardBlock; iv: { startMs: number; endMs: number } }[]>();
  for (const row of intervals) {
    for (const tid of row.b.therapistUserIds ?? []) {
      const arr = byTherapist.get(tid) ?? [];
      arr.push(row);
      byTherapist.set(tid, arr);
    }
  }
  for (const [, rows] of byTherapist) {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (intervalOverlap(rows[i].iv, rows[j].iv)) {
          add(rows[i].b.id, "Επικάλυψη θεραπευτή");
          add(rows[j].b.id, "Επικάλυψη θεραπευτή");
        }
      }
    }
  }

  const byChild = new Map<string, { b: ControlBoardBlock; iv: { startMs: number; endMs: number } }[]>();
  for (const row of intervals) {
    const cid = row.b.childId;
    if (!cid) continue;
    const arr = byChild.get(cid) ?? [];
    arr.push(row);
    byChild.set(cid, arr);
  }
  for (const [, rows] of byChild) {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].b.id === rows[j].b.id) continue;
        if (intervalOverlap(rows[i].iv, rows[j].iv)) {
          add(rows[i].b.id, "Διπλή κράτηση παιδιού");
          add(rows[j].b.id, "Διπλή κράτηση παιδιού");
        }
      }
    }
  }

  const byRoom = new Map<string, { b: ControlBoardBlock; iv: { startMs: number; endMs: number } }[]>();
  for (const row of intervals) {
    const rid = row.b.roomId;
    if (!rid) continue;
    const arr = byRoom.get(rid) ?? [];
    arr.push(row);
    byRoom.set(rid, arr);
  }
  for (const [, rows] of byRoom) {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        if (rows[i].b.id === rows[j].b.id) continue;
        if (intervalOverlap(rows[i].iv, rows[j].iv)) {
          const brk = rows[i].b.disciplineCode === "brk" || rows[j].b.disciplineCode === "brk";
          add(rows[i].b.id, brk ? "Επικάλυψη αίθουσας με διάλειμμα" : "Διπλή κράτηση αίθουσας");
          add(rows[j].b.id, brk ? "Επικάλυψη αίθουσας με διάλειμμα" : "Διπλή κράτηση αίθουσας");
        }
      }
    }
  }

  for (const row of intervals) {
    if (row.b.disciplineCode === "brk") continue;
    for (const tid of row.b.therapistUserIds ?? []) {
      for (const br of intervals) {
        if (br.b.disciplineCode !== "brk") continue;
        if (!(br.b.therapistUserIds ?? []).includes(tid)) continue;
        if (intervalOverlap(row.iv, br.iv)) {
          add(row.b.id, "Κράτηση εντός διλείμματος θεραπευτή");
        }
      }
    }
  }

  for (const row of intervals) {
    if (row.b.disciplineCode === "brk") continue;
    const tids = row.b.therapistUserIds ?? [];
    const skipStructured =
      exemptStructured &&
      tids.length > 0 &&
      tids.every((id) => exemptStructured.has(id));
    if (skipStructured) continue;
    const s = (row.iv.startMs - win.startMs) / 60_000;
    const e = (row.iv.endMs - win.startMs) / 60_000;
    for (const br of CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13) {
      if (s < br[1] && e > br[0]) {
        add(row.b.id, "Κράτηση εντός δομημένου διαλείμματος (15′)");
        break;
      }
    }
  }

  return reasons;
}

export type RoomOccupancySlot = { roomKey: string; minute: number; count: number };

export function computeRoomOccupancy(
  blocks: ControlBoardBlock[],
  ymd: string,
  slotMinutes = 30
): { roomKey: string; maxConcurrent: number; slots: RoomOccupancySlot[] }[] {
  const win = athensOperationalWindowMs(ymd);
  const rooms = new Set<string>();
  for (const b of blocks) {
    const key = b.roomLabel?.trim() || "Χωρίς αίθουσα";
    rooms.add(key);
  }
  const out: { roomKey: string; maxConcurrent: number; slots: RoomOccupancySlot[] }[] = [];
  for (const roomKey of [...rooms].sort((a, b) => a.localeCompare(b, "el"))) {
    const slots: RoomOccupancySlot[] = [];
    let maxC = 0;
    for (let m = 0; m < (win.endMs - win.startMs) / 60_000; m += slotMinutes) {
      const slotStart = win.startMs + m * 60 * 1000;
      const slotEnd = slotStart + slotMinutes * 60 * 1000;
      let count = 0;
      for (const b of blocks) {
        const rk = b.roomLabel?.trim() || "Χωρίς αίθουσα";
        if (rk !== roomKey) continue;
        const iv = blockIntervalInWindowMs(b, ymd);
        if (!iv) continue;
        if (intervalOverlap(iv, { startMs: slotStart, endMs: slotEnd })) count++;
      }
      maxC = Math.max(maxC, count);
      slots.push({ roomKey, minute: m, count });
    }
    out.push({ roomKey, maxConcurrent: maxC, slots });
  }
  return out;
}
