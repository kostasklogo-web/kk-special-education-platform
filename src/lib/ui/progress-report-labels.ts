const STATUS_EL: Record<string, string> = {
  draft: "Πρόχειρο",
  approved: "Εγκεκριμένο",
  pending: "Σε αναμονή",
  pending_review: "Προς έλεγχο",
};

export function progressReportStatusLabelEl(status: string): string {
  return STATUS_EL[status] ?? status;
}
