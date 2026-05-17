import type { ReportRequest } from "@/lib/secretary/types";
import {
  canShareReportWithParent,
  reportsShareableWithParent,
} from "@/lib/secretary/reports/report-queries";

/** Parent portal: only approved final reports with a file may be listed. */
export function parentPortalReportsForChild(
  reports: ReportRequest[],
  childId: string
): ReportRequest[] {
  return reportsShareableWithParent(reports).filter((r) => r.childId === childId);
}

export function isReportVisibleInParentPortal(report: ReportRequest): boolean {
  return canShareReportWithParent(report);
}

export type ParentPortalReportSummary = {
  id: string;
  childId: string;
  reportTypeLabel: string;
  deliveryDate: string | null;
  finalFileName: string | null;
};

export function toParentPortalReportSummary(report: ReportRequest): ParentPortalReportSummary | null {
  if (!isReportVisibleInParentPortal(report)) return null;
  return {
    id: report.id,
    childId: report.childId,
    reportTypeLabel: report.reportTypeLabel,
    deliveryDate: report.deliveryDate,
    finalFileName: report.finalFileName,
  };
}
