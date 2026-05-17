import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { CommunicationsWorkspace } from "@/components/secretary/communications/CommunicationsWorkspace";

export default async function SecretaryCommunicationsPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/communications", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Επικοινωνίες"
        description="Επίσημο ημερολόγιο επικοινωνιών — καταχώριση, παρακολούθηση και follow-up με γονείς, σχολεία και γιατρούς."
      />
      <CommunicationsWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
