import type { DiagnosisDocumentStatus } from "@/lib/secretary/types";
import { DIAGNOSIS_STATUS_LABELS, DIAGNOSIS_STATUS_STYLES } from "@/lib/secretary/diagnoses/labels";

export function DiagnosisStatusBadge({ status }: { status: DiagnosisDocumentStatus }) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${DIAGNOSIS_STATUS_STYLES[status]}`}
    >
      {DIAGNOSIS_STATUS_LABELS[status]}
    </span>
  );
}
