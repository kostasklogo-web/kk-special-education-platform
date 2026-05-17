"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { CommunicationLog } from "@/lib/secretary/types";
import { isReportCommunication } from "@/lib/secretary/reports/report-queries";

type Props = { log: CommunicationLog; className?: string };

export function CommunicationReportBadge({ log, className = "" }: Props) {
  if (!isReportCommunication(log)) return null;

  const href = log.linkedReportId
    ? `/secretary/reports?report=${log.linkedReportId}`
    : log.childId
      ? `/secretary/reports?child=${encodeURIComponent(log.childLabel ?? "")}`
      : "/secretary/reports";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-0.5 rounded-md border border-clinical-200 bg-clinical-50 px-1.5 py-0.5 text-[10px] font-bold text-clinical-900 hover:bg-clinical-100 ${className}`}
      title="Επικοινωνία σχετική με αναφορά"
    >
      <FileText className="h-2.5 w-2.5" />
      Αναφορά
    </Link>
  );
}
