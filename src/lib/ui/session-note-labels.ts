import type { SessionNoteStatus } from "@/lib/data/session-notes/types";

export const SESSION_NOTE_STATUS_LABELS_EL: Record<SessionNoteStatus, string> = {
  draft: "Πρόχειρο",
  finalized: "Οριστικό",
};

export function sessionNoteStatusLabelEl(code: string | null | undefined): string {
  if (!code) return SESSION_NOTE_STATUS_LABELS_EL.draft;
  if (code in SESSION_NOTE_STATUS_LABELS_EL) {
    return SESSION_NOTE_STATUS_LABELS_EL[code as SessionNoteStatus];
  }
  return code;
}
