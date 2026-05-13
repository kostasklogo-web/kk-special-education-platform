import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessScheduleModule, canEditExistingSession } from "@/lib/auth/schedule-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import {
  getDefaultOrganizationIdForUser,
  listCentersForOrganization,
} from "@/lib/data/children/queries";
import {
  listChildrenOptionsForOrganization,
  listDisciplines,
  listRoomsForOrganization,
  listTherapistsForOrganization,
  getSessionById,
} from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { SessionFormClient } from "@/components/schedule/session-form-client";
import { updateSessionAction } from "@/app/(shell)/schedule/actions";

type EditSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessScheduleModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { session, error } = await getSessionById(id);
  if (error) {
    return (
      <div>
        <PageHeader title="Επεξεργασία συνεδρίας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      </div>
    );
  }
  if (!session) {
    notFound();
  }

  if (!canEditExistingSession(ctx.roleCodes, ctx.user?.id ?? null, session.therapist_user_id)) {
    redirect(`/schedule/${id}`);
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId || organizationId !== session.organization_id) {
    return (
      <div>
        <PageHeader title="Επεξεργασία συνεδρίας" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Μη έγκυρος οργανισμός για τη φόρμα."}
        </div>
      </div>
    );
  }

  const [centersRes, therapistsRes, childrenRes, roomsRes, disciplinesRes] = await Promise.all([
    listCentersForOrganization(organizationId),
    listTherapistsForOrganization(organizationId),
    listChildrenOptionsForOrganization(organizationId),
    listRoomsForOrganization(organizationId),
    listDisciplines(),
  ]);

  const loadErr =
    centersRes.error ??
    therapistsRes.error ??
    childrenRes.error ??
    roomsRes.error ??
    disciplinesRes.error;

  return (
    <div>
      <PageHeader
        title="Επεξεργασία συνεδρίας"
        description="Ενημέρωση στοιχείων συνεδρίας. Οι συγκρούσεις ωρών ελέγχονται αυτόματα."
        actions={
          <Link
            href={`/schedule/${session.id}`}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Ακύρωση
          </Link>
        }
      />

      {loadErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr}
        </div>
      ) : null}

      <SessionFormClient
        mode="edit"
        action={updateSessionAction}
        organizationId={organizationId}
        centers={centersRes.centers}
        rooms={roomsRes.rooms}
        therapists={therapistsRes.therapists}
        childOptions={childrenRes.children}
        disciplines={disciplinesRes.disciplines}
        defaultValues={{
          sessionId: session.id,
          center_id: session.center_id,
          room_id: session.room_id,
          child_id: session.child_id,
          therapist_user_id: session.therapist_user_id,
          discipline_code: session.discipline_code,
          session_kind: session.session_kind,
          status: session.status,
          starts_at: session.starts_at,
          ends_at: session.ends_at,
          internal_notes: session.internal_notes,
        }}
      />
    </div>
  );
}
