/** Client-safe demo identifiers (no server-only imports). */

export const DEMO_CLINICAL_CHILD_ID = "20000000-0000-4000-8000-000000000101";

export const DEMO_CLINICAL_CHILD_B_ID = "20000000-0000-4000-8000-000000000102";

const DEMO_CLINICAL_CHILD_IDS = new Set([DEMO_CLINICAL_CHILD_ID, DEMO_CLINICAL_CHILD_B_ID]);

export function isDemoClinicalChildId(childId: string): boolean {
  return DEMO_CLINICAL_CHILD_IDS.has(childId);
}

export function listDemoClinicalChildIds(): string[] {
  return [DEMO_CLINICAL_CHILD_ID, DEMO_CLINICAL_CHILD_B_ID];
}
