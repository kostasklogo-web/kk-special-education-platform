import type { CommunicationTypeCode } from "@/lib/secretary/types";

/** Map secretary task type codes to communication log type codes. */
export function taskTypeToCommunicationType(taskTypeCode: string): CommunicationTypeCode {
  switch (taskTypeCode) {
    case "call_school":
      return "school_call";
    case "call_doctor":
      return "doctor_call";
    case "call_teacher":
      return "teacher_call";
    case "call_parallel":
      return "parallel_support_call";
    case "call_partner":
      return "partner_call";
    case "send_message":
      return "email";
    case "no_show_followup":
      return "parent_call";
    default:
      return "parent_call";
  }
}
