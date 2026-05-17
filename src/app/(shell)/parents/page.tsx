import Link from "next/link";
import { ParentListTable } from "@/components/parents/parent-list-table";
import { ParentSearchBar } from "@/components/parents/parent-search-bar";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import {
  canAccessParentsModule,
  canMutateParents,
  canViewParentsReadOnly,
} from "@/lib/auth/parents-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { listParents } from "@/lib/data/parents/queries";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { redirect } from "next/navigation";

type ParentsPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ParentsPage({ searchParams }: ParentsPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessParentsModule(ctx.roleCodes)) {
    redirect("/");
  }

  const { q } = await searchParams;
  const canMutate = canMutateParents(ctx.roleCodes);
  const readOnly = canViewParentsReadOnly(ctx.roleCodes) && !canMutate;
  const supabaseUnavailable = AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly());
  const { items, error } = supabaseUnavailable
    ? { items: [], error: null }
    : await listParents({ search: q });

  return (
    <div>
      <PageHeader
        title="Λίστα γονέων / κηδεμόνων"
        description="Διαχείριση στοιχείων επικοινωνίας και συνδέσεων με παιδιά. Η πρόσβαση σε εγγραφές ελέγχεται από Supabase RLS."
        actions={
          canMutate ? (
            <Link
              href="/parents/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Προσθήκη γονέα
            </Link>
          ) : null
        }
      />

      {readOnly ? (
        <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950">
          <strong>Προβολή μόνο:</strong> Ο ρόλος σας επιτρέπει ανάγνωση (επόπτης / θεραπευτής). Η προσθήκη και η
          επεξεργασία απαιτεί <strong>γραμματεία</strong> ή <strong>διοίκηση</strong>. Οι θεραπευτές βλέπουν μόνο
          γονείς συνδεδεμένους με παιδιά της ομάδας τους.
        </div>
      ) : null}

      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {error}
        </div>
      ) : null}

      <div className="mb-6">
        <ParentSearchBar defaultQuery={q} />
      </div>

      {supabaseUnavailable ? (
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα γονέων"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Η σελίδα παραμένει διαθέσιμη σε λειτουργία ανάπτυξης."
        />
      ) : (
        <ParentListTable items={items} canMutate={canMutate} />
      )}
    </div>
  );
}
