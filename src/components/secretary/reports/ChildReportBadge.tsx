"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { useReportRequests } from "./ReportsChargeProvider";
import { reportBadgeForChild, REPORT_BADGE_CLASS } from "@/lib/secretary/reports/report-queries";

type Props = { childId: string; compact?: boolean; className?: string };

export function ChildReportBadge({ childId, compact = false, className = "" }: Props) {
  const reports = useReportRequests();
  const badge = reportBadgeForChild(reports, childId);
  if (!badge) return null;

  return (
    <Link
      href={badge.href}
      className={`inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${REPORT_BADGE_CLASS[badge.tone]} ${className}`}
      title={badge.title}
    >
      <FileText className="h-2.5 w-2.5 shrink-0" />
      {compact ? badge.label.slice(0, 8) : badge.label}
    </Link>
  );
}
