import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessRoomsModule, canWriteRooms } from "@/lib/auth/rooms-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import { getDefaultOrganizationIdForUser, listCentersForOrganization } from "@/lib/data/children/queries";
import { listRoomsForOrganization } from "@/lib/data/rooms/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { RoomsFiltersForm } from "@/components/rooms/rooms-filters-form";
import { RoomsTable } from "@/components/rooms/rooms-table";
import { parseRoomsSearchParams } from "@/lib/rooms/search-params";

type RoomsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RoomsPage({ searchParams }: RoomsPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessRoomsModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const search = parseRoomsSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Αίθουσες" />
        <EmptyState
          title="Δεν έχει ρυθμιστεί οργανισμός ανάπτυξης"
          description={orgErr ?? "Οι αίθουσες θα εμφανιστούν μόλις υπάρχουν demo δεδομένα οργανισμού και κέντρου."}
        />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return (
      <div>
        <PageHeader title="Αίθουσες" />
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα αιθουσών"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Οι αίθουσες παραμένουν διαθέσιμες ως κενή προβολή σε λειτουργία ανάπτυξης."
        />
      </div>
    );
  }

  const [dataRes, centersRes] = await Promise.all([
    listRoomsForOrganization({ organizationId, filters: search.filters }),
    listCentersForOrganization(organizationId),
  ]);

  const canWrite = canWriteRooms(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Αίθουσες"
        description="Διαχείριση αιθουσών ανά κέντρο. Οι επόπτες και οι θεραπευτές βλέπουν μόνο προβολή· η γραμματεία και η διοίκηση επεξεργάζονται εγγραφές (σύμφωνα με RLS κέντρων)."
        actions={
          canWrite ? (
            <Link
              href="/rooms/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Νέα αίθουσα
            </Link>
          ) : null
        }
      />

      {dataRes.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {dataRes.error}
        </div>
      ) : null}

      <RoomsFiltersForm search={search} centers={centersRes.centers} />

      <RoomsTable items={dataRes.items} canEdit={canWrite} />
    </div>
  );
}
