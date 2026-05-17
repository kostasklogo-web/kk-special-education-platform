import Link from "next/link";
import { PageHeader } from "@/components/shell/PageHeader";

function PlaceholderCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface-muted/20 p-5">
      <h2 className="text-sm font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-xs text-ink-muted">{description}</p>
      <p className="mt-3 text-xs font-medium text-ink-faint">Σύντομα</p>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Ρυθμίσεις"
        description="Διαχείριση κέντρων και βασικών παραμέτρων οργανισμού (MVP). Η πρόσβαση περιορίζεται σε διοίκηση και γραμματεία."
      />

      <section className="mb-10">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Λειτουργία</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/settings/centers"
            className="rounded-xl border border-border bg-surface-card p-5 shadow-shell transition hover:border-clinical-300"
          >
            <h2 className="text-base font-semibold text-ink">Κέντρα / Τοποθεσίες</h2>
            <p className="mt-2 text-sm text-ink-muted">Λίστα, στοιχεία επικοινωνίας και κατάσταση κέντρων.</p>
          </Link>
          <Link
            href="/settings/gdpr"
            className="rounded-xl border border-clinical-200 bg-clinical-50/40 p-5 shadow-shell transition hover:border-clinical-400"
          >
            <h2 className="text-base font-semibold text-ink">GDPR & Απόρρητο</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Συγκαταθέσεις, διατήρηση δεδομένων, audit log, νομική βάση και πολιτικές εξαγωγής.
            </p>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">Πρότυπα (MVP)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <PlaceholderCard
            title="Ρόλοι & Δικαιώματα"
            description="Χαρτογράφηση ρόλων χρηστών και δικαιωμάτων ανά λειτουργία."
          />
          <PlaceholderCard title="Ειδικότητες" description="Διαχείριση καταλόγου ειδικοτήτων θεραπείας." />
          <PlaceholderCard title="Τύποι Συνεδριών" description="Κωδικοί και ετικέτες τύπων συνεδρίας." />
          <PlaceholderCard title="Καταστάσεις Παρουσιών" description="Καταστάσεις παρουσίας και επιτρεπόμενες μεταβάσεις." />
          <PlaceholderCard
            title="Βασικές Ρυθμίσεις Πλατφόρμας"
            description="Ζώνη ώρας, γλώσσα προεπιλογής, ειδοποιήσεις (χωρίς χρέωση / ενσωματώσεις στο MVP)."
          />
        </div>
      </section>
    </div>
  );
}
