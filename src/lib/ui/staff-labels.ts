import type { EmploymentStatus } from "@/lib/data/staff/types";

export const EMPLOYMENT_STATUS_LABELS_EL: Record<EmploymentStatus, string> = {
  active: "Ενεργός",
  inactive: "Ανενεργός",
  on_leave: "Σε άδεια",
};

export function employmentStatusLabelEl(code: EmploymentStatus | string): string {
  return EMPLOYMENT_STATUS_LABELS_EL[code as EmploymentStatus] ?? String(code);
}
