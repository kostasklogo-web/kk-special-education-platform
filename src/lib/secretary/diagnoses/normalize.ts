import { getDemoOrganizationId } from "@/lib/config/demo";
import type {
  DiagnosisDocument,
  DiagnosisDocumentTypeCode,
} from "@/lib/secretary/types";
import { documentTypeLabel } from "./catalog";
import { enrichDiagnosis } from "./calculations";

type LegacyPartial = Partial<DiagnosisDocument> & {
  id: string;
  childId: string;
  childLabel: string;
  expiryDate: string;
};

function mapLegacyStatus(
  status: string | undefined,
  days: number
): DiagnosisDocument["status"] | undefined {
  if (status === "expiring_soon") {
    if (days <= 7) return "expiring_7";
    if (days <= 30) return "expiring_30";
    return "expiring_60";
  }
  if (status === "active") return "active";
  if (status === "expired") return "expired";
  if (status === "renewed") return "renewed";
  return undefined;
}

function inferTypeCode(documentType: string): DiagnosisDocumentTypeCode {
  const t = documentType.toLowerCase();
  if (t.includes("κεδασυ") || t.includes("kedasy")) return "kedasy";
  if (t.includes("νοσοκομεί") || t.includes("δημόσι")) return "public_hospital";
  if (t.includes("παιδοψυχ")) return "child_psychiatrist";
  if (t.includes("αναπτυξ")) return "developmental";
  if (t.includes("νευρολ")) return "neurologist";
  if (t.includes("παράλληλ")) return "parallel_support_approval";
  if (t.includes("σχολ")) return "school_certificate";
  return "other";
}

export function normalizeDiagnosisDocument(
  partial: LegacyPartial,
  todayYmd: string
): DiagnosisDocument {
  const orgId = partial.organizationId ?? getDemoOrganizationId();
  const typeCode =
    partial.documentTypeCode ?? inferTypeCode(partial.documentType ?? "Άλλο");
  const docType = partial.documentType ?? documentTypeLabel(typeCode);
  const days = partial.daysUntilExpiry ?? 0;

  const draft: DiagnosisDocument = {
    id: partial.id,
    organizationId: orgId,
    childId: partial.childId,
    childLabel: partial.childLabel,
    parentLabel: partial.parentLabel ?? null,
    locationCode: partial.locationCode ?? "nikaia",
    documentTypeCode: typeCode,
    documentType: docType,
    diagnosisDescription: partial.diagnosisDescription ?? partial.notes?.slice(0, 120) ?? docType,
    issuingAuthority: partial.issuingAuthority ?? "—",
    doctorSpecialty: partial.doctorSpecialty ?? null,
    issueDate: partial.issueDate ?? null,
    expiryDate: partial.expiryDate,
    renewalRequired: partial.renewalRequired ?? true,
    renewalProcessStarted: partial.renewalProcessStarted ?? false,
    renewalFollowUpDate: partial.renewalFollowUpDate ?? null,
    responsiblePersonLabel: partial.responsiblePersonLabel ?? "Γραμματεία",
    status:
      partial.status && !String(partial.status).includes("expiring_soon")
        ? (partial.status as DiagnosisDocument["status"])
        : mapLegacyStatus(String(partial.status), days) ?? "active",
    alertLevel: partial.alertLevel ?? "green",
    daysUntilExpiry: days,
    notes: partial.notes ?? "",
    fileName: partial.fileName ?? null,
    fileUploadedAt: partial.fileUploadedAt ?? null,
    archived: partial.archived ?? false,
    renewedAt: partial.renewedAt ?? null,
    createdByLabel: partial.createdByLabel ?? "Γραμματεία",
    createdAt: partial.createdAt ?? new Date().toISOString(),
    updatedByLabel: partial.updatedByLabel ?? null,
    updatedAt: partial.updatedAt ?? partial.createdAt ?? new Date().toISOString(),
  };

  return enrichDiagnosis(draft, todayYmd);
}
