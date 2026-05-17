/** Client-safe types for therapist caseload UI (no server-only). */

export type TherapistCaseloadItem = {
  childId: string;
  childLabel: string;
  disciplineLabel: string | null;
  startsAtLabel: string;
  assignmentId: string;
};
