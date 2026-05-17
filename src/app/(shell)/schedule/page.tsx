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
    redirect("/");
  }

  const raw = await searchParams;
  const search = parseScheduleSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader
          eyebrow="Πρόγραμμα"
          title="Συνεδρίες"
          description="Η προβολή ενεργοποιείται αφού ρυθμιστεί ο οργανισμός επίδειξης και τα κέντρα στη βάση."
        />
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
        <PageHeader eyebrow="Πρόγραμμα" title="Συνεδρίες" />
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Πρόγραμμα λειτουργίας"
        title="Συνεδρίες"
        description="Ημερήσια, εβδομαδιαία και λίστα συνεδριών ανά κέντρο, θεραπευτή, ωφελούμενο και ειδικότητα. Η πρόσβαση και οι αλλαγές ελέγχονται από τους ρόλους και τις πολιτικές της βάσης."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/schedule/control-center"
              className="rounded-lg border border-clinical-200 bg-clinical-50 px-4 py-2 text-sm font-semibold text-clinical-900 shadow-sm hover:bg-clinical-100/80"
            >
              Κεντρικός Πίνακας
            </Link>
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

      <div className="space-y-4 rounded-2xl border border-border bg-gradient-to-b from-surface-card to-surface-muted/25 p-4 shadow-shell sm:p-5">
        <ScheduleViewTabs search={search} />
        <ScheduleDateNav search={search} />
      </div>

      {sessionsRes.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm" role="alert">
          {sessionsRes.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5">
        <ScheduleFiltersForm
          search={search}
          centers={centersRes.centers}
          therapists={therapistsRes.therapists}
          childOptions={childrenRes.children}
          rooms={roomsRes.rooms}
          disciplines={disciplinesRes.disciplines}
        />
      </div>

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
