import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessScheduleModule, canMutateSchedule } from "@/lib/auth/schedule-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import {
  getDefaultOrganizationIdForUser,
  listCentersForOrganization,
} from "@/lib/data/children/queries";
import {
  listChildrenOptionsForOrganization,
  listDisciplines,
  listRoomsForOrganization,
  listSessionsInRange,
  listTherapistsForOrganization,
} from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { ScheduleDateNav } from "@/components/schedule/schedule-date-nav";
import { ScheduleFiltersForm } from "@/components/schedule/schedule-filters-form";
import { ScheduleDayPanel, ScheduleListPanel, ScheduleWeekPanel } from "@/components/schedule/schedule-panels";
import { ScheduleViewTabs } from "@/components/schedule/schedule-view-tabs";
import { athensDayRange, athensWeekRangeFromWeekContaining } from "@/lib/schedule/range";
import { buildScheduleHref, parseScheduleSearchParams } from "@/lib/schedule/search-params";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

type SchedulePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SchedulePage({ searchParams }: SchedulePageProps) {
  const ctx = await getSessionContext();
  if (!canAccessScheduleModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const search = parseScheduleSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Πρόγραμμα συνεδριών" />
        <EmptyState
          title="Δεν έχει ρυθμιστεί οργανισμός ανάπτυξης"
          description={orgErr ?? "Το πρόγραμμα θα εμφανιστεί μόλις υπάρχουν demo δεδομένα οργανισμού και κέντρου."}
        />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return (
      <div>
        <PageHeader title="Πρόγραμμα συνεδριών" />
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα προγράμματος"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Το πρόγραμμα παραμένει διαθέσιμο ως κενή προβολή σε λειτουργία ανάπτυξης."
        />
      </div>
    );
  }

  const range =
    search.view === "day"
      ? athensDayRange(search.dateYmd)
      : athensWeekRangeFromWeekContaining(search.dateYmd);

  const [
    sessionsRes,
    centersRes,
    therapistsRes,
    childrenRes,
    roomsRes,
    disciplinesRes,
  ] = await Promise.all([
    listSessionsInRange({
      organizationId,
      fromIso: range.fromIso,
      toIso: range.toIso,
      filters: search.filters,
    }),
    listCentersForOrganization(organizationId),
    listTherapistsForOrganization(organizationId),
    listChildrenOptionsForOrganization(organizationId),
    listRoomsForOrganization(organizationId),
    listDisciplines(),
  ]);

  const canNew = canMutateSchedule(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Πρόγραμμα συνεδριών"
        description="Προβολή και διαχείριση συνεδριών ανά κέντρο, θεραπευτή και παιδί. Η πρόσβαση ελέγχεται από τους ρόλους και το Supabase RLS."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildScheduleHref({
                view: search.view,
                dateYmd: todayAthensYmd(),
                filters: search.filters,
              })}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Σήμερα
            </Link>
            {canNew ? (
              <Link
                href="/schedule/new"
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Νέα συνεδρία
              </Link>
            ) : null}
          </div>
        }
      />

      <ScheduleViewTabs search={search} />
      <ScheduleDateNav search={search} />

      {sessionsRes.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {sessionsRes.error}
        </div>
      ) : null}

      <ScheduleFiltersForm
        search={search}
        centers={centersRes.centers}
        therapists={therapistsRes.therapists}
        childOptions={childrenRes.children}
        rooms={roomsRes.rooms}
        disciplines={disciplinesRes.disciplines}
      />

      {search.view === "week" ? (
        <ScheduleWeekPanel items={sessionsRes.items} anchorYmd={search.dateYmd} />
      ) : null}
      {search.view === "day" ? (
        <ScheduleDayPanel items={sessionsRes.items} dayYmd={search.dateYmd} />
      ) : null}
      {search.view === "list" ? <ScheduleListPanel items={sessionsRes.items} /> : null}
    </div>
  );
}
