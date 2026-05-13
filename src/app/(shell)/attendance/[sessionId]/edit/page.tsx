import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessAttendanceModule,
  canRecordAttendanceForSession,
} from "@/lib/auth/attendance-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getAttendanceDetail } from "@/lib/data/attendance/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { AttendanceFormClient } from "@/components/attendance/attendance-form-client";
import { upsertAttendanceAction } from "@/app/(shell)/attendance/actions";

type EditAttendancePageProps = {
  params: Promise<{ sessionId: string }>;
};

export default async function EditAttendancePage({ params }: EditAttendancePageProps) {
  const { sessionId } = await params;
  const ctx = await getSessionContext();
  if (!canAccessAttendanceModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { detail, error } = await getAttendanceDetail(sessionId);
  if (error) {
    return (
      <div>
        <PageHeader title="Καταχώρηση παρουσίας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!detail) {
    notFound();
  }

  const { session, attendance } = detail;

  if (
    !canRecordAttendanceForSession(ctx.roleCodes, ctx.user?.id ?? null, session.therapist_user_id)
  ) {
    redirect(`/attendance/${sessionId}`);
  }

  return (
    <div>
      <PageHeader
        title="Καταχώρηση παρουσίας"
        description={`${session.child_name} · ${session.therapist_name ?? "—"} · ${new Intl.DateTimeFormat("el-GR", {
          timeZone: "Europe/Athens",
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(session.starts_at))}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/attendance/${session.id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Ακύρωση
            </Link>
          </div>
        }
      />

      <AttendanceFormClient
        action={upsertAttendanceAction}
        sessionId={session.id}
        sessionStartsAtIso={session.starts_at}
        sessionEndsAtIso={session.ends_at}
        existing={attendance}
      />
    </div>
  );
}
