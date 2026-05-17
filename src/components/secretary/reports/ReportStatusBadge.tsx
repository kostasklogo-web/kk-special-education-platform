"use client";

import type { ReportRequestStatus } from "@/lib/secretary/types";
import { REPORT_STATUS_BADGE_CLASS, REPORT_STATUS_LABELS } from "@/lib/secretary/reports/labels";

type Props = { status: ReportRequestStatus; overdue?: boolean; className?: string };

export function ReportStatusBadge({ status, overdue, className = "" }: Props) {
  const label =
    overdue && status !== "delivered" && status !== "cancelled"
      ? "Εκπρόθεσμη"
      : REPORT_STATUS_LABELS[status];
  const cls =
    overdue && status !== "delivered" && status !== "cancelled"
      ? "bg-red-100 text-red-950 border-red-300"
      : REPORT_STATUS_BADGE_CLASS[status];

  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-[11px] font-bold ${cls} ${className}`}
    >
      {label}
    </span>
  );
}
