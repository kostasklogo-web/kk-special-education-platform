import type { DiagnosisDocument } from "@/lib/secretary/types";

export type DiagnosisWarningLevel = "none" | "yellow" | "red";

export type DiagnosisWarningSummary = {
  level: DiagnosisWarningLevel;
  title: string;
  detail: string;
};

export function worstDiagnosisForChild(
  docs: DiagnosisDocument[],
  childId: string
): DiagnosisDocument | null {
  const forChild = docs.filter((d) => d.childId === childId && !d.archived);
  if (forChild.length === 0) return null;

  const expired = forChild.filter((d) => d.daysUntilExpiry < 0 && d.renewalRequired && !d.renewedAt);
  if (expired.length > 0) {
    return expired.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)[0];
  }

  const soon = forChild.filter((d) => d.daysUntilExpiry <= 30 && d.renewalRequired && !d.renewedAt);
  if (soon.length > 0) {
    return soon.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)[0];
  }

  return null;
}

export function diagnosisWarningSummary(doc: DiagnosisDocument): DiagnosisWarningSummary {
  if (doc.daysUntilExpiry < 0 && doc.renewalRequired && !doc.renewedAt) {
    return {
      level: "red",
      title: "Προσοχή: Υπάρχει ληγμένη γνωμάτευση",
      detail: `${doc.documentType} — έληξε ${doc.expiryDate}`,
    };
  }
  if (doc.daysUntilExpiry <= 30 && doc.renewalRequired && !doc.renewedAt) {
    return {
      level: "yellow",
      title: "Η γνωμάτευση λήγει σύντομα",
      detail: `${doc.documentType} — λήγει ${doc.expiryDate} (${doc.daysUntilExpiry} ημέρες)`,
    };
  }
  return { level: "none", title: "", detail: "" };
}
