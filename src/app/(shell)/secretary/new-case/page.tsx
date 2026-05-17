import { getSessionContext } from "@/lib/auth/get-session-context";
import { canMutateSecretaryRoute } from "@/lib/auth/secretary-permissions";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { NewCaseWorkspace } from "@/components/secretary/intake/NewCaseWorkspace";

export default async function SecretaryNewCasePage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/new-case", ctx.roleCodes);
  const canMutate = canMutateSecretaryRoute("new-case", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Νέο Περιστατικό"
        description="Φόρμα intake: νέος ωφελούμενος, προγραμματισμός αξιολόγησης/ιστορικού και υπενθύμιση παρακολούθησης."
      />
      {canMutate ? (
        <NewCaseWorkspace />
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Η φόρμα intake είναι διαθέσιμη μόνο στη γραμματεία και τη διοίκηση.
        </p>
      )}
    </div>
  );
}
