import Link from "next/link";
import { AlertTriangle, ClipboardList, FileText, RefreshCw } from "lucide-react";
import type { DashboardOperationalAlert } from "@/lib/data/dashboard/queries";

const ICONS: Record<string, typeof ClipboardList> = {
  pending_attendance: ClipboardList,
  week_makeup: RefreshCw,
  draft_notes: FileText,
  pending_reports: FileText,
};

export function OperationalAlertCards({ items }: { items: DashboardOperationalAlert[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = ICONS[item.id] ?? AlertTriangle;
        const tone =
          item.tone === "attention"
            ? "border-amber-200/90 bg-gradient-to-br from-amber-50/90 via-white to-white shadow-sm"
            : item.tone === "positive"
              ? "border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white"
              : "border-border bg-surface-card";
        return (
          <Link
            key={item.id}
            href={item.href}
            className={[
              "group relative flex min-h-[9.5rem] flex-col rounded-2xl border p-4 transition hover:shadow-md sm:p-5",
              tone,
            ].join(" ")}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <span className="inline-flex rounded-lg border border-clinical-100/80 bg-clinical-50/90 p-2 text-clinical-800">
                <Icon className="h-4 w-4" aria-hidden />
              </span>
              {item.value > 0 && item.tone === "attention" ? (
                <span className="rounded-full bg-amber-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Δράση
                </span>
              ) : null}
            </div>
            <p className="text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-ink-faint">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-ink">{item.value}</p>
            <p className="mt-2 text-sm leading-snug text-ink-muted">{item.helper}</p>
            <span className="mt-auto pt-3 text-xs font-semibold text-clinical-700 group-hover:underline">Μετάβαση →</span>
          </Link>
        );
      })}
    </div>
  );
}
