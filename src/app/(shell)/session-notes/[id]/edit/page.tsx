import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessSessionNotesModule,
  canEditSessionNote,
} from "@/lib/auth/session-notes-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getSessionNoteById } from "@/lib/data/session-notes/queries";
import { listTherapyGoalsForSessionNoteSelection } from "@/lib/data/therapy-goals/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { SessionNoteFormClient } from "@/components/session-notes/session-note-form-client";
import { updateSessionNoteAction } from "@/app/(shell)/session-notes/actions";

type EditSessionNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSessionNotePage({ params }: EditSessionNotePageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessSessionNotesModule(ctx.roleCodes)) {
    redirect("/");
  }

  const { note, session, error } = await getSessionNoteById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Επεξεργασία σημείωσης" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!note || !session) {
    notFound();
  }

  if (!canEditSessionNote(ctx.roleCodes, ctx.user?.id ?? null, session.therapist_user_id, note.author_user_id)) {
    redirect(`/session-notes/${id}`);
  }

  const { goals: goalOptions, error: goalsErr } = await listTherapyGoalsForSessionNoteSelection(session.child_id);
  const goalsByChildId = { [session.child_id]: goalOptions };

  if (session.status !== "completed") {
    return (
      <div>
        <PageHeader title="Επεξεργασία σημείωσης" />
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Η συνεδρία δεν είναι ολοκληρωμένη· η κλινική επεξεργασία σημείωσης δεν επιτρέπεται από την εφαρμογή.
        </div>
        <Link href={`/session-notes/${id}`} className="mt-4 inline-block text-sm text-clinical-700 hover:underline">
          Προβολή σημείωσης
        </Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Επεξεργασία σημείωσης"
        description={`${session.child_name} · ${new Intl.DateTimeFormat("el-GR", {
          timeZone: "Europe/Athens",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(session.starts_at))}`}
        actions={
          <Link
            href={`/session-notes/${note.id}`}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Ακύρωση
          </Link>
        }
      />

      {goalsErr ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
          {goalsErr}
        </div>
      ) : null}

      <SessionNoteFormClient
        mode="edit"
        action={updateSessionNoteAction}
        eligibleSessions={[session]}
        goalsByChildId={goalsByChildId}
        existing={note}
        noteId={note.id}
      />
    </div>
  );
}
