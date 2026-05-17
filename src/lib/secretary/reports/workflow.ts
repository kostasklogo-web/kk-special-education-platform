import type { ReportRequest, ReportRequestStatus } from "@/lib/secretary/types";
import { enrichReport } from "./calculations";
import { upsertReport } from "./store";
import { autoLogReportDelivered } from "@/lib/secretary/communications/auto-log";
import { closeReportTasks } from "./sync-auto-tasks";

export type WorkflowAction =
  | "assign_therapist"
  | "start_draft"
  | "complete_draft"
  | "send_supervisor"
  | "return_corrections"
  | "send_clinical_director"
  | "approve"
  | "mark_ready"
  | "mark_delivered"
  | "cancel";

const NEXT_STATUS: Record<WorkflowAction, ReportRequestStatus> = {
  assign_therapist: "assigned_therapist",
  start_draft: "draft_in_progress",
  complete_draft: "draft_completed",
  send_supervisor: "supervisor_review",
  return_corrections: "corrections_requested",
  send_clinical_director: "clinical_director_review",
  approve: "approved",
  mark_ready: "ready_for_delivery",
  mark_delivered: "delivered",
  cancel: "cancelled",
};

export function applyWorkflowAction(
  report: ReportRequest,
  action: WorkflowAction,
  todayYmd: string,
  options?: {
    updatedByLabel?: string;
    deliveryDate?: string;
    deliveredTo?: string;
    deliveryMethod?: ReportRequest["deliveryMethod"];
    supervisorReviewComments?: string | null;
    clinicalDirectorComments?: string | null;
  }
): ReportRequest {
  const now = new Date().toISOString();
  const by = options?.updatedByLabel ?? "Γραμματεία";
  let next: ReportRequest = {
    ...report,
    status: NEXT_STATUS[action],
    updatedAt: now,
    updatedByLabel: by,
  };

  if (action === "send_supervisor") {
    next.supervisorReviewStartedAt = now;
  }
  if (action === "return_corrections" && options?.supervisorReviewComments) {
    next.supervisorReviewComments = options.supervisorReviewComments;
  }
  if (action === "send_clinical_director" || action === "approve") {
    if (options?.clinicalDirectorComments) {
      next.clinicalDirectorComments = options.clinicalDirectorComments;
    }
  }
  if (action === "mark_delivered") {
    next.deliveryDate = options?.deliveryDate ?? todayYmd;
    next.deliveredTo = options?.deliveredTo ?? "Γονέας";
    next.deliveryMethod = options?.deliveryMethod ?? next.deliveryMethod ?? "email";
    next.deliveryStatus = "delivered";
  }

  const saved = upsertReport(enrichReport(next, todayYmd), todayYmd);
  if (action === "mark_delivered") {
    autoLogReportDelivered(saved, todayYmd);
    closeReportTasks(saved.id, todayYmd);
  }
  return saved;
}

export function canApplyAction(report: ReportRequest, action: WorkflowAction): boolean {
  if (report.archived || report.status === "cancelled") return false;
  switch (action) {
    case "assign_therapist":
      return report.status === "requested";
    case "start_draft":
      return ["assigned_therapist", "corrections_requested"].includes(report.status);
    case "complete_draft":
      return report.status === "draft_in_progress";
    case "send_supervisor":
      return report.status === "draft_completed";
    case "return_corrections":
      return report.status === "supervisor_review";
    case "send_clinical_director":
      return report.status === "supervisor_review" && report.clinicalDirectorApprovalRequired;
    case "approve":
      return (
        report.status === "supervisor_review" ||
        report.status === "clinical_director_review"
      );
    case "mark_ready":
      return report.status === "approved";
    case "mark_delivered":
      return report.status === "ready_for_delivery" || report.status === "approved";
    case "cancel":
      return report.status !== "delivered";
    default:
      return false;
  }
}
