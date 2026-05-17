import { PageHeader } from "@/components/shell/PageHeader";
import { GdprSettingsWorkspace } from "@/components/gdpr/GdprSettingsWorkspace";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";

export default async function GdprSettingsPage() {
  const ctx = await getSessionContext();
  const { organizationId } = await getDefaultOrganizationIdForUser();
  const org = organizationId ?? "";

  return (
    <div>
      <PageHeader
        title="GDPR & Απόρρητο"
        description="Συγκαταθέσεις, πολιτικές διατήρησης, νομική βάση επεξεργασίας και καταγραφή ενεργειών (audit log)."
      />
      <GdprSettingsWorkspace roleCodes={ctx.roleCodes} organizationId={org} />
    </div>
  );
}
