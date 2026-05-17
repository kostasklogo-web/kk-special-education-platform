import { getSessionContext } from "@/lib/auth/get-session-context";
import { requireSecretaryPath } from "@/lib/auth/require-secretary-route";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getSecretaryDashboard, getSecretaryDemoBundle } from "@/lib/data/secretary/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { SecretaryDashboardClient } from "@/components/secretary/dashboard/SecretaryDashboardClient";

export default async function SecretaryDashboardPage() {
  const ctx = await getSessionContext();
  requireSecretaryPath("/secretary/dashboard", ctx.roleCodes);

  const { organizationId } = await getDefaultOrganizationIdForUser();
  const org = organizationId ?? "";
  const { data, source } = await getSecretaryDashboard(org);
  const bundle = getSecretaryDemoBundle(org);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Κεντρικός Πίνακας Γραμματείας"
        description="Ενιαίος επιχειρησιακός έλεγχος — πρόγραμμα, πληρωμές, εργασίες, επικοινωνίες, διαγνώσεις, αναφορές, υπενθυμίσεις, συναντήσεις και GDPR."
        meta={source === "demo" ? "Demo δεδομένα" : "Σύνδεση βάσης"}
      />
      <SecretaryDashboardClient
        data={data}
        appointments={bundle.appointments}
        payments={bundle.payments}
        diagnoses={bundle.diagnoses}
        tasks={bundle.tasks}
        communications={bundle.communications}
        reports={bundle.reports}
        intakes={bundle.intakes}
        consents={bundle.consents}
      />
    </div>
  );
}
