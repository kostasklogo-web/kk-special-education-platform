import type { DiagnosisDocument } from "@/lib/secretary/types";
import type { ReminderTemplateCode } from "@/lib/secretary/reminders/types";

/** Pick diagnosis reminder template from document state. */
export function diagnosisTemplateForDocument(doc: DiagnosisDocument): ReminderTemplateCode {
  if (doc.renewalProcessStarted && doc.daysUntilExpiry < 0) {
    return "diagnosis_renewal_followup";
  }
  if (doc.daysUntilExpiry < 0) return "diagnosis_expired";
  if (doc.daysUntilExpiry <= 7) return "diagnosis_expires_7";
  if (doc.daysUntilExpiry <= 30) return "diagnosis_expires_30";
  if (doc.daysUntilExpiry <= 60) return "diagnosis_expires_60";
  return "diagnosis_renewal";
}
