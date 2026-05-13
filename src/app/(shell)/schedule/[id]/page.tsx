import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessAttendanceModule,
  canRecordAttendanceForSession,
} from "@/lib/auth/attendance-permissions";
import {
  canAccessSessionNotesModule,
  canWriteSessionNotes,
} from "@/lib/auth/session-notes-permissions";
import { canAccessScheduleModule, canEditExistingSession } from "@/lib/auth/schedule-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getSessionById } from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import { sessionKindLabelEl, sessionStatusLabelEl } from "@/lib/ui/session-labels";

type SessionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessScheduleModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { session, error } = await getSessionById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Προβολή συνεδρίας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!session) {
    notFound();
  }

  const showEdit = canEditExistingSession(ctx.roleCodes, ctx.user?.id ?? null, session.therapist_user_id);
  const showAttendanceModule = canAccessAttendanceModule(ctx.roleCodes);
  const showAttendanceEdit = canRecordAttendanceForSession(
    ctx.roleCodes,
    ctx.user?.id ?? null,
    session.therapist_user_id
  );
  const showSessionNotes = canAccessSessionNotesModule(ctx.roleCodes) && session.status === "completed";
  const showSessionNotesWrite = showSessionNotes && canWriteSessionNotes(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Προβολή συνεδρίας"
        description="Στοιχεία ραντεβού και κατάσταση."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/schedule"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Πρόγραμμα
            </Link>
            {showEdit ? (
              <Link
                href={`/schedule/${session.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : null}
            {showAttendanceModule ? (
              <Link
                href={`/attendance/${session.id}`}
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Παρουσία
              </Link>
            ) : null}
            {showAttendanceEdit ? (
              <Link
                href={`/attendance/${session.id}/edit`}
                className="inline-flex rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800"
              >
                Καταχώρηση παρουσίας
              </Link>
            ) : null}
            {showSessionNotes ? (
              <Link
                href="/session-notes"
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Σημειώσεις
              </Link>
            ) : null}
            {showSessionNotesWrite ? (
              <Link
                href="/session-notes/new"
                className="inline-flex rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
              >
                Νέα σημείωση
              </Link>
            ) : null}
          </div>
        }
      />

      <dl className="mx-auto max-w-2xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailRow label="Παιδί" value={session.child_name} />
        <DetailRow label="Θεραπευτής" value={session.therapist_name ?? "—"} />
        <DetailRow label="Ειδικότητα / Τομέας" value={session.discipline_name_el ?? session.discipline_code} />
        <DetailRow label="Κέντρο / Τοποθεσία" value={session.center_name ?? "—"} />
        <DetailRow label="Αίθουσα" value={session.room_name ?? "—"} />
        <DetailRow
          label="Ημερομηνία"
          value={new Intl.DateTimeFormat("el-GR", {
            timeZone: "Europe/Athens",
            dateStyle: "full",
          }).format(new Date(session.starts_at))}
        />
        <DetailRow label="Ώρα έναρξης" value={formatAthensTimeEl(session.starts_at)} />
        <DetailRow label="Ώρα λήξης" value={formatAthensTimeEl(session.ends_at)} />
        <DetailRow label="Τύπος συνεδρίας" value={sessionKindLabelEl(session.session_kind)} />
        <DetailRow label="Κατάσταση" value={sessionStatusLabelEl(session.status)} />
        <DetailRow label="Σχόλια" value={session.internal_notes?.trim() ? session.internal_notes : "—"} multiline />
      </dl>
    </div>
  );
}

function DetailRow({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-ink-muted">{label}</dt>
      <dd className={`text-sm text-ink sm:col-span-2 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</dd>
    </div>
  );
}
