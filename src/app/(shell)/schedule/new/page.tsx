import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessScheduleModule, canMutateSchedule } from "@/lib/auth/schedule-permissions";
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
} from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { SessionFormClient } from "@/components/schedule/session-form-client";
import { createSessionAction } from "@/app/(shell)/schedule/actions";

export default async function NewSessionPage() {
  const ctx = await getSessionContext();
  if (!canAccessScheduleModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  if (!canMutateSchedule(ctx.roleCodes)) {
    redirect("/schedule");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Νέα συνεδρία" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
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
        title="Νέα συνεδρία"
        description="Δημιουργία νέας εγγραφής συνεδρίας. Ο έλεγχος διαθεσιμότητας (θεραπευτής, αίθουσα, παιδί) εκτελείται πριν την αποθήκευση."
        actions={
          <Link
            href="/schedule"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Επιστροφή στο πρόγραμμα
          </Link>
        }
      />

      {loadErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr}
        </div>
      ) : null}

      {centersRes.centers.length === 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Δεν υπάρχουν κέντρα για τον οργανισμό. Προσθέστε κέντρο πριν δημιουργήσετε συνεδρία.
        </div>
      ) : (
        <SessionFormClient
          mode="create"
          action={createSessionAction}
          organizationId={organizationId}
          centers={centersRes.centers}
          rooms={roomsRes.rooms}
          therapists={therapistsRes.therapists}
          childOptions={childrenRes.children}
          disciplines={disciplinesRes.disciplines}
        />
      )}
    </div>
  );
}
