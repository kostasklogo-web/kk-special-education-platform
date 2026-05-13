import type { SessionStatus } from "@/lib/data/sessions/types";

/** Left accent for session rows/cards (status at a glance). */
export function sessionStatusStripeClass(status: SessionStatus | string): string {
  switch (status) {
    case "completed":
      return "border-l-[5px] border-l-emerald-500";
    case "scheduled":
      return "border-l-[5px] border-l-clinical-500";
    case "cancelled":
      return "border-l-[5px] border-l-slate-400";
    case "no_show":
    case "absence":
      return "border-l-[5px] border-l-red-500";
    case "to_reschedule":
      return "border-l-[5px] border-l-amber-500";
    default:
      return "border-l-[5px] border-l-border";
  }
}

/** Background tint for schedule week column headers (subtle day bands). */
export function scheduleDayColumnClass(index: number): string {
  return index % 2 === 0 ? "bg-surface-muted/40" : "bg-white/80";
}
