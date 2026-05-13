import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessStaffModule,
  canManageStaffRoles,
  canWriteStaffRecord,
} from "@/lib/auth/staff-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser, listCentersForOrganization } from "@/lib/data/children/queries";
import { listDisciplines } from "@/lib/data/sessions/queries";
import { listEligibleUsersForNewStaff, listStaffForOrganization } from "@/lib/data/staff/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { StaffFormClient } from "@/components/staff/staff-form-client";
import { createStaffAction } from "@/app/(shell)/staff/actions";

export default async function NewStaffPage() {
  const ctx = await getSessionContext();
  if (!canAccessStaffModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  if (!canWriteStaffRecord(ctx.roleCodes)) {
    redirect("/staff");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Νέο μέλος προσωπικού" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  const [eligibleRes, centersRes, disciplinesRes, supervisorsRes] = await Promise.all([
    listEligibleUsersForNewStaff(organizationId),
    listCentersForOrganization(organizationId),
    listDisciplines(),
    listStaffForOrganization({
      organizationId,
      filters: { roleCode: "SUPERVISOR" },
    }),
  ]);

  const supervisorOptions = supervisorsRes.items.map((s) => ({
    user_id: s.user_id,
    label: `${s.first_name} ${s.last_name}`.trim() || s.user_id,
  }));

  const loadErr =
    eligibleRes.error ?? centersRes.error ?? disciplinesRes.error ?? supervisorsRes.error;

  return (
    <div>
      <PageHeader
        title="Νέο μέλος προσωπικού"
        description="Επιλέξτε χρήστη που έχει ήδη ρόλο στον οργανισμό αλλά δεν έχει εγγραφή προσωπικού. Η πρόσκληση νέου λογαριασμού γίνεται μέσω Supabase Auth / διαχείρισης."
        actions={
          <Link
            href="/staff"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Λίστα προσωπικού
          </Link>
        }
      />

      {loadErr ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr}
        </div>
      ) : null}

      <StaffFormClient
        mode="create"
        action={createStaffAction}
        organizationId={organizationId}
        centers={centersRes.centers}
        disciplines={disciplinesRes.disciplines}
        supervisorOptions={supervisorOptions}
        canManageRoles={canManageStaffRoles(ctx.roleCodes)}
        eligibleUsers={eligibleRes.users}
      />
    </div>
  );
}
