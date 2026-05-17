import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import type { AlertLevel, ReportDeliveryStatus, ReportRequest } from "@/lib/secretary/types";

function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  return Math.round(
    (Date.parse(`${toYmd}T12:00:00.000Z`) - Date.parse(`${fromYmd}T12:00:00.000Z`)) / 86400000
  );
}

const TERMINAL: ReportRequest["status"][] = ["delivered", "cancelled", "archived"];

export function isOpenReport(r: ReportRequest): boolean {
  return !TERMINAL.includes(r.status) && !r.archived;
}

export function enrichReport(report: ReportRequest, todayYmd: string): ReportRequest {
  const daysUntilDue = report.dueDate ? daysBetweenYmd(todayYmd, report.dueDate) : null;
  const isDelivered = report.status === "delivered";
  const isOverdue =
    !isDelivered &&
    !TERMINAL.includes(report.status) &&
    report.dueDate !== null &&
    daysUntilDue !== null &&
    daysUntilDue < 0;
  const isDueSoon =
    !isDelivered &&
    !isOverdue &&
    daysUntilDue !== null &&
    daysUntilDue >= 0 &&
    daysUntilDue <= 7;
  const isUrgentOverdue = isOverdue && report.priority === "urgent";

  let alertLevel: AlertLevel = "green";
  if (isUrgentOverdue) alertLevel = "red";
  else if (isOverdue) alertLevel = "red";
  else if (isDueSoon || report.priority === "urgent") alertLevel = "yellow";
  else if (["supervisor_review", "clinical_director_review", "corrections_requested"].includes(report.status)) {
    alertLevel = "yellow";
  }

  const deliveryStatus: ReportDeliveryStatus = isDelivered
    ? "delivered"
    : report.status === "ready_for_delivery" || report.status === "approved"
      ? "pending"
      : "not_applicable";

  return {
    ...report,
    daysUntilDue,
    isOverdue,
    isDueSoon,
    isUrgentOverdue,
    alertLevel,
    deliveryStatus,
  };
}

export type ReportDashboardMetrics = {
  openTotal: number;
  dueThisWeek: number;
  overdue: number;
  awaitingTherapistDraft: number;
  awaitingSupervisorReview: number;
  awaitingClinicalDirector: number;
  readyForDelivery: number;
  deliveredThisMonth: number;
  urgent: number;
};

function weekEndYmd(todayYmd: string): string {
  return addDaysAthensCalendar(todayYmd, 7);
}

function monthStartYmd(todayYmd: string): string {
  const [y, m] = todayYmd.split("-");
  return `${y}-${m}-01`;
}

export function computeReportDashboardMetrics(
  reports: ReportRequest[],
  todayYmd: string
): ReportDashboardMetrics {
  const weekEnd = weekEndYmd(todayYmd);
  const monthStart = monthStartYmd(todayYmd);
  const open = reports.filter(isOpenReport);

  return {
    openTotal: open.length,
    dueThisWeek: open.filter(
      (r) => r.dueDate && r.dueDate >= todayYmd && r.dueDate <= weekEnd
    ).length,
    overdue: open.filter((r) => r.isOverdue).length,
    awaitingTherapistDraft: open.filter((r) =>
      ["assigned_therapist", "draft_in_progress", "corrections_requested"].includes(r.status)
    ).length,
    awaitingSupervisorReview: open.filter((r) =>
      ["draft_completed", "supervisor_review"].includes(r.status)
    ).length,
    awaitingClinicalDirector: open.filter((r) => r.status === "clinical_director_review").length,
    readyForDelivery: open.filter((r) =>
      ["approved", "ready_for_delivery"].includes(r.status)
    ).length,
    deliveredThisMonth: reports.filter(
      (r) =>
        r.status === "delivered" &&
        r.deliveryDate &&
        r.deliveryDate >= monthStart &&
        r.deliveryDate <= todayYmd
    ).length,
    urgent: open.filter((r) => r.priority === "urgent" || r.isUrgentOverdue).length,
  };
}

export function supervisorReviewPendingDays(report: ReportRequest, todayYmd: string): number | null {
  if (!report.supervisorReviewStartedAt) return null;
  const ymd = report.supervisorReviewStartedAt.slice(0, 10);
  return daysBetweenYmd(ymd, todayYmd);
}
