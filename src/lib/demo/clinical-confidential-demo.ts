/**
 * Demo confidential / restricted clinical notes (prototype, client-safe).
 */

export type DemoConfidentialNote = {
  id: string;
  tier: "supervisor_only" | "confidential" | "management_clinical";
  tierLabelEl: string;
  title: string;
  excerpt: string;
  authorLabel: string;
  occurredAtYmd: string;
  notParentVisible: true;
};

export function getDemoConfidentialNotes(_childId: string): DemoConfidentialNote[] {
  const notes: DemoConfidentialNote[] = [
    {
      id: "conf-demo-1",
      tier: "confidential",
      tierLabelEl: "Εμπιστευτικό",
      title: "Συμπεριφορικό επεισόδιο — εσωτερική καταγραφή",
      excerpt:
        "Καταγραφή λεπτομερούς επεισοδίου αυτορρύθμισης χωρίς κοινοποίηση σε γονείς. Συντονισμός με επόπτη και ψυχολόγο.",
      authorLabel: "Ελένη Κωνσταντίνου · Λογοθεραπεία",
      occurredAtYmd: "2026-04-28",
      notParentVisible: true,
    },
    {
      id: "conf-demo-2",
      tier: "supervisor_only",
      tierLabelEl: "Μόνο επόπτης",
      title: "Εποπτεία — ανησυχία για οικογενειακό stress",
      excerpt:
        "Οι γονείς ανέφεραν ένταση στο σπίτι. Δεν τεκμηριώνεται άμεσος κίνδυνος· παρακολούθηση και κοινό πλάνο με Κοινωνικό.",
      authorLabel: "Επόπτης Demo",
      occurredAtYmd: "2026-04-20",
      notParentVisible: true,
    },
    {
      id: "conf-demo-3",
      tier: "management_clinical",
      tierLabelEl: "Διοίκηση / ΚΔ",
      title: "Εσωτερική σύσταση — συχνότητα συνεδριών",
      excerpt:
        "Πρόταση αναθεώρησης συχνότητας OT μετά από κοινή αξιολόγηση ομάδας. Δεν προορίζεται για γονικό portal.",
      authorLabel: "Κλινικός διευθυντής",
      occurredAtYmd: "2026-04-15",
      notParentVisible: true,
    },
  ];
  return notes;
}
