import type { ReportRequest, ReportRequestStatus } from "@/lib/secretary/types";
import { reportTypeLabel } from "./catalog";

function migrateStatus(status: string): ReportRequestStatus {
  if (status === "assigned") return "assigned_therapist";
  return status as ReportRequestStatus;
}

export function normalizeReportRequest(
  partial: Partial<ReportRequest> & Pick<ReportRequest, "id" | "childId" | "childLabel">,
  todayYmd: string
): ReportRequest {
  const now = partial.updatedAt ?? partial.createdAt ?? new Date().toISOString();
  const therapists = partial.assignedTherapistLabels?.length
    ? partial.assignedTherapistLabels
    : partial.assignedTherapistLabel
      ? [partial.assignedTherapistLabel]
      : [];

  return {
    id: partial.id,
    childId: partial.childId,
    childLabel: partial.childLabel,
    parentLabel: partial.parentLabel ?? null,
    locationCode: partial.locationCode ?? "nikaia",
    reportTypeCode: partial.reportTypeCode ?? "progress",
    reportTypeLabel: partial.reportTypeLabel ?? reportTypeLabel(partial.reportTypeCode ?? "progress"),
    requestedBy: partial.requestedBy ?? "Γραμματεία",
    requestSource: partial.requestSource ?? "parent",
    requestDate: partial.requestDate ?? todayYmd,
    dueDate: partial.dueDate ?? null,
    priority: partial.priority ?? "normal",
    purpose: partial.purpose ?? "",
    assignedTherapistLabels: therapists,
    assignedTherapistLabel: therapists[0] ?? partial.assignedTherapistLabel ?? null,
    assignedSupervisorLabel: partial.assignedSupervisorLabel ?? null,
    clinicalDirectorApprovalRequired: partial.clinicalDirectorApprovalRequired ?? false,
    status: migrateStatus(partial.status ?? "requested"),
    notes: partial.notes ?? "",
    linkedAppointmentId: partial.linkedAppointmentId ?? null,
    linkedDiagnosisId: partial.linkedDiagnosisId ?? null,
    linkedCommunicationIds: partial.linkedCommunicationIds ?? [],
    deliveryMethod: partial.deliveryMethod ?? null,
    deliveryDate: partial.deliveryDate ?? null,
    deliveredTo: partial.deliveredTo ?? null,
    fileVersions: partial.fileVersions ?? [],
    finalFileName: partial.finalFileName ?? null,
    supervisorReviewComments: partial.supervisorReviewComments ?? null,
    clinicalDirectorComments: partial.clinicalDirectorComments ?? null,
    supervisorReviewStartedAt: partial.supervisorReviewStartedAt ?? null,
    createdByLabel: partial.createdByLabel ?? "Γραμματεία",
    createdAt: partial.createdAt ?? now,
    updatedByLabel: partial.updatedByLabel ?? partial.createdByLabel ?? "Γραμματεία",
    updatedAt: partial.updatedAt ?? now,
    archived: partial.archived ?? false,
    alertLevel: partial.alertLevel ?? "green",
    daysUntilDue: partial.daysUntilDue ?? null,
    isOverdue: partial.isOverdue ?? false,
    isDueSoon: partial.isDueSoon ?? false,
    isUrgentOverdue: partial.isUrgentOverdue ?? false,
    deliveryStatus: partial.deliveryStatus ?? "pending",
  };
}
