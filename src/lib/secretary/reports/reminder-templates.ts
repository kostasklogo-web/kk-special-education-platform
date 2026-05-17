import type { ReportRequest } from "@/lib/secretary/types";
import type { ReminderTemplateCode } from "@/lib/secretary/reminders/types";

export function reportTemplateForRequest(report: ReportRequest): ReminderTemplateCode {
  if (["approved", "ready_for_delivery"].includes(report.status)) {
    return "progress_report_ready";
  }
  if (report.isOverdue) return "report_overdue";
  if (report.daysUntilDue !== null && report.daysUntilDue <= 3) return "report_due_3";
  if (report.isDueSoon) return "report_due_7";
  return "progress_report_ready";
}
