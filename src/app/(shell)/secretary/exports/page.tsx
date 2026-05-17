import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getSecretaryDemoBundle } from "@/lib/data/secretary/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { ExportButtons } from "@/components/secretary/ExportButtons";
import Link from "next/link";

export default async function SecretaryExportsPage() {
  const { organizationId } = await getDefaultOrganizationIdForUser();
  const bundle = getSecretaryDemoBundle(organizationId ?? "");

  const paymentRows = bundle.payments.map((p) => [
    p.childLabel,
    String(p.balance),
    p.dueDate,
    p.paymentStatus,
  ]);
  const taskRows = bundle.tasks.map((t) => [t.title, t.status, t.dueDate ?? ""]);
  const diagRows = bundle.diagnoses.map((d) => [d.childLabel, d.expiryDate, d.status]);

  return (
    <div>
      <PageHeader
        eyebrow="Γραμματεία"
        title="Εξαγωγές"
        description="CSV (Excel) για υπόλοιπα, εργασίες, διαγνώσεις. PDF προγράμματος μέσω Control Center."
      />
      <ExportButtons
        exports={[
          {
            filename: "unpaid-balances.csv",
            headers: ["Παιδί", "Υπόλοιπο", "Λήξη", "Κατάσταση"],
            rows: paymentRows,
          },
          {
            filename: "pending-tasks.csv",
            headers: ["Εργασία", "Κατάσταση", "Προθεσμία"],
            rows: taskRows,
          },
          {
            filename: "diagnosis-renewal.csv",
            headers: ["Παιδί", "Λήξη", "Κατάσταση"],
            rows: diagRows,
          },
        ]}
      />
      <p className="mt-6 text-sm text-ink-muted">
        <Link href="/schedule/control-center" className="font-medium text-clinical-700 hover:underline">
          Ημερήσιο/εβδομαδιαίο πρόγραμμα PDF → Control Center (εκτύπωση browser)
        </Link>
      </p>
    </div>
  );
}
