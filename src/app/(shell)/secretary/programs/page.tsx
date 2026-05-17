import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getSecretaryDemoBundle } from "@/lib/data/secretary/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { SimpleTable } from "@/components/secretary/SimpleTable";
import type { CaseProgram } from "@/lib/secretary/types";

const STATUS_LABELS: Record<CaseProgram["status"], string> = {
  active: "Ενεργό",
  paused: "Σε παύση",
  completed: "Ολοκληρωμένο",
  archived: "Αρχειοθετημένο",
};

export default async function SecretaryProgramsPage() {
  const { organizationId } = await getDefaultOrganizationIdForUser();
  const { programs } = getSecretaryDemoBundle(organizationId ?? "");

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Προγράμματα παιδιών"
        description="Εβδομαδιαίο πρόγραμμα θεραπείας: υπηρεσία, συχνότητα, θεραπευτές, πακέτο πληρωμής, παύση/διακοπή."
      />
      <SimpleTable<CaseProgram>
        rows={programs}
        columns={[
          { key: "child", header: "Παιδί", render: (p) => p.childLabel },
          { key: "service", header: "Υπηρεσία", render: (p) => p.serviceTypeLabel },
          { key: "freq", header: "Φορές/εβδ.", render: (p) => String(p.frequencyPerWeek) },
          { key: "start", header: "Έναρξη", render: (p) => p.startDate },
          {
            key: "therapists",
            header: "Θεραπευτές",
            render: (p) => p.therapistLabels.join(", "),
          },
          {
            key: "package",
            header: "Πακέτο",
            render: (p) => p.paymentPackageLabel ?? "—",
          },
          {
            key: "status",
            header: "Κατάσταση",
            render: (p) => STATUS_LABELS[p.status],
            alertLevel: (p) => (p.status === "paused" ? "yellow" : p.status === "active" ? "green" : undefined),
          },
        ]}
      />
    </div>
  );
}
