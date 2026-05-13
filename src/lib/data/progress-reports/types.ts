export type ProgressReportFilters = {
  childId?: string | null;
  /** When "open", matches draft / pending / pending_review (operational queue). */
  status?: string | null;
};

export type ProgressReportListItem = {
  id: string;
  organization_id: string;
  child_id: string;
  child_name: string;
  title: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  summary: string | null;
  updated_at: string;
};
