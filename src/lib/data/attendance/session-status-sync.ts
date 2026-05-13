import type { SessionStatus } from "@/lib/data/sessions/types";
import type { AttendanceStatus } from "@/lib/data/attendance/types";

/** When attendance is saved (non-expected), optionally align session.status for MVP workflow. */
export function sessionStatusFromAttendanceStatus(
  attendanceStatus: AttendanceStatus
): SessionStatus | null {
  switch (attendanceStatus) {
    case "expected":
      return null;
    case "present":
    case "made_up":
      return "completed";
    case "absent":
      return "absence";
    case "cancel_parent":
    case "cancel_therapist":
    case "cancel_center":
      return "cancelled";
    case "to_makeup":
      return "to_reschedule";
    default:
      return null;
  }
}
