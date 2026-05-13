import Link from "next/link";
import { ChildListTable } from "@/components/children/child-list-table";
import { ChildSearchBar } from "@/components/children/child-search-bar";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { canMutateChildren } from "@/lib/auth/children-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { listChildren } from "@/lib/data/children/queries";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";

type ChildrenPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ChildrenPage({ searchParams }: ChildrenPageProps) {
  const { q } = await searchParams;
  const ctx = await getSessionContext();
  const canMutate = canMutateChildren(ctx.roleCodes);
  const supabaseUnavailable = AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly());
  const { items, error } = supabaseUnavailable
    ? { items: [], error: null }
    : await listChildren({ search: q });

  return (
    <div>
      <PageHeader
        title="Λίστα παιδιών"
        description="Διαχείριση ωφελούμενων ανά οργανισμό και κέντρο. Η πρόσβαση σε εγγραφές ελέγχεται από Supabase RLS και το ρόλο σας."
        actions={
          canMutate ? (
            <Link
              href="/children/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Προσθήκη παιδιού
            </Link>
          ) : null
        }
      />

      {!canMutate ? (
        <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <strong>Προβολή:</strong> Ο ρόλος σας επιτρέπει μόνο ανάγνωση (π.χ. θεραπευτής ή επόπτης). Η
          προσθήκη και η επεξεργασία παιδιών απαιτεί <strong>γραμματεία</strong> ή <strong>διοίκηση</strong>.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mb-6">
        <ChildSearchBar defaultQuery={q} />
      </div>

      {supabaseUnavailable ? (
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα παιδιών"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Η σελίδα παραμένει διαθέσιμη σε λειτουργία ανάπτυξης."
        />
      ) : (
        <ChildListTable items={items} canMutate={canMutate} />
      )}
    </div>
  );
}
