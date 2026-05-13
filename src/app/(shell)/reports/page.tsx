import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessSessionNotesModule } from "@/lib/auth/session-notes-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { listProgressReportsForOrganization } from "@/lib/data/progress-reports/queries";
import { listChildrenOptionsForOrganization } from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { ProgressReportsFiltersForm } from "@/components/progress-reports/progress-reports-filters-form";
import { ProgressReportsTable } from "@/components/progress-reports/progress-reports-table";
import { parseReportsSearchParams } from "@/lib/progress-reports/search-params";

type ReportsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessSessionNotesModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const search = parseReportsSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader
          eyebrow="Αναφορές"
          title="Αναφορές προόδου"
          description="Έγγραφα προς γονείς και φορείς· κατάσταση πρόχειρου και έγκρισης."
        />
        <EmptyState title="Δεν έχει ρυθμιστεί οργανισμός" description={orgErr ?? "Ρυθμίστε οργανισμό επίδειξης για να φορτώσουν οι αναφορές."} />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return (
      <div>
        <PageHeader eyebrow="Αναφορές" title="Αναφορές προόδου" />
        <EmptyState
          title="Δεν υπάρχουν ακόμη δεδομένα"
          description="Η τοπική βάση Supabase δεν απαντά. Οι αναφορές θα εμφανιστούν μετά το seed."
        />
      </div>
    );
  }

  const [dataRes, childrenRes] = await Promise.all([
    listProgressReportsForOrganization({ organizationId, filters: search.filters }),
    listChildrenOptionsForOrganization(organizationId),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Κλινική & γραμματεία"
        title="Αναφορές προόδου"
        description="Λίστα αναφορών ανά παιδί και κατάσταση. Η γραμματεία παρακολουθεί την ουρά εκκρεμοτήτων πριν την κοινοποίηση· οι επόπτες ελέγχουν περιεχόμενο και μορφή."
        actions={
          <Link
            href="/dashboard"
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Πίνακας
          </Link>
        }
      />

      {dataRes.error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {dataRes.error}
        </div>
      ) : null}

      <ProgressReportsFiltersForm search={search} childOptions={childrenRes.children} />

      <ProgressReportsTable items={dataRes.items} />
    </div>
  );
}
