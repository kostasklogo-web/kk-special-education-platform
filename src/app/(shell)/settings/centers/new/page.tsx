import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessSettingsAndCentersModule,
  canManageCenters,
} from "@/lib/auth/settings-centers-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { CenterFormClient } from "@/components/settings/center-form-client";
import { createCenterAction } from "@/app/(shell)/settings/centers/actions";

export default async function NewCenterPage() {
  const ctx = await getSessionContext();
  if (!canAccessSettingsAndCentersModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }
  if (!canManageCenters(ctx.roleCodes)) {
    redirect("/settings/centers");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Νέο κέντρο" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Νέο κέντρο"
        description="Το κέντρο συνδέεται με αίθουσες, προγραμματισμό και εμβέλεια χρηστών (μέσω RLS)."
        actions={
          <Link
            href="/settings/centers"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Λίστα κέντρων
          </Link>
        }
      />

      <CenterFormClient mode="create" action={createCenterAction} organizationId={organizationId} />
    </div>
  );
}
