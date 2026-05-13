import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessSessionNotesModule,
  canWriteSessionNotes,
} from "@/lib/auth/session-notes-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { listCompletedSessionsWithoutNote } from "@/lib/data/session-notes/queries";
import { listTherapyGoalsForSessionNoteSelection } from "@/lib/data/therapy-goals/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { SessionNoteFormClient } from "@/components/session-notes/session-note-form-client";
import { createSessionNoteAction } from "@/app/(shell)/session-notes/actions";

export default async function NewSessionNotePage() {
  const ctx = await getSessionContext();
  if (!canAccessSessionNotesModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  if (!canWriteSessionNotes(ctx.roleCodes)) {
    redirect("/session-notes");
  }
  if (!ctx.user) {
    redirect("/login");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Νέα σημείωση συνεδρίας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  const { items: eligible, error } = await listCompletedSessionsWithoutNote({
    organizationId,
    userId: ctx.user.id,
    roleCodes: ctx.roleCodes,
  });

  const childIds = [...new Set(eligible.map((s) => s.child_id))];
  const goalsPairs = await Promise.all(
    childIds.map(async (cid) => {
      const { goals, error: gErr } = await listTherapyGoalsForSessionNoteSelection(cid);
      return { cid, goals, error: gErr };
    })
  );
  const goalsLoadErr = goalsPairs.find((p) => p.error)?.error ?? null;
  const goalsByChildId = Object.fromEntries(goalsPairs.map((p) => [p.cid, p.goals]));

  return (
    <div>
      <PageHeader
        title="Νέα σημείωση συνεδρίας"
        description="Επιλέξτε ολοκληρωμένη συνεδρία χωρίς υπάρχουσα σημείωση. Μία ενεργή σημείωση ανά συνεδρία."
        actions={
          <Link
            href="/session-notes"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Λίστα σημειώσεων
          </Link>
        }
      />

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      ) : null}

      {goalsLoadErr ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950" role="alert">
          {goalsLoadErr} (Η φόρμα εμφανίζεται· χωρίς λίστα στόχων για σύνδεση.)
        </div>
      ) : null}

      <SessionNoteFormClient
        mode="create"
        action={createSessionNoteAction}
        eligibleSessions={eligible}
        goalsByChildId={goalsByChildId}
      />
    </div>
  );
}
