import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessAttendanceModule,
  canRecordAttendanceForSession,
} from "@/lib/auth/attendance-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getAttendanceDetail } from "@/lib/data/attendance/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";
import { attendanceStatusLabelEl } from "@/lib/ui/attendance-labels";
import { sessionStatusLabelEl } from "@/lib/ui/session-labels";

type AttendanceDetailPageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function AttendanceDetailPage({ params }: AttendanceDetailPageProps) {
  const { sessionId } = await params;
  const ctx = await getSessionContext();
  if (!canAccessAttendanceModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { detail, error } = await getAttendanceDetail(sessionId);
  if (error) {
    return (
      <div>
        <PageHeader title="Προβολή παρουσίας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!detail) {
    notFound();
  }

  const { session, attendance, recorded_by_name } = detail;
  const showEdit = canRecordAttendanceForSession(
    ctx.roleCodes,
    ctx.user?.id ?? null,
    session.therapist_user_id
  );

  const startDisplay = attendance?.actual_starts_at ?? session.starts_at;
  const endDisplay = attendance?.actual_ends_at ?? session.ends_at;

  const recordedAt = attendance?.updated_at ?? attendance?.created_at ?? null;

  return (
    <div>
      <PageHeader
        title="Προβολή παρουσίας"
        description="Στοιχεία παρουσίας για την επιλεγμένη συνεδρία."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/attendance"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Παρουσιολόγιο
            </Link>
            <Link
              href={`/schedule/${session.id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Πρόγραμμα
            </Link>
            {showEdit ? (
              <Link
                href={`/attendance/${session.id}/edit`}
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία παρουσίας
              </Link>
            ) : null}
          </div>
        }
      />

      {!attendance ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Δεν υπάρχει ακόμη καταχώρηση παρουσίας για αυτή τη συνεδρία.
          {showEdit ? (
            <>
              {" "}
              <Link href={`/attendance/${session.id}/edit`} className="font-semibold text-clinical-800 underline">
                Μετάβαση στην καταχώρηση
              </Link>
            </>
          ) : null}
        </div>
      ) : null}

      <dl className="mx-auto max-w-2xl divide-y divide-border rounded-xl border border-border bg-surface-card shadow-shell">
        <DetailRow label="Συνεδρία" value={`${session.discipline_name_el ?? session.discipline_code} · ${sessionStatusLabelEl(session.status)}`} />
        <DetailRow label="Παιδί" value={session.child_name} />
        <DetailRow label="Θεραπευτής" value={session.therapist_name ?? "—"} />
        <DetailRow
          label="Ημερομηνία"
          value={new Intl.DateTimeFormat("el-GR", {
            timeZone: "Europe/Athens",
            dateStyle: "full",
          }).format(new Date(session.starts_at))}
        />
        <DetailRow
          label="Κατάσταση παρουσίας"
          value={attendanceStatusLabelEl(attendance?.status ?? "expected")}
        />
        <DetailRow label="Ώρα έναρξης" value={formatAthensTimeEl(startDisplay)} />
        <DetailRow label="Ώρα λήξης" value={formatAthensTimeEl(endDisplay)} />
        <DetailRow label="Σχόλια" value={attendance?.notes?.trim() ? attendance.notes : "—"} multiline />
        <DetailRow label="Καταχωρήθηκε από" value={recorded_by_name ?? "—"} />
        <DetailRow
          label="Ημερομηνία καταχώρησης"
          value={
            recordedAt
              ? new Intl.DateTimeFormat("el-GR", {
                  timeZone: "Europe/Athens",
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(recordedAt))
              : "—"
          }
        />
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
