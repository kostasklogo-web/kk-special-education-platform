"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { useReportRequests } from "./ReportsChargeProvider";
import { dashboardReportSummary } from "@/lib/secretary/reports/report-queries";
import { AlertBadge } from "@/components/secretary/AlertBadge";

export function ReportsDashboardStrip() {
  const today = todayAthensYmd();
  const reports = useReportRequests();
  const { openCount, dueSoonCount, overdueCount, readyCount, dueToday } = dashboardReportSummary(
    reports,
    today
  );

  if (openCount === 0 && overdueCount === 0) return null;

  const cards = [
    {
      label: "Ανοιχτά",
      value: openCount,
      level: "yellow" as const,
      href: "/secretary/reports?quick=open",
    },
    {
      label: "Προθεσμία εβδομάδας",
      value: dueSoonCount,
      level: dueSoonCount > 0 ? ("yellow" as const) : ("green" as const),
      href: "/secretary/reports?quick=due_week",
    },
    {
      label: "Εκπρόθεσμα",
      value: overdueCount,
      level: overdueCount > 0 ? ("red" as const) : ("green" as const),
      href: "/secretary/reports?quick=overdue",
    },
    {
      label: "Έτοιμες παράδοσης",
      value: readyCount,
      level: "green" as const,
      href: "/secretary/reports?quick=ready",
    },
  ];

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-clinical-600" />
          <div>
            <h2 className="text-sm font-bold text-ink">Αιτήματα αναφορών</h2>
            <p className="text-xs text-ink-muted">
              {dueToday.length > 0
                ? `${dueToday.length} χρειάζονται ενέργεια/υπενθύμιση σήμερα`
                : `${openCount} ανοιχτά αιτήματα`}
            </p>
          </div>
        </div>
        <Link
          href="/secretary/reports"
          className="text-xs font-semibold text-clinical-700 hover:underline"
        >
          Διαχείριση →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-border bg-white p-2.5 text-left transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-1">
              <p className="text-[10px] font-semibold uppercase leading-tight text-ink-muted">{c.label}</p>
              <AlertBadge level={c.level} />
            </div>
            <p className="mt-1 text-xl font-bold tabular-nums text-ink">{c.value}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
