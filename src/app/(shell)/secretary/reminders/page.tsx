import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { RemindersWorkspace } from "@/components/secretary/reminders/RemindersWorkspace";

export default async function SecretaryRemindersPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/reminders", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Υπενθυμίσεις"
        description="Κεντρικό κέντρο υπενθυμίσεων — ραντεβού, πληρωμές, γνωματεύσεις, αναφορές και follow-up με καταγραφή επικοινωνίας."
      />
      <RemindersWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
