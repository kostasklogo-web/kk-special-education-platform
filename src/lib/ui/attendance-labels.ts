import type { AttendanceStatus } from "@/lib/data/attendance/types";

export const ATTENDANCE_STATUS_LABELS_EL: Record<AttendanceStatus, string> = {
  expected: "Δεν καταχωρήθηκε",
  present: "Παρών",
  absent: "Απών",
  cancel_parent: "Ακύρωση από γονέα",
  cancel_therapist: "Ακύρωση από θεραπευτή",
  cancel_center: "Ακύρωση από κέντρο",
  to_makeup: "Προς αναπλήρωση",
  made_up: "Αναπληρώθηκε",
};

export function attendanceStatusLabelEl(code: string | null | undefined): string {
  if (!code) return ATTENDANCE_STATUS_LABELS_EL.expected;
  if (code in ATTENDANCE_STATUS_LABELS_EL) {
    return ATTENDANCE_STATUS_LABELS_EL[code as AttendanceStatus];
  }
  return code;
}
