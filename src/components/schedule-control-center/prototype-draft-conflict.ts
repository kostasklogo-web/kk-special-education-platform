import { blockIntervalInWindowMs, type ControlBoardBlock } from "@/lib/schedule/control-center-model";
import { athensOperationalWindowMs, intervalOverlap } from "@/lib/schedule/control-center-window";
import { CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13 } from "@/lib/schedule/control-center-model";
import { isControlCenterSide50Therapist } from "@/lib/demo/schedule-control-center-data";

export type DraftAppointment = {
  dateYmd: string;
  therapistUserId: string;
  roomId: string;
  startHm: string;
  durationMin: 45 | 90;
  childLabel: string;
};

export type DraftConflictResult = {
  ok: boolean;
  messages: string[];
};

function parseHmOnYmd(ymd: string, hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return null;
  const win = athensOperationalWindowMs(ymd);
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min)) return null;
  const day0 = win.startMs - 13 * 60 * 60 * 1000;
  return day0 + h * 3600_000 + min * 60_000;
}

export function evaluateDraftAppointment(
  draft: DraftAppointment,
  blocks: ControlBoardBlock[]
): DraftConflictResult {
  const messages: string[] = [];
  if (!draft.therapistUserId) messages.push("Επιλέξτε θεραπευτή.");
  if (!draft.roomId) messages.push("Επιλέξτε αίθουσα.");
  if (!draft.childLabel.trim()) messages.push("Ορίστε παιδί ή ομάδα.");
  if (!draft.startHm.trim()) messages.push("Ορίστε ώρα έναρξης (π.χ. 14:30).");

  const startMs = parseHmOnYmd(draft.dateYmd, draft.startHm);
  if (draft.startHm && startMs == null) messages.push("Μη έγκυρη ώρα (μορφή ΩΩ:ΛΛ).");

  if (messages.length > 0) return { ok: false, messages };

  const endMs = startMs! + draft.durationMin * 60_000;
  const win = athensOperationalWindowMs(draft.dateYmd);
  if (startMs! < win.startMs || endMs > win.endMs) {
    messages.push("Το ραντεβού πρέπει να είναι εντός 13:00–21:00.");
  }

  const startMinFrom13 = (startMs! - win.startMs) / 60_000;
  const endMinFrom13 = (endMs - win.startMs) / 60_000;

  if (draft.durationMin === 45 && startMinFrom13 % 45 !== 0) {
    messages.push("Η 45λεπτη συνεδρία πρέπει να ευθυγραμμίζεται με το πλέγμα 45′.");
  }
  if (draft.durationMin === 90 && startMinFrom13 % 45 !== 0) {
    messages.push("Η 90λεπτη ομάδα πρέπει να ξεκινά σε όριο 45′ (δύο θέσεις πλέγματος).");
  }

  if (
    draft.durationMin === 45 &&
    !isControlCenterSide50Therapist(draft.therapistUserId) &&
    CONTROL_CENTER_STRUCTURED_TEAM_BREAK_INTERVALS_FROM_13.some(([s, e]) => startMinFrom13 < e && endMinFrom13 > s)
  ) {
    messages.push("Το διάλειμμα 15′ (πλέγμα 45′) είναι κλειστό — επιλέξτε άλλη ώρα.");
  }

  const draftIv = { startMs: startMs!, endMs };

  for (const b of blocks) {
    const iv = blockIntervalInWindowMs(b, draft.dateYmd);
    if (!iv) continue;
    if (!intervalOverlap(draftIv, iv)) continue;

    if ((b.therapistUserIds ?? []).includes(draft.therapistUserId)) {
      messages.push(`Ο θεραπευτής είναι δεσμευμένος ${draft.startHm} (${b.title || "διάλειμμα"}).`);
    }
    if (b.roomId === draft.roomId) {
      messages.push(`Η αίθουσα είναι κατειλημμένη ${draft.startHm}.`);
    }
  }

  const unique = [...new Set(messages)];
  return { ok: unique.length === 0, messages: unique };
}
