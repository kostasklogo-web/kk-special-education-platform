import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { MeetingsWorkspace } from "@/components/secretary/meetings/MeetingsWorkspace";

export default async function SecretaryMeetingsPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/meetings", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Εποπτείες / Συναντήσεις"
        description="Προγραμματισμός εποπτείας, εσωτερικών και διοικητικών συναντήσεων — πρακτικά, αποφάσεις και follow-up."
      />
      <MeetingsWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
