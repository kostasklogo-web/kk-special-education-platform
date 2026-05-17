import { Suspense } from "react";
import Link from "next/link";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { canMutateSecretaryRoute } from "@/lib/auth/secretary-permissions";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getSecretaryDemoBundle } from "@/lib/data/secretary/queries";
import { loadSecretaryScheduleAppointments } from "@/lib/data/secretary/schedule-load";
import { PageHeader } from "@/components/shell/PageHeader";
import { SecretaryScheduleWorkspace } from "@/components/secretary/schedule/SecretaryScheduleWorkspace";

function ScheduleFallback() {
  return <p className="py-12 text-center text-sm text-ink-muted">Φόρτωση προγράμματος…</p>;
}

export default async function SecretarySchedulePage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/schedule", ctx.roleCodes);
  const canMutate = canMutateSecretaryRoute("schedule", ctx.roleCodes);

  const { organizationId } = await getDefaultOrganizationIdForUser();
  const org = organizationId ?? "";
  const schedule = await loadSecretaryScheduleAppointments(org);
  const bundle = getSecretaryDemoBundle(schedule.organizationId);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Πρόγραμμα"
        description="Ημέρα, εβδομάδα ή μήνας — φίλτρα Νίκαια / Εύοσμος / Όμιλος, συγκρούσεις και γρήγορες ενέργειες."
        actions={
          <Link
            href="/schedule/control-center"
            className="hidden rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium hover:bg-surface-muted sm:inline-flex"
          >
            Control Center
          </Link>
        }
      />
      <Suspense fallback={<ScheduleFallback />}>
        <SecretaryScheduleWorkspace
          organizationId={schedule.organizationId}
          initialAppointments={schedule.appointments}
          dataSource={schedule.source}
          payments={bundle.payments}
          diagnoses={bundle.diagnoses}
          tasks={bundle.tasks}
          readOnly={!canMutate}
        />
      </Suspense>
    </div>
  );
}
