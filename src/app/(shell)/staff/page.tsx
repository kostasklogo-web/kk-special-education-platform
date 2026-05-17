import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessStaffModule, canWriteStaffRecord, isSupervisorStaffReadOnly } from "@/lib/auth/staff-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { getDefaultOrganizationIdForUser, listCentersForOrganization } from "@/lib/data/children/queries";
import { listDisciplines } from "@/lib/data/sessions/queries";
import {
  listStaffForOrganization,
  listSuperviseeUserIds,
} from "@/lib/data/staff/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { StaffFiltersForm } from "@/components/staff/staff-filters-form";
import { StaffTable } from "@/components/staff/staff-table";
import { parseStaffSearchParams } from "@/lib/staff/search-params";

type StaffPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessStaffModule(ctx.roleCodes)) {
    redirect("/");
  }

  const raw = await searchParams;
  const search = parseStaffSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Προσωπικό" />
        <EmptyState
          title="Δεν έχει ρυθμιστεί οργανισμός ανάπτυξης"
          description={orgErr ?? "Το προσωπικό θα εμφανιστεί μόλις υπάρχουν demo δεδομένα οργανισμού και κέντρου."}
        />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return (
      <div>
        <PageHeader title="Προσωπικό" />
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα προσωπικού"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Το προσωπικό παραμένει διαθέσιμο ως κενή προβολή σε λειτουργία ανάπτυξης."
        />
      </div>
    );
  }

  let restrictToUserIds: Set<string> | undefined;
  if (isSupervisorStaffReadOnly(ctx.roleCodes) && ctx.user) {
    const { ids, error: teamErr } = await listSuperviseeUserIds({
      organizationId,
      supervisorUserId: ctx.user.id,
    });
    if (teamErr) {
      return (
        <div>
          <PageHeader title="Προσωπικό" />
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
            {teamErr}
          </div>
        </div>
      );
    }
    restrictToUserIds = ids;
  }

  const [dataRes, centersRes, disciplinesRes] = await Promise.all([
    listStaffForOrganization({
      organizationId,
      filters: search.filters,
      ...(restrictToUserIds !== undefined ? { restrictToUserIds } : {}),
    }),
    listCentersForOrganization(organizationId),
    listDisciplines(),
  ]);

  const canWrite = canWriteStaffRecord(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Προσωπικό"
        description="Κατάλογος μελών με ρόλους και στοιχεία επικοινωνίας. Οι επόπτες βλέπουν την ομάδα εποπτείας· οι θεραπευτές μόνο το δικό τους προφίλ."
        actions={
          canWrite ? (
            <Link
              href="/staff/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Νέο μέλος προσωπικού
            </Link>
          ) : null
        }
      />

      {dataRes.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {dataRes.error}
        </div>
      ) : null}

      <StaffFiltersForm
        search={search}
        centers={centersRes.centers}
        disciplines={disciplinesRes.disciplines}
      />

      <StaffTable items={dataRes.items} canEdit={canWrite} />
    </div>
  );
}
