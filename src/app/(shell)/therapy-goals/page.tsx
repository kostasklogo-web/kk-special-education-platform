import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessTherapyGoalsModule,
  canWriteTherapyGoals,
} from "@/lib/auth/therapy-goals-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import {
  getDefaultOrganizationIdForUser,
} from "@/lib/data/children/queries";
import { listTherapyGoalsForOrganization } from "@/lib/data/therapy-goals/queries";
import {
  listChildrenOptionsForOrganization,
  listDisciplines,
  listTherapistsForOrganization,
} from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { TherapyGoalsFiltersForm } from "@/components/therapy-goals/therapy-goals-filters-form";
import { TherapyGoalsTable } from "@/components/therapy-goals/therapy-goals-table";
import { buildTherapyGoalsHref, parseTherapyGoalsSearchParams } from "@/lib/therapy-goals/search-params";

type TherapyGoalsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TherapyGoalsPage({ searchParams }: TherapyGoalsPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessTherapyGoalsModule(ctx.roleCodes)) {
    redirect("/");
  }

  const raw = await searchParams;
  const search = parseTherapyGoalsSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Θεραπευτικοί στόχοι" />
        <EmptyState
          title="Δεν έχει ρυθμιστεί οργανισμός ανάπτυξης"
          description={orgErr ?? "Οι θεραπευτικοί στόχοι θα εμφανιστούν μόλις υπάρχουν demo δεδομένα οργανισμού, παιδιών και θεραπευτικών πλάνων."}
        />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return (
      <div>
        <PageHeader title="Θεραπευτικοί στόχοι" />
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα στόχων"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Οι στόχοι παραμένουν διαθέσιμοι ως κενή προβολή σε λειτουργία ανάπτυξης."
        />
      </div>
    );
  }

  const [dataRes, therapistsRes, childrenRes, disciplinesRes] = await Promise.all([
    listTherapyGoalsForOrganization({ organizationId, filters: search.filters }),
    listTherapistsForOrganization(organizationId),
    listChildrenOptionsForOrganization(organizationId),
    listDisciplines(),
  ]);

  const canWrite = canWriteTherapyGoals(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Θεραπευτικοί στόχοι"
        description="Στόχοι ανά παιδί και θεραπευτικό πλάνο. Η γραμματεία έχει βασική προβολή χωρίς κλινική επεξεργασία."
        actions={
          canWrite ? (
            <Link
              href="/therapy-goals/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Νέος θεραπευτικός στόχος
            </Link>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link
          href={buildTherapyGoalsHref({ status: "active" })}
          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Ενεργοί στόχοι
        </Link>
        <Link
          href={buildTherapyGoalsHref({ status: "in_progress" })}
          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Σε εξέλιξη
        </Link>
        <Link
          href={buildTherapyGoalsHref({ status: "on_hold" })}
          className="rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink shadow-sm hover:bg-surface-muted"
        >
          Σε αναμονή
        </Link>
        <Link
          href={buildTherapyGoalsHref({})}
          className="rounded-full border border-clinical-200 bg-clinical-50/60 px-3 py-1.5 text-xs font-semibold text-clinical-900 shadow-sm hover:bg-clinical-100/80"
        >
          Όλοι οι στόχοι
        </Link>
      </div>

      {dataRes.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {dataRes.error}
        </div>
      ) : null}

      <TherapyGoalsFiltersForm
        search={search}
        therapists={therapistsRes.therapists}
        childOptions={childrenRes.children}
        disciplines={disciplinesRes.disciplines}
      />

      <TherapyGoalsTable items={dataRes.items} canEdit={canWrite} />
    </div>
  );
}
