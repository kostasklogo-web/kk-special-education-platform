import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { PageHeader } from "@/components/shell/PageHeader";
import { TasksWorkspace } from "@/components/secretary/tasks/TasksWorkspace";

export default async function SecretaryTasksPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/tasks", ctx.roleCodes);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Εκκρεμότητες"
        description="Κέντρο ελέγχου καθημερινών εργασιών — δημιουργία, ανάθεση, παρακολούθηση και ολοκλήρωση."
      />
      <TasksWorkspace roleCodes={ctx.roleCodes} />
    </div>
  );
}
