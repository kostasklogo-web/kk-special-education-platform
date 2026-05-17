import type { AlertLevel, DiagnosisDocument, DiagnosisDocumentStatus } from "@/lib/secretary/types";

export function daysBetweenYmd(fromYmd: string, toYmd: string): number {
  return Math.round(
    (Date.parse(`${toYmd}T12:00:00.000Z`) - Date.parse(`${fromYmd}T12:00:00.000Z`)) / 86400000
  );
}

export function computeDaysUntilExpiry(expiryDate: string, todayYmd: string): number {
  return daysBetweenYmd(todayYmd, expiryDate);
}

export function computeDiagnosisStatus(
  doc: Pick<
    DiagnosisDocument,
    | "renewalRequired"
    | "renewalProcessStarted"
    | "renewedAt"
    | "archived"
    | "expiryDate"
    | "status"
  >,
  todayYmd: string
): DiagnosisDocumentStatus {
  if (doc.archived) return "archived";
  if (!doc.renewalRequired) return "no_renewal_required";
  if (doc.renewedAt) return "renewed";
  if (doc.renewalProcessStarted) return "renewal_in_progress";

  const days = computeDaysUntilExpiry(doc.expiryDate, todayYmd);
  if (days < 0) return "expired";
  if (days <= 7) return "expiring_7";
  if (days <= 30) return "expiring_30";
  if (days <= 60) return "expiring_60";
  return "active";
}

export function alertLevelForDiagnosis(
  status: DiagnosisDocumentStatus,
  daysUntilExpiry: number,
  renewalProcessStarted: boolean
): AlertLevel {
  if (status === "archived" || status === "no_renewal_required" || status === "renewed") {
    return "green";
  }
  if (status === "renewal_in_progress") return "yellow";
  if (status === "needs_review") return "yellow";
  if (status === "expired") {
    if (!renewalProcessStarted) return "red";
    return "red";
  }
  if (status === "expiring_7" || daysUntilExpiry <= 7) return "red";
  if (status === "expiring_30" || daysUntilExpiry <= 30) return "yellow";
  if (status === "expiring_60" || daysUntilExpiry <= 60) return "yellow";
  return "green";
}

/** Dark red KPI: expired with no renewal process started */
export function isExpiredWithoutFollowUp(doc: DiagnosisDocument): boolean {
  return (
    !doc.archived &&
    doc.renewalRequired &&
    !doc.renewedAt &&
    doc.daysUntilExpiry < 0 &&
    !doc.renewalProcessStarted
  );
}

export function enrichDiagnosis(doc: DiagnosisDocument, todayYmd: string): DiagnosisDocument {
  const daysUntilExpiry = computeDaysUntilExpiry(doc.expiryDate, todayYmd);
  const status = computeDiagnosisStatus(doc, todayYmd);
  return {
    ...doc,
    daysUntilExpiry,
    status,
    alertLevel: alertLevelForDiagnosis(status, daysUntilExpiry, doc.renewalProcessStarted),
  };
}

export type DiagnosisDashboardMetrics = {
  activeCount: number;
  expiring60: number;
  expiring30: number;
  expiring7: number;
  expired: number;
  renewalPending: number;
  missingFile: number;
  multiDocChildren: number;
  renewedThisMonth: number;
};

export function computeDiagnosisDashboardMetrics(
  docs: DiagnosisDocument[],
  todayYmd: string
): DiagnosisDashboardMetrics {
  const active = docs.filter((d) => !d.archived && d.status !== "archived");
  const monthPrefix = todayYmd.slice(0, 7);

  const childCounts = new Map<string, number>();
  for (const d of active) {
    childCounts.set(d.childId, (childCounts.get(d.childId) ?? 0) + 1);
  }

  return {
    activeCount: active.filter((d) => d.status !== "renewed" && d.status !== "no_renewal_required").length,
    expiring60: active.filter((d) => d.status === "expiring_60").length,
    expiring30: active.filter((d) => d.status === "expiring_30").length,
    expiring7: active.filter((d) => d.status === "expiring_7").length,
    expired: active.filter((d) => d.status === "expired").length,
    renewalPending: active.filter(
      (d) => d.renewalRequired && !d.renewalProcessStarted && d.daysUntilExpiry <= 60 && !d.renewedAt
    ).length,
    missingFile: active.filter((d) => !d.fileName && !d.archived).length,
    multiDocChildren: [...childCounts.values()].filter((n) => n > 1).length,
    renewedThisMonth: docs.filter((d) => d.renewedAt?.startsWith(monthPrefix)).length,
  };
}
