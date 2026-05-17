import type { AlertLevel } from "@/lib/secretary/types";
import { ALERT_LEVEL_LABELS } from "@/lib/secretary/labels";

const STYLES: Record<AlertLevel, string> = {
  red: "border-red-300 bg-red-50 text-red-900",
  yellow: "border-amber-300 bg-amber-50 text-amber-950",
  green: "border-emerald-300 bg-emerald-50 text-emerald-900",
};

export function AlertBadge({ level, className = "" }: { level: AlertLevel; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STYLES[level]} ${className}`}
    >
      {ALERT_LEVEL_LABELS[level]}
    </span>
  );
}
