import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  canAccessSettingsAndCentersModule,
  canManageCenters,
} from "@/lib/auth/settings-centers-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getCenterById } from "@/lib/data/centers/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { CenterFormClient } from "@/components/settings/center-form-client";
import { updateCenterAction } from "@/app/(shell)/settings/centers/actions";

type EditCenterPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditCenterPage({ params }: EditCenterPageProps) {
  const { id } = await params;
  const ctx = await getSessionContext();
  if (!canAccessSettingsAndCentersModule(ctx.roleCodes)) {
    redirect("/");
  }
  if (!canManageCenters(ctx.roleCodes)) {
    redirect(`/settings/centers/${id}`);
  }

  const { center, error: cErr } = await getCenterById(id);
  if (cErr) {
    return (
      <div>
        <PageHeader title="Επεξεργασία κέντρου" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {cErr}
        </div>
      </div>
    );
  }
  if (!center) {
    notFound();
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId || organizationId !== center.organization_id) {
    return (
      <div>
        <PageHeader title="Επεξεργασία κέντρου" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Επεξεργασία κέντρου"
        description={center.name}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/settings/centers/${id}`}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Ακύρωση
            </Link>
            <Link
              href="/settings/centers"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Λίστα
            </Link>
          </div>
        }
      />

      <CenterFormClient
        mode="edit"
        action={updateCenterAction}
        organizationId={organizationId}
        centerId={center.id}
        defaultValues={{
          name: center.name,
          address_line: center.address_line,
          city: center.city,
          phone: center.phone,
          contact_email: center.contact_email,
          description: center.description,
          is_active: center.is_active,
        }}
      />
    </div>
  );
}
