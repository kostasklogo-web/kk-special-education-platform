"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { SecretaryTask } from "@/lib/secretary/types";
import { useReportRequests } from "./ReportsChargeProvider";
import { REPORT_BADGE_CLASS } from "@/lib/secretary/reports/report-queries";
import { REPORT_STATUS_LABELS } from "@/lib/secretary/reports/labels";

type Props = { task: SecretaryTask; className?: string };

export function TaskReportBadge({ task, className = "" }: Props) {
  const reports = useReportRequests();
  const isReportTask =
    task.taskTypeCode.startsWith("report_") ||
    !!task.linkedReportId ||
    task.notes.includes("report:");

  if (!isReportTask) return null;

  const report = task.linkedReportId
    ? reports.find((r) => r.id === task.linkedReportId)
    : reports.find((r) => r.childId === task.childId && r.status !== "delivered");

  const tone = report?.isOverdue ? "red" : report?.isDueSoon ? "yellow" : "yellow";
  const href = task.linkedReportId
    ? `/secretary/reports?report=${task.linkedReportId}`
    : "/secretary/reports";

  const label = report ? REPORT_STATUS_LABELS[report.status].slice(0, 12) : "Αναφορά";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-0.5 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${REPORT_BADGE_CLASS[tone]} ${className}`}
      title={report?.reportTypeLabel ?? task.title}
    >
      <FileText className="h-2.5 w-2.5" />
      {label}
    </Link>
  );
}
