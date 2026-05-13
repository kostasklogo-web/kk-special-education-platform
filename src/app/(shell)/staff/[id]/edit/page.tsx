import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessStaffModule,
  canManageStaffRoles,
  canWriteStaffRecord,
} from "@/lib/auth/staff-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser, listCentersForOrganization } from "@/lib/data/children/queries";
import { listDisciplines } from "@/lib/data/sessions/queries";
import { getStaffById, listStaffForOrganization } from "@/lib/data/staff/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { StaffFormClient } from "@/components/staff/staff-form-client";
import { updateStaffAction } from "@/app/(shell)/staff/actions";

type EditStaffPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditStaffPage({ params }: EditStaffPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessStaffModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  if (!canWriteStaffRecord(ctx.roleCodes)) {
    redirect(`/staff/${id}`);
  }

  const { item, error: loadErr } = await getStaffById(id);
  if (loadErr) {
    return (
      <div>
        <PageHeader title="Επεξεργασία προσωπικού" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr}
        </div>
      </div>
    );
  }
  if (!item) {
    notFound();
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId || organizationId !== item.organization_id) {
    return (
      <div>
        <PageHeader title="Επεξεργασία προσωπικού" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  const [centersRes, disciplinesRes, supervisorsRes] = await Promise.all([
    listCentersForOrganization(organizationId),
    listDisciplines(),
    listStaffForOrganization({
      organizationId,
      filters: { roleCode: "SUPERVISOR" },
    }),
  ]);

  const supervisorOptions = supervisorsRes.items
    .filter((s) => s.user_id !== item.user_id)
    .map((s) => ({
      user_id: s.user_id,
      label: `${s.first_name} ${s.last_name}`.trim() || s.user_id,
    }));

  const loadErr2 =
    centersRes.error ?? disciplinesRes.error ?? supervisorsRes.error;

  return (
    <div>
      <PageHeader
        title="Επεξεργασία προσωπικού"
        description={`${item.first_name} ${item.last_name}`.trim()}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/staff/${id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Ακύρωση
            </Link>
            <Link
              href="/staff"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
          </div>
        }
      />

      {loadErr2 ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {loadErr2}
        </div>
      ) : null}

      <StaffFormClient
        mode="edit"
        action={updateStaffAction}
        organizationId={organizationId}
        centers={centersRes.centers}
        disciplines={disciplinesRes.disciplines}
        supervisorOptions={supervisorOptions}
        canManageRoles={canManageStaffRoles(ctx.roleCodes)}
        staffId={item.id}
        defaultValues={{
          user_id: item.user_id,
          first_name: item.first_name,
          last_name: item.last_name,
          work_email: item.work_email,
          phone: item.phone,
          role_code: item.role_code ?? "THERAPIST",
          primary_center_id: item.primary_center_id,
          discipline_code: item.discipline_code,
          supervisor_user_id: item.supervisor_user_id,
          employment_status: item.employment_status,
          hire_date: item.hire_date,
          observations: item.observations,
        }}
      />
    </div>
  );
}
