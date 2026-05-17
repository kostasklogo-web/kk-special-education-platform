"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useReminders } from "@/components/secretary/reminders/ReminderProvider";
import { buildReportReminderPayload } from "@/components/secretary/reminders/communication-builders";
import { CreateReminderButton } from "@/components/secretary/reminders/CreateReminderButton";
import { useReportRequests } from "./ReportsChargeProvider";
import { reportsDueReminderToday } from "@/lib/secretary/reports/report-queries";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { REPORT_STATUS_LABELS } from "@/lib/secretary/reports/labels";

export function ReportRemindersToday() {
  const today = todayAthensYmd();
  const { consents, queue } = useReminders();
  const reports = useReportRequests();

  const reportQueue = queue.filter((q) => q.entityType === "report");
  const dueFromReports = reportsDueReminderToday(reports, today);

  const items = [
    ...reportQueue.map((q) => ({
      id: q.id,
      childLabel: q.childLabel ?? "—",
      reason: q.reason,
      entityId: q.entityId,
    })),
    ...dueFromReports
      .filter((r) => !reportQueue.some((q) => q.entityId === r.id))
      .map((r) => ({
        id: `rep-due-${r.id}`,
        childLabel: r.childLabel,
        reason: r.isOverdue
          ? "Εκπρόθεσμη αναφορά"
          : ["ready_for_delivery", "approved"].includes(r.status)
            ? "Έτοιμη προς παράδοση"
            : REPORT_STATUS_LABELS[r.status],
        entityId: r.id,
      })),
  ].slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="rounded-xl border border-clinical-100 bg-clinical-50/30 p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-clinical-800" />
          <h2 className="text-sm font-bold text-ink">Υπενθυμίσεις σήμερα — αναφορές</h2>
        </div>
        <Link
          href="/secretary/reminders?tab=reports"
          className="text-xs font-semibold text-clinical-700 hover:underline"
        >
          Όλες →
        </Link>
      </div>

      <ul className="space-y-2">
        {items.map((item) => {
          const report = reports.find((r) => r.id === item.entityId);
          const urgent = report?.isOverdue || report?.isUrgentOverdue;
          return (
            <li
              key={item.id}
              className={`flex flex-wrap items-center gap-2 rounded-lg border px-3 py-2 ${
                urgent ? "border-red-300 bg-red-50" : "border-clinical-200 bg-white"
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">{item.childLabel}</p>
                <p className="text-xs text-ink-muted">{item.reason}</p>
                {report ? (
                  <p className="text-[11px] text-ink-faint">
                    {report.reportTypeLabel}
                    {report.dueDate ? ` · έως ${report.dueDate}` : ""}
                  </p>
                ) : null}
              </div>
              {report ? (
                <CreateReminderButton
                  size="sm"
                  variant="ghost"
                  payload={buildReportReminderPayload(report, consents)}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
