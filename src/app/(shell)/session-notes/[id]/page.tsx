import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessSessionNotesModule,
  canEditSessionNote,
} from "@/lib/auth/session-notes-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getSessionNoteById } from "@/lib/data/session-notes/queries";
import { getTherapyGoalTitlesByIds } from "@/lib/data/therapy-goals/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import { sessionNoteStatusLabelEl } from "@/lib/ui/session-note-labels";

type SessionNoteDetailPageProps = {
  params: Promise<{ id: string }>;
};

function DetailBlock({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className={`text-sm text-ink sm:col-span-2 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
    </div>
  );
}

export default async function SessionNoteDetailPage({ params }: SessionNoteDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessSessionNotesModule(ctx.roleCodes)) {
    redirect("/");
  }

  const { note, session, author_display_name, error } = await getSessionNoteById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Προβολή σημείωσης" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!note || !session) {
    notFound();
  }

  const showEdit = canEditSessionNote(
    ctx.roleCodes,
    ctx.user?.id ?? null,
    session.therapist_user_id,
    note.author_user_id
  );

  const sessionNotCompleted = session.status !== "completed";

  const linkedIds = note.linked_goal_ids ?? [];
  const { titles: linkedGoalTitles, error: linkedGoalsErr } = await getTherapyGoalTitlesByIds(linkedIds);

  return (
    <div>
      <PageHeader
        title="Προβολή σημείωσης"
        description="Κλινική σημείωση συνδεδεμένη με συνεδρία."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/session-notes"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
            <Link
              href={`/schedule/${session.id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Συνεδρία
            </Link>
            {showEdit ? (
              <Link
                href={`/session-notes/${note.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : null}
          </div>
        }
      />

      {sessionNotCompleted ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Η συνεδρία δεν είναι πλέον σε κατάσταση «ολοκληρωμένη». Η σημείωση παραμένει για ιστορικό.
        </div>
      ) : null}

      <dl className="mx-auto max-w-3xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailBlock
          label="Συνεδρία"
          value={`Σύνδεση με προγραμματισμένη συνεδρία (${session.discipline_name_el ?? session.discipline_code})`}
        />
        <DetailBlock label="Παιδί" value={session.child_name} />
        <DetailBlock label="Θεραπευτής" value={session.therapist_name ?? "—"} />
        <DetailBlock
          label="Ημερομηνία"
          value={new Intl.DateTimeFormat("el-GR", {
            timeZone: "Europe/Athens",
            dateStyle: "full",
          }).format(new Date(session.starts_at))}
        />
        <DetailBlock label="Ώρα έναρξης" value={formatAthensTimeEl(session.starts_at)} />
        <DetailBlock label="Ώρα λήξης" value={formatAthensTimeEl(session.ends_at)} />
        <DetailBlock label="Τομέας / Ειδικότητα" value={session.discipline_name_el ?? session.discipline_code} />
        <DetailBlock label="Κατάσταση σημείωσης" value={sessionNoteStatusLabelEl(note.status)} />
        <DetailBlock label="Στόχοι που δουλεύτηκαν (κείμενο)" value={note.goals_worked.trim() ? note.goals_worked : "—"} multiline />
        {linkedGoalsErr ? (
          <div className="px-4 py-3 text-sm text-red-800">{linkedGoalsErr}</div>
        ) : linkedIds.length > 0 ? (
          <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-ink-muted">Συνδεδεμένοι θεραπευτικοί στόχοι</dt>
            <dd className="text-sm text-ink sm:col-span-2">
              <ul className="list-inside list-disc space-y-1">
                {linkedIds.map((gid) => {
                  const t = linkedGoalTitles.get(gid);
                  return (
                    <li key={gid}>
                      {t ? (
                        <Link href={`/therapy-goals/${gid}`} className="text-clinical-700 hover:underline">
                          {t}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">— ({gid})</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </dd>
          </div>
        ) : (
          <DetailBlock label="Συνδεδεμένοι θεραπευτικοί στόχοι" value="—" />
        )}
        <DetailBlock label="Δραστηριότητες" value={note.activities.trim() ? note.activities : "—"} multiline />
        <DetailBlock label="Ανταπόκριση παιδιού" value={note.child_response.trim() ? note.child_response : "—"} multiline />
        <DetailBlock label="Παρατηρήσεις" value={note.observations.trim() ? note.observations : "—"} multiline />
        <DetailBlock
          label="Προτάσεις για επόμενη συνεδρία"
          value={note.suggestions_next.trim() ? note.suggestions_next : "—"}
          multiline
        />
        <DetailBlock
          label="Ορατό σε επόπτη"
          value={note.visible_to_supervisor ? "Ναι" : "Όχι"}
        />
        <DetailBlock label="Ορατό σε γονέα (αποθηκευμένο)" value={note.visible_to_parent ? "Ναι" : "Όχι"} />
        <DetailBlock label="Συγγραφέας" value={author_display_name ?? "—"} />
        <DetailBlock
          label="Τελευταία ενημέρωση"
          value={new Intl.DateTimeFormat("el-GR", {
            timeZone: "Europe/Athens",
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(note.updated_at))}
        />
        {note.body.trim() ? (
          <DetailBlock label="Επιπλέον σύνοψη" value={note.body} multiline />
        ) : null}
      </dl>
    </div>
  );
}
