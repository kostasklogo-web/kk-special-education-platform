import type { ControlBoardBlock } from "@/lib/schedule/control-center-model";
import { CONTROL_CENTER_DEMO_ROOMS } from "@/lib/demo/schedule-control-center-data";
import { blockDurationMinutes, formatAthensHmFromUtcMs } from "@/lib/schedule/control-center-prototype-utils";

export type DisciplineVisual = { wrap: string; bar: string; badge: string };

export function blockTimeRangeEl(b: ControlBoardBlock): string {
  const a = Date.parse(b.starts_at);
  const z = Date.parse(b.ends_at);
  if (!Number.isFinite(a) || !Number.isFinite(z)) return "—";
  return `${formatAthensHmFromUtcMs(a)}–${formatAthensHmFromUtcMs(z)}`;
}

export function blockHeadline(b: ControlBoardBlock): string {
  const dm = Math.round(blockDurationMinutes(b));
  if (b.disciplineCode === "brk") {
    if (dm === 10) return "Διάλειμμα 10′";
    return "Διάλειμμα 15′";
  }
  return b.title;
}

/** Συμπαγής γραμμή παιδιού/ομάδας για κελί πίνακα. */
export function childLineForCell(b: ControlBoardBlock): string {
  if (b.sessionKind === "group") {
    const t = b.title?.trim();
    if (t && !t.includes(",")) return t.replace(/^Ομάδα\s*/i, "").trim() || t;
    return b.subtitle?.split(",")[0]?.trim() || t || "Ομάδα";
  }
  const line = b.subtitle?.trim() || b.title?.trim() || "—";
  return line;
}

export function roomCompactForCell(b: ControlBoardBlock): string {
  const room = CONTROL_CENTER_DEMO_ROOMS.find((r) => r.id === b.roomId);
  const s = room?.short_label ?? b.roomLabel ?? "—";
  const d = s.match(/\d+/);
  return d ? d[0] : s.slice(0, 4);
}

/** Συμπαγής 2η γραμμή κελιού: αίθουσα · χρονικό εύρος. */
export function cellMetaLineForCell(b: ControlBoardBlock): string {
  return `${roomCompactForCell(b)} · ${blockTimeRangeEl(b)}`;
}

export function disciplineVisual(b: ControlBoardBlock): DisciplineVisual {
  const code = b.disciplineCode;
  if (code === "brk") {
    const dm = Math.round(blockDurationMinutes(b));
    if (dm === 10) {
      return {
        wrap: "border border-amber-500 bg-gradient-to-b from-amber-100 to-amber-50/90 text-amber-950 shadow-sm",
        bar: "bg-amber-500",
        badge: "bg-amber-900 text-white",
      };
    }
    return {
      wrap:
        "border border-slate-600 bg-[repeating-linear-gradient(-45deg,rgb(226_232_240),rgb(226_232_240)_7px,rgb(148_163_184)_7px,rgb(148_163_184)_14px)] text-slate-950 shadow-sm",
      bar: "bg-slate-600",
      badge: "bg-slate-900 text-white",
    };
  }
  const map: Record<string, DisciplineVisual> = {
    slt: { wrap: "border border-sky-600 bg-gradient-to-b from-sky-200 to-sky-50 text-sky-950", bar: "bg-sky-600", badge: "bg-sky-800 text-white" },
    ot: { wrap: "border border-amber-600 bg-gradient-to-b from-amber-200 to-amber-50 text-amber-950", bar: "bg-amber-600", badge: "bg-amber-900 text-white" },
    psy: { wrap: "border border-violet-700 bg-gradient-to-b from-violet-200 to-violet-50 text-violet-950", bar: "bg-violet-700", badge: "bg-violet-900 text-white" },
    sped: { wrap: "border border-teal-700 bg-gradient-to-b from-teal-200 to-teal-50 text-teal-950", bar: "bg-teal-700", badge: "bg-teal-900 text-white" },
    oel: { wrap: "border border-fuchsia-700 bg-gradient-to-b from-fuchsia-200 to-fuchsia-50 text-fuchsia-950", bar: "bg-fuchsia-700", badge: "bg-fuchsia-900 text-white" },
    okd: { wrap: "border border-indigo-700 bg-gradient-to-b from-indigo-200 to-indigo-50 text-indigo-950", bar: "bg-indigo-700", badge: "bg-indigo-900 text-white" },
    sup: { wrap: "border border-purple-600 bg-gradient-to-b from-purple-200 to-purple-50 text-purple-950", bar: "bg-purple-700", badge: "bg-purple-900 text-white" },
    par: { wrap: "border border-cyan-600 bg-gradient-to-b from-cyan-200 to-cyan-50 text-cyan-950", bar: "bg-cyan-700", badge: "bg-cyan-900 text-white" },
    lead: { wrap: "border border-rose-700 bg-gradient-to-b from-rose-200 to-rose-50 text-rose-950", bar: "bg-rose-700", badge: "bg-rose-900 text-white" },
  };
  if (map[code]) return map[code];
  if (b.sessionKind === "group") {
    return {
      wrap: "border border-indigo-700 bg-gradient-to-b from-indigo-200 via-indigo-50 to-white text-indigo-950",
      bar: "bg-indigo-600",
      badge: "bg-indigo-900 text-white",
    };
  }
  return {
    wrap: "border border-emerald-600 bg-gradient-to-b from-emerald-100 to-white text-emerald-950",
    bar: "bg-emerald-600",
    badge: "bg-emerald-900 text-white",
  };
}

export function groupLinkColor(groupId: string | null | undefined): string {
  if (!groupId) return "transparent";
  let h = 0;
  for (let i = 0; i < groupId.length; i++) h = (h * 31 + groupId.charCodeAt(i)) >>> 0;
  const hues = [220, 280, 340, 30, 160, 200];
  return `hsl(${hues[h % hues.length]} 75% 38%)`;
}
