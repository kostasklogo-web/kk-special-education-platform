import type { ReportRequest } from "@/lib/secretary/types";
import { enrichReport } from "./calculations";
import { upsertReport } from "./store";
import { exportApprovedReportPdf } from "./export";

export function archiveReport(
  report: ReportRequest,
  todayYmd: string,
  archivedByLabel: string
): ReportRequest {
  const now = new Date().toISOString();
  return upsertReport(
    enrichReport(
      {
        ...report,
        archived: true,
        status: report.status === "delivered" ? "delivered" : "archived",
        updatedAt: now,
        updatedByLabel: archivedByLabel,
      },
      todayYmd
    ),
    todayYmd
  );
}

export function exportAndArchiveApproved(
  report: ReportRequest,
  todayYmd: string,
  byLabel: string
): ReportRequest {
  if (!["approved", "ready_for_delivery", "delivered"].includes(report.status)) {
    return report;
  }
  exportApprovedReportPdf(report);
  return archiveReport(report, todayYmd, byLabel);
}
