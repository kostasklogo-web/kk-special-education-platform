import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessSettingsAndCentersModule,
  canManageCenters,
  isReceptionCentersReadOnly,
} from "@/lib/auth/settings-centers-permissions";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { listCentersForSettings } from "@/lib/data/centers/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { CentersTable } from "@/components/settings/centers-table";

export default async function CentersSettingsPage() {
  const ctx = await getSessionContext();
  if (!canAccessSettingsAndCentersModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Κέντρα / Τοποθεσίες" />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {orgErr ?? "Δεν βρέθηκε οργανισμός."}
        </div>
      </div>
    );
  }

  const { items, error } = await listCentersForSettings({ organizationId });
  const canEdit = canManageCenters(ctx.roleCodes);
  const readOnlyNote = isReceptionCentersReadOnly(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Κέντρα / Τοποθεσίες"
        description={
          readOnlyNote
            ? "Προβολή κέντρων στα οποία έχετε πρόσβαση. Η επεξεργασία γίνεται μόνο από τη διοίκηση."
            : "Διαχείριση κέντρων του οργανισμού· συνδέονται με αίθουσες, προσωπικό και πρόγραμμα."
        }
        actions={
          canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Link
                href="/settings"
                className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Ρυθμίσεις
              </Link>
              <Link
                href="/settings/centers/new"
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Νέο κέντρο
              </Link>
            </div>
          ) : (
            <Link
              href="/settings"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Ρυθμίσεις
            </Link>
          )
        }
      />

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      ) : null}

      <CentersTable items={items} canEdit={canEdit} />
    </div>
  );
}
