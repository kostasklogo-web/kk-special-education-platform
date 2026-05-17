"use client";

import type { ReportRequest, ReportRequestStatus } from "@/lib/secretary/types";
import { REPORT_STATUS_LABELS } from "@/lib/secretary/reports/labels";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { REPORT_PRIORITY_BADGE_CLASS, REPORT_PRIORITY_LABELS } from "@/lib/secretary/reports/labels";
import { formatDateEl } from "@/lib/ui/child-labels";
import { AlertBadge } from "@/components/secretary/AlertBadge";

const COLUMNS: ReportRequestStatus[] = [
  "requested",
  "assigned_therapist",
  "draft_in_progress",
  "draft_completed",
  "supervisor_review",
  "corrections_requested",
  "clinical_director_review",
  "approved",
  "ready_for_delivery",
  "delivered",
];

type Props = {
  reports: ReportRequest[];
  onSelect: (r: ReportRequest) => void;
};

export function ReportsKanban({ reports, onSelect }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {COLUMNS.map((status) => {
        const col = reports.filter((r) => r.status === status && !r.archived);
        return (
          <section
            key={status}
            className="min-w-[200px] flex-1 rounded-xl border border-border bg-surface-muted/30 p-2"
          >
            <h3 className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-ink-muted">
              {REPORT_STATUS_LABELS[status]} ({col.length})
            </h3>
            <ul className="space-y-2">
              {col.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(r)}
                    className="w-full rounded-lg border border-border bg-white p-2.5 text-left shadow-sm hover:bg-surface-muted/30"
                  >
                    <p className="text-sm font-bold text-ink">{r.childLabel}</p>
                    <p className="text-[11px] text-ink-muted">{r.reportTypeLabel}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      <span
                        className={`rounded border px-1 py-0.5 text-[10px] font-bold ${REPORT_PRIORITY_BADGE_CLASS[r.priority]}`}
                      >
                        {REPORT_PRIORITY_LABELS[r.priority]}
                      </span>
                      {r.isOverdue ? <ReportStatusBadge status={r.status} overdue /> : null}
                      <AlertBadge level={r.alertLevel} />
                    </div>
                    {r.dueDate ? (
                      <p className="mt-1 text-[10px] text-ink-faint">έως {formatDateEl(r.dueDate)}</p>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
