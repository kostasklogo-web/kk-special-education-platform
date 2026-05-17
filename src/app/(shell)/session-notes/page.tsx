import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AUTH_GATING_TEMPORARILY_DISABLED,
  DEVELOPMENT_ORGANIZATION_ID,
  DEVELOPMENT_PRIMARY_CENTER_ID,
  DEVELOPMENT_SECONDARY_CENTER_ID,
  getSessionContext,
  type SessionContext,
} from "@/lib/auth/get-session-context";
import { isSupabaseReachableQuickly } from "@/lib/supabase/availability";
import {
  canAccessSessionNotesModule,
  canEditSessionNote,
  canWriteSessionNotes,
} from "@/lib/auth/session-notes-permissions";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { listSessionNotesForOrganization } from "@/lib/data/session-notes/queries";
import type { SessionNoteListItem } from "@/lib/data/session-notes/types";
import {
  listChildrenOptionsForOrganization,
  listDisciplines,
  listTherapistsForOrganization,
} from "@/lib/data/sessions/queries";
import { PageHeader } from "@/components/shell/PageHeader";
import { EmptyState } from "@/components/shell/EmptyState";
import { SessionNotesFiltersForm } from "@/components/session-notes/session-notes-filters-form";
import { SessionNotesTable } from "@/components/session-notes/session-notes-table";
import { addDaysAthensCalendar } from "@/lib/schedule/athens-civil";
import { buildSessionNotesHref, parseSessionNotesSearchParams } from "@/lib/session-notes/search-params";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";

type SessionNotesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SessionNotesPage({ searchParams }: SessionNotesPageProps) {
  const ctx = await getSessionContext();
  if (!canAccessSessionNotesModule(ctx.roleCodes)) {
    redirect("/");
  }

  const raw = await searchParams;
  const search = parseSessionNotesSearchParams(raw);

  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader title="Σημειώσεις συνεδριών" />
        <EmptyState
          title="Δεν έχει ρυθμιστεί οργανισμός ανάπτυξης"
          description={orgErr ?? "Προσθέστε ή εκτελέστε seed δεδομένα για να εμφανιστούν σημειώσεις. Μέχρι τότε η σελίδα παραμένει διαθέσιμη για έλεγχο του UI."}
        />
      </div>
    );
  }

  if (AUTH_GATING_TEMPORARILY_DISABLED && !(await isSupabaseReachableQuickly())) {
    return renderSessionNotesDevelopmentEmptyState(ctx);
  }

  const [dataRes, therapistsRes, childrenRes, disciplinesRes] = await Promise.all([
    listSessionNotesForOrganization({
      organizationId,
      dateYmdAnchor: search.dateYmd,
      filters: search.filters,
    }),
    listTherapistsForOrganization(organizationId),
    listChildrenOptionsForOrganization(organizationId),
    listDisciplines(),
  ]);

  const canWrite = canWriteSessionNotes(ctx.roleCodes);
  const prevWeek = addDaysAthensCalendar(search.dateYmd, -7);
  const nextWeek = addDaysAthensCalendar(search.dateYmd, 7);

  const canEditRow = (row: SessionNoteListItem) =>
    canEditSessionNote(
      ctx.roleCodes,
      ctx.user?.id ?? null,
      row.session_therapist_user_id,
      row.author_user_id
    );

  return (
    <div>
      <PageHeader
        title="Σημειώσεις συνεδριών"
        description="Κλινικές σημειώσεις για ολοκληρωμένες συνεδρίες. Η γραμματεία βλέπει λίστα χωρίς κλινική επεξεργασία. Οι γονείς δεν έχουν πρόσβαση στο MVP."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildSessionNotesHref({ dateYmd: todayAthensYmd(), filters: search.filters })}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Τρέχουσα εβδομάδα
            </Link>
            {canWrite ? (
              <Link
                href="/session-notes/new"
                className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Νέα σημείωση συνεδρίας
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mb-6 flex flex-wrap justify-end gap-2">
        <Link
          href={buildSessionNotesHref({ dateYmd: prevWeek, filters: search.filters })}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
        >
          Προηγούμενη εβδομάδα
        </Link>
        <Link
          href={buildSessionNotesHref({ dateYmd: nextWeek, filters: search.filters })}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm text-ink shadow-sm hover:bg-surface-muted"
        >
          Επόμενη εβδομάδα
        </Link>
      </div>

      {dataRes.error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900" role="alert">
          {dataRes.error}
        </div>
      ) : null}

      <SessionNotesFiltersForm
        search={search}
        therapists={therapistsRes.therapists}
        childOptions={childrenRes.children}
        disciplines={disciplinesRes.disciplines}
      />

      <SessionNotesTable items={dataRes.items} canEditRow={canEditRow} />
    </div>
  );
}

function renderSessionNotesDevelopmentEmptyState(ctx: SessionContext) {
  const canWrite = canWriteSessionNotes(ctx.roleCodes);

  return (
    <div>
      <PageHeader
        title="Σημειώσεις συνεδριών"
        description="Η σελίδα παραμένει διαθέσιμη σε λειτουργία ανάπτυξης, ακόμη κι όταν η τοπική βάση δεν έχει αρχικοποιηθεί."
        actions={
          canWrite ? (
            <Link
              href="/session-notes/new"
              className="inline-flex rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Νέα σημείωση συνεδρίας
            </Link>
          ) : null
        }
      />
      <EmptyState
        title="Δεν υπάρχουν ακόμη demo δεδομένα σημειώσεων"
        description={`Εκτελέστε το seed για τον οργανισμό ανάπτυξης (${DEVELOPMENT_ORGANIZATION_ID}) και τα κέντρα ${DEVELOPMENT_PRIMARY_CENTER_ID}, ${DEVELOPMENT_SECONDARY_CENTER_ID}. Μέχρι τότε εμφανίζεται κενή κατάσταση αντί για σφάλμα σύνδεσης.`}
      />
    </div>
  );
}
