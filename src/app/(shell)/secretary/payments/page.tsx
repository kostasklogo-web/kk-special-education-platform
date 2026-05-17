import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { PaymentsWorkspace } from "@/components/secretary/payments/PaymentsWorkspace";

export default async function SecretaryPaymentsPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/payments", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Πληρωμές & Οφειλές"
        description="Καταχώριση πληρωμών, παρακολούθηση υπολοίπων, καθυστερήσεις και υπενθυμίσεις σε γονείς."
      />
      <PaymentsWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
