import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { DiagnosesWorkspace } from "@/components/secretary/diagnoses/DiagnosesWorkspace";

export default async function SecretaryDiagnosesPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/diagnoses", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Γνωματεύσεις"
        description="Παρακολούθηση λήξεων, ανανεώσεων, εγγράφων και υπενθυμίσεων σε γονείς."
      />
      <DiagnosesWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
