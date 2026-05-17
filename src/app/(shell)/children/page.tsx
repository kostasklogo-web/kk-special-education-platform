import Link from "next/link";
import { ChildListTable } from "@/components/children/child-list-table";
import { ChildSearchBar } from "@/components/children/child-search-bar";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { canMutateChildren } from "@/lib/auth/children-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { filterChildrenForClinicalScope } from "@/lib/clinical/access/filter-children-list";
import { loadClinicalAccessScope } from "@/lib/clinical/access/load-clinical-access-scope";
import { shouldUseClinicalAccessDemoFallback } from "@/lib/clinical/access/clinical-access-demo-fallback";
import { getDefaultOrganizationIdForUser, listChildren } from "@/lib/data/children/queries";
import { DEMO_CLINICAL_CHILD_ID } from "@/lib/demo/clinical-demo-ids";
import { getDemoChildrenListStubs } from "@/lib/demo/demo-children-registry";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";

type ChildrenPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ChildrenPage({ searchParams }: ChildrenPageProps) {
  const { q } = await searchParams;
  const ctx = await getSessionContext();
  const canMutate = canMutateChildren(ctx.roleCodes);
  const useClinicalDemo = await shouldUseClinicalAccessDemoFallback();
  const supabaseUnavailable =
    AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly());

  let rawItems: Awaited<ReturnType<typeof listChildren>>["items"] = [];
  let error: string | null = null;
  if (!(supabaseUnavailable && !useClinicalDemo)) {
    const listed = await listChildren({ search: q }).catch(() => ({
      items: [] as Awaited<ReturnType<typeof listChildren>>["items"],
      error: null as string | null,
    }));
    rawItems = listed.items;
    error = listed.error;
  }

  if (useClinicalDemo && rawItems.length === 0) {
    rawItems = getDemoChildrenListStubs();
    error = null;
  }

  const { organizationId } = await getDefaultOrganizationIdForUser();
  const clinicalScope = await loadClinicalAccessScope({
    organizationId: organizationId ?? "",
    userId: ctx.user?.id ?? null,
    roleCodes: ctx.roleCodes,
  });

  const items = filterChildrenForClinicalScope(rawItems, clinicalScope);
  const listedCount = items.length;
  const showClinicalPrototypeBanner = useClinicalDemo || supabaseUnavailable;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Μητρώο ωφελούμενων"
        title="Παιδιά — κλινική caseload"
        description="Κλινικό μητρώο ωφελούμενων. Η πρόσβαση βασίζεται σε ενεργές αναθέσεις θεραπευτή–παιδιού (όχι ιστορικό συνεδριών)."
        meta={
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
        }
        actions={
          canMutate && !useClinicalDemo ? (
            <Link
              href="/children/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Προσθήκη παιδιού
            </Link>
          ) : null
        }
      />

      {showClinicalPrototypeBanner ? (
        <div className="rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-white px-4 py-3 text-sm leading-relaxed text-amber-950 shadow-sm">
          <strong className="font-semibold">Πρωτότυπο κλινικού μητρώου:</strong> Ενδεικτικά παιδιά με
          ενεργές αναθέσεις. Ανοίξτε φάκελο από τον πίνακα ή{" "}
          <Link href={`/children/${DEMO_CLINICAL_CHILD_ID}`} className="font-semibold text-clinical-700 underline">
            κύριο demo παιδί
          </Link>
          .
        </div>
      ) : null}

      {!canMutate ? (
        <div className="rounded-xl border border-sky-200/90 bg-gradient-to-r from-sky-50 to-white px-4 py-3 text-sm leading-relaxed text-sky-950 shadow-sm">
          <strong className="font-semibold">Λειτουργία προβολής:</strong> Ο ρόλος σας επιτρέπει μόνο ανάγνωση.
          {clinicalScope.assignedChildIds.length > 0 ? (
            <>
              {" "}
              Εμφανίζονται μόνο παιδιά με <strong>ενεργή κλινική ανάθεση</strong> (
              {clinicalScope.assignedChildIds.length}).
            </>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm" role="alert">
          {error}
        </div>
      ) : null}

      <ChildSearchBar defaultQuery={q} />

      {items.length === 0 ? (
        <EmptyState
          title="Δεν βρέθηκαν παιδιά"
          description={
            useClinicalDemo
              ? "Δεν υπάρχουν παιδιά στο πεδίο αναζήτησης ή δεν έχετε ενεργή ανάθεση."
              : "Δοκιμάστε άλλη αναζήτηση ή επικοινωνήστε με τον επόπτη."
          }
        />
      ) : (
        <ChildListTable items={items} canMutate={canMutate && !useClinicalDemo} />
      )}
    </div>
  );
}
