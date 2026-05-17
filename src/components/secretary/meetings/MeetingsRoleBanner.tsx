import type { MeetingsRoleView } from "@/lib/secretary/meetings/meeting-queries";

const LABELS: Record<MeetingsRoleView, string> = {
  secretary: "",
  supervisor: "Προβολή επόπτη — κλινικές συναντήσεις & εποπτείες",
  clinical_director: "Προβολή κλινικού διευθυντή — όλες οι κλινικές συναντήσεις",
  ceo: "Προβολή διοίκησης — όλες οι συναντήσεις & έκτακτα θέματα",
  therapist: "Προβολή συμμετοχής — συναντήσεις όπου συμμετέχετε",
};

export function MeetingsRoleBanner({ view }: { view: MeetingsRoleView }) {
  const text = LABELS[view];
  if (!text) return null;
  return (
    <p className="rounded-lg border border-clinical-200 bg-clinical-50 px-3 py-2 text-sm text-clinical-900">
      {text}
    </p>
  );
}
