import type { ChildParentRelationshipCode } from "@/lib/data/parents/types";

export const RELATIONSHIP_LABELS_EL: Record<ChildParentRelationshipCode, string> = {
  mother: "Μητέρα",
  father: "Πατέρας",
  guardian: "Κηδεμόνας",
  other: "Άλλο",
};

export function relationshipLabelEl(code: string | null | undefined): string {
  if (!code) return RELATIONSHIP_LABELS_EL.guardian;
  if (code in RELATIONSHIP_LABELS_EL) {
    return RELATIONSHIP_LABELS_EL[code as ChildParentRelationshipCode];
  }
  return code;
}
