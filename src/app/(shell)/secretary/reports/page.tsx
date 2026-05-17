import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { ReportsWorkspace } from "@/components/secretary/reports/ReportsWorkspace";

export default async function SecretaryReportsPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/reports", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Αιτήματα Αναφορών"
        description="Δημιουργία, παρακολούθηση, έλεγχος και παράδοση αναφορών — από αίτημα έως τελική παράδοση."
      />
      <ReportsWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
