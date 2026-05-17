import type { CommunicationLog } from "@/lib/secretary/types";
import type { ReminderEntityType } from "@/lib/secretary/reminders/types";

export function communicationLinksFromEntity(
  entityType: ReminderEntityType,
  entityId: string
): Partial<
  Pick<
    CommunicationLog,
    | "linkedAppointmentId"
    | "linkedPaymentId"
    | "linkedDiagnosisId"
    | "linkedReportId"
    | "linkedTaskId"
    | "linkedMeetingId"
  >
> {
  switch (entityType) {
    case "appointment":
      return { linkedAppointmentId: entityId };
    case "payment":
      return { linkedPaymentId: entityId };
    case "diagnosis":
      return { linkedDiagnosisId: entityId };
    case "report":
      return { linkedReportId: entityId };
    case "task":
      return { linkedTaskId: entityId };
    case "meeting":
      return { linkedMeetingId: entityId };
    default:
      return {};
  }
}
