import Link from "next/link";
import { redirect } from "next/navigation";
import {
  canAccessAttendanceModule,
  canRecordAttendanceForSession,
} from "@/lib/auth/attendance-permissions";
import { AUTH_GATING_TEMPORARILY_DISABLED, getSessionContext } from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import {
  getDefaultOrganizationIdForUser,
  listCentersForOrganization,
} from "@/lib/data/children/queries";
import { listSessionsWithAttendance } from "@/lib/data/attendance/queries";
import {
  listChildrenOptionsForOrganization,
  listTherapistsForOrganization,
} from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { AttendanceDateNav } from "@/components/attendance/attendance-date-nav";
import { AttendanceDayPanel, AttendanceWeekListPanel } from "@/components/attendance/attendance-panels";
import { AttendanceFiltersForm } from "@/components/attendance/attendance-filters-form";
import { AttendanceViewTabs } from "@/components/attendance/attendance-view-tabs";
import { athensDayRange, athensWeekRangeFromWeekContaining } from "@/lib/schedule/range";
import { buildAttendanceHref, parseAttendanceSearchParams } from "@/lib/attendance/search-params";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

type AttendancePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AttendancePage({ searchParams }: AttendancePageProps) {
  const ctx = await getSessionContext();
  if (!canAccessAttendanceModule(ctx.roleCodes)) {
    redirect("/dashboard");
  }

  const raw = await searchParams;
  const search = parseAttendanceSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader
          eyebrow="Παρουσίες"
          title="Παρουσιολόγιο"
          description="Η καταχώρηση παρουσιών συνδέεται με το πρόγραμμα συνεδριών. Ρυθμίστε οργανισμό και κέντρα για να φορτώσει το μητρώο."
        />
        <EmptyState
          title="Δεν έχει ρυθμιστεί οργανισμός ανάπτυξης"
          description={orgErr ?? "Το παρουσιολόγιο θα εμφανιστεί μόλις υπάρχουν demo δεδομένα οργανισμού, κέντρου και συνεδριών."}
        />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return (
      <div>
        <PageHeader eyebrow="Παρουσίες" title="Παρουσιολόγιο" />
        <EmptyState
          title="Δεν υπάρχουν ακόμη demo δεδομένα παρουσιών"
          description="Η τοπική βάση Supabase δεν απαντά ή δεν έχει αρχικοποιηθεί. Το παρουσιολόγιο παραμένει διαθέσιμο ως κενή προβολή σε λειτουργία ανάπτυξης."
        />
      </div>
    );
  }

  const range =
    search.view === "day"
      ? athensDayRange(search.dateYmd)
      : athensWeekRangeFromWeekContaining(search.dateYmd);

  const [dataRes, centersRes, therapistsRes, childrenRes] = await Promise.all([
    listSessionsWithAttendance({
      organizationId,
      fromIso: range.fromIso,
      toIso: range.toIso,
      filters: search.filters,
    }),
    listCentersForOrganization(organizationId),
    listTherapistsForOrganization(organizationId),
    listChildrenOptionsForOrganization(organizationId),
  ]);

  const canRecordForSession = (therapistUserId: string) =>
    canRecordAttendanceForSession(ctx.roleCodes, ctx.user?.id ?? null, therapistUserId);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Καταχώρηση παρουσίας"
        title="Παρουσιολόγιο"
        description="Παρουσίες δεμένες στο πρόγραμμα συνεδριών. Όπου εφαρμόζεται, η καταχώρηση ενημερώνει και την κατάσταση της συνεδρίας για συνέπεια με τη γραμματεία και τη διοίκηση."
        actions={
          <Link
            href={buildAttendanceHref({
              view: search.view,
              dateYmd: todayAthensYmd(),
              filters: search.filters,
            })}
            className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            Σήμερα
          </Link>
        }
      />

      <div className="space-y-4 rounded-2xl border border-border bg-gradient-to-b from-surface-card to-surface-muted/25 p-4 shadow-shell sm:p-5">
        <AttendanceViewTabs search={search} />
        <AttendanceDateNav search={search} />
      </div>

      {dataRes.error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 shadow-sm" role="alert">
          {dataRes.error}
        </div>
      ) : null}

      <div className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell sm:p-5">
        <AttendanceFiltersForm
          search={search}
          centers={centersRes.centers}
          therapists={therapistsRes.therapists}
          childOptions={childrenRes.children}
        />
      </div>

      {search.view === "day" ? (
        <AttendanceDayPanel
          items={dataRes.items}
          dayYmd={search.dateYmd}
          canRecordForSession={canRecordForSession}
        />
      ) : (
        <AttendanceWeekListPanel items={dataRes.items} canRecordForSession={canRecordForSession} />
      )}
    </div>
  );
}
