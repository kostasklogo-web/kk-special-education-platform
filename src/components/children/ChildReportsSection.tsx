"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { getAllReports, REPORTS_UPDATED_EVENT } from "@/lib/secretary/reports/store";
import { isOpenReport } from "@/lib/secretary/reports/calculations";
import { formatDateEl } from "@/lib/ui/child-labels";
import { ReportStatusBadge } from "@/components/secretary/reports/ReportStatusBadge";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { parentPortalReportsForChild } from "@/lib/parent-portal/report-share";

type Props = { childId: string; childLabel: string };

export function ChildReportsSection({ childId, childLabel }: Props) {
  const today = todayAthensYmd();
  const [all, setAll] = useState(() => getAllReports(today));

  useEffect(() => {
    const refresh = () => setAll(getAllReports(today));
    refresh();
    window.addEventListener(REPORTS_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(REPORTS_UPDATED_EVENT, refresh);
  }, [today]);

  const childReports = useMemo(() => all.filter((r) => r.childId === childId), [all, childId]);
  const open = childReports.filter(isOpenReport);
  const overdue = open.filter((r) => r.isOverdue);
  const delivered = childReports.filter((r) => r.status === "delivered");
  const portalReady = parentPortalReportsForChild(all, childId);

  if (childReports.length === 0) return null;

  const byType = new Map<string, number>();
  for (const r of childReports) {
    byType.set(r.reportTypeLabel, (byType.get(r.reportTypeLabel) ?? 0) + 1);
  }

  return (
    <section className="rounded-xl border border-border bg-surface-card p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-clinical-700" />
          <h2 className="text-base font-bold text-ink">Αιτήματα αναφορών</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/secretary/reports?child=${encodeURIComponent(childLabel)}`}
            className="text-xs font-semibold text-clinical-700 hover:underline"
          >
            Όλα →
          </Link>
          <NewCommunicationLink
            params={{ childId, childLabel, report: open[0]?.id }}
            size="sm"
          />
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-3 text-xs text-ink-muted">
        <span>
          Ανοιχτά: <strong className="text-ink">{open.length}</strong>
        </span>
        <span>
          Εκπρόθεσμα: <strong className="text-red-700">{overdue.length}</strong>
        </span>
        <span>
          Παραδόθηκαν: <strong className="text-emerald-800">{delivered.length}</strong>
        </span>
        {portalReady.length > 0 ? (
          <span>
            Parent portal: <strong className="text-clinical-800">{portalReady.length}</strong>
          </span>
        ) : null}
      </div>

      {byType.size > 0 ? (
        <p className="mb-2 text-[11px] text-ink-faint">
          { [...byType.entries()].map(([t, n]) => `${t} (${n})`).join(" · ") }
        </p>
      ) : null}

      <ul className="space-y-2">
        {childReports.slice(0, 8).map((r) => (
          <li key={r.id}>
            <Link
              href={`/secretary/reports?report=${r.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/80 px-3 py-2 hover:bg-surface-muted/30"
            >
              <div>
                <p className="text-sm font-semibold text-ink">{r.reportTypeLabel}</p>
                <p className="text-xs text-ink-muted">
                  {formatDateEl(r.requestDate)}
                  {r.dueDate ? ` · έως ${formatDateEl(r.dueDate)}` : ""}
                </p>
              </div>
              <ReportStatusBadge status={r.status} overdue={r.isOverdue} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
