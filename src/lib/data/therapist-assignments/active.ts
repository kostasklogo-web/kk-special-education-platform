import type { TherapistChildAssignment } from "./types";

/** Active assignment: status active and within start/end window. */
export function isAssignmentActive(
  row: Pick<TherapistChildAssignment, "status" | "startsAt" | "endsAt">,
  at: Date = new Date()
): boolean {
  if (row.status !== "active") return false;
  const t = at.getTime();
  if (new Date(row.startsAt).getTime() > t) return false;
  if (row.endsAt && new Date(row.endsAt).getTime() <= t) return false;
  return true;
}

export function filterActiveAssignments(
  rows: TherapistChildAssignment[],
  at: Date = new Date()
): TherapistChildAssignment[] {
  return rows.filter((r) => isAssignmentActive(r, at));
}
