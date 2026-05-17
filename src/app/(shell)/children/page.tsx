import Link from "next/link";
import { ChildListTable } from "@/components/children/child-list-table";
import { ChildSearchBar } from "@/components/children/child-search-bar";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { canMutateChildren } from "@/lib/auth/children-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { listChildren } from "@/lib/data/children/queries";
import { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-child-profile-demo";
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

  const listedCount = items.length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Μητρώο ωφελούμενων"
        title="Παιδιά και πρόγραμμα"
        description="Κεντρικό μητρώο ωφελούμενων ανά οργανισμό και κέντρο λειτουργίας. Η πρόσβαση στις εγγραφές ρυθμίζεται από τους ρόλους και τις πολιτικές ασφαλείας της βάσης."
        meta={
          !supabaseUnavailable && !error ? (
            <span>
              Εμφανίζονται <strong className="font-semibold text-ink-muted">{listedCount}</strong> εγγραφές
              {q ? (
                <>
                  {" "}
                  για «<span className="font-medium text-ink">{q}</span>»
                </>
              ) : null}
              .
            </span>
          ) : null
        }
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
        <div className="rounded-xl border border-sky-200/90 bg-gradient-to-r from-sky-50 to-white px-4 py-3 text-sm leading-relaxed text-sky-950 shadow-sm">
          <strong className="font-semibold">Λειτουργία προβολής:</strong> Ο ρόλος σας επιτρέπει μόνο ανάγνωση (π.χ. θεραπευτής ή
          επόπτης). Η προσθήκη και η επεξεργασία φακέλων απαιτεί <strong>γραμματεία</strong> ή <strong>διοίκηση</strong>.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm" role="alert">
          {error}
        </div>
      ) : null}

      <ChildSearchBar defaultQuery={q} />

      {supabaseUnavailable ? (
        <div className="space-y-4">
          <EmptyState
            title="Δεν είναι διαθέσιμο το μητρώο παιδιών"
            description="Η σύνδεση με τη βάση Supabase δεν απαντά. Μπορείτε να ανοίξετε το πρωτότυπο κλινικού προφίλ με ενδεικτικά δεδομένα."
          />
          <Link
            href={`/children/${DEMO_CLINICAL_CHILD_ID}`}
            className="inline-flex rounded-xl bg-clinical-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-clinical-700"
          >
            Προβολή κλινικού προφίλ (πρωτότυπο) →
          </Link>
        </div>
      ) : (
        <ChildListTable items={items} canMutate={canMutate} />
      )}
    </div>
  );
}
