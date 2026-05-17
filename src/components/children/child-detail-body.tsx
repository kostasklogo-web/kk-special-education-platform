import Link from "next/link";
import { buildReportsHref } from "@/lib/progress-reports/search-params";
import { todayAthensYmd } from "@/lib/schedule/athens-civil";
import { buildScheduleHref } from "@/lib/schedule/search-params";
import { buildSessionNotesHref } from "@/lib/session-notes/search-params";
import { buildTherapyGoalsHref } from "@/lib/therapy-goals/search-params";
import { ChildDetailCommunicationButton } from "@/components/children/ChildDetailCommunicationButton";
import { NewCommunicationLink } from "@/components/secretary/communications/NewCommunicationLink";
import { ChildPaymentWarningsBanner } from "@/components/children/ChildPaymentWarningsBanner";
import { ChildProfilePaymentBadge } from "@/components/children/ChildProfilePaymentBadge";
import { ChildProfileTaskBadge } from "@/components/children/ChildProfileTaskBadge";
import { ChildOpenTasksPanel } from "@/components/children/ChildOpenTasksPanel";
import { ChildCommunicationSection } from "@/components/children/ChildCommunicationSection";
import { ChildDiagnosisSection } from "@/components/children/ChildDiagnosisSection";
import { ChildReportsSection } from "@/components/children/ChildReportsSection";
import { ChildRemindersSection } from "@/components/children/ChildRemindersSection";
import { ChildMeetingsSection } from "@/components/children/ChildMeetingsSection";
import { ChildProfileDiagnosisBadge } from "@/components/children/ChildProfileDiagnosisBadge";
import { ChildProfileReportBadge } from "@/components/children/ChildProfileReportBadge";
import { ChildParentsPanel } from "@/components/children/child-parents-panel";
import { ChildWorkflowTimeline } from "@/components/children/child-workflow-timeline";
import { ProfileSectionCard } from "@/components/children/profile-section-card";
import { EmptyState } from "@/components/shell/EmptyState";
import type { ChildGender, ChildListItem, ParentLinkRow, TherapyProgramSummary } from "@/lib/data/children/types";
import type { ParentSummary } from "@/lib/data/parents/types";
import {
  CHILD_GENDER_LABELS,
  CHILD_STATUS_LABELS,
  PREFERRED_LANGUAGE_LABELS,
  formatApproximateAgeYearsEl,
  formatDateEl,
} from "@/lib/ui/child-labels";

export type ChildDetailCounts = {
  goals: number;
  sessions: number;
  sessionNotes: number;
  reports: number;
  files: number;
};

type ChildDetailBodyProps = {
  child: ChildListItem;
  parentLinks: ParentLinkRow[];
  eligibleParents: ParentSummary[];
  programs: TherapyProgramSummary[];
  counts: ChildDetailCounts;
  canMutate: boolean;
  /** Γραμματεία / διοίκηση — νέα συνεδρία από το προφίλ. */
  canScheduleSessions: boolean;
  canWriteTherapyGoals: boolean;
  canCommunicate: boolean;
  loadWarnings: string[];
};

export function ChildDetailBody({
  child,
  parentLinks,
  eligibleParents,
  programs,
  counts,
  canMutate,
  canScheduleSessions,
  canWriteTherapyGoals,
  canCommunicate,
  loadWarnings,
}: ChildDetailBodyProps) {
  const genderLabel =
    child.gender && child.gender in CHILD_GENDER_LABELS
      ? CHILD_GENDER_LABELS[child.gender as ChildGender]
      : "—";

  return (
    <div className="space-y-8">
      {loadWarnings.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {loadWarnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      ) : null}

      {canCommunicate ? (
        <>
          <ChildPaymentWarningsBanner childId={child.id} />
          <ChildOpenTasksPanel childId={child.id} childLabel={`${child.first_name} ${child.last_name}`} />
          <ChildDiagnosisSection childId={child.id} childLabel={`${child.first_name} ${child.last_name}`} />
          <ChildReportsSection childId={child.id} childLabel={`${child.first_name} ${child.last_name}`} />
          <ChildRemindersSection
            childId={child.id}
            childLabel={`${child.first_name} ${child.last_name}`}
            child={child}
            parentLinks={parentLinks}
          />
          <ChildMeetingsSection childId={child.id} childLabel={`${child.first_name} ${child.last_name}`} />
          <ChildCommunicationSection childId={child.id} childLabel={`${child.first_name} ${child.last_name}`} />
        </>
      ) : null}

      <header className="overflow-hidden rounded-3xl border border-clinical-100/80 bg-gradient-to-br from-white via-clinical-50/35 to-white p-6 shadow-shell sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-clinical-800">Προφίλ παιδιού</p>
            <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {child.first_name} {child.last_name}
              {canCommunicate ? (
                <>
                  <ChildProfilePaymentBadge childId={child.id} />
                  <ChildProfileTaskBadge childId={child.id} />
                  <ChildProfileDiagnosisBadge childId={child.id} />
                  <ChildProfileReportBadge childId={child.id} />
                </>
              ) : null}
            </h1>
            <p className="mt-2 text-sm text-ink-muted">
              {CHILD_STATUS_LABELS[child.status]}
              {child.center?.name ? ` · ${child.center.name}` : ""}
              {child.date_of_birth ? ` · ${formatApproximateAgeYearsEl(child.date_of_birth)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/children"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              ← Λίστα
            </Link>
            {canMutate ? (
              <Link
                href={`/children/${child.id}/edit`}
                className="inline-flex min-h-[44px] items-center rounded-xl bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
              >
                Επεξεργασία
              </Link>
            ) : (
              <span className="inline-flex min-h-[44px] items-center rounded-xl border border-dashed border-border px-4 py-2 text-xs text-ink-faint">
                Μόνο προβολή
              </span>
            )}
            {canScheduleSessions ? (
              <Link
                href={`/schedule/new?child=${encodeURIComponent(child.id)}`}
                className="inline-flex min-h-[44px] items-center rounded-xl border border-emerald-600/80 bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Νέα συνεδρία
              </Link>
            ) : null}
            {canCommunicate ? (
              <>
                <NewCommunicationLink
                  params={{
                    childId: child.id,
                    childLabel: `${child.first_name} ${child.last_name}`,
                  }}
                  size="lg"
                />
                <ChildDetailCommunicationButton child={child} parentLinks={parentLinks} />
              </>
            ) : null}
          </div>
        </div>

        <div className="mt-8 border-t border-clinical-100/80 pt-6">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Ροή εργασιών — γρήγορη πρόσβαση
          </p>
          <ChildWorkflowTimeline childId={child.id} counts={counts} />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <ProfileMetricCard
          label="Κατάσταση"
          value={CHILD_STATUS_LABELS[child.status]}
          helper={child.center?.name ?? "Χωρίς τοποθεσία"}
        />
        <ProfileMetricCard
          label="Στόχοι"
          value={counts.goals}
          helper={counts.goals === 0 ? "Χρειάζεται θεραπευτικό πλάνο" : "Συνδεδεμένοι με πλάνα"}
          href={buildTherapyGoalsHref({ childId: child.id })}
          linkHint="Άνοιγμα στόχων"
        />
        <ProfileMetricCard
          label="Συνεδρίες"
          value={counts.sessions}
          helper="Ιστορικό και πρόγραμμα"
          href={buildScheduleHref({
            view: "list",
            dateYmd: todayAthensYmd(),
            filters: { childId: child.id },
          })}
          linkHint="Άνοιγμα προγράμματος"
        />
        <ProfileMetricCard
          label="Σημειώσεις"
          value={counts.sessionNotes}
          helper="Κλινική τεκμηρίωση"
          href={buildSessionNotesHref({
            dateYmd: todayAthensYmd(),
            filters: { childId: child.id },
          })}
          linkHint="Άνοιγμα σημειώσεων"
        />
        <ProfileMetricCard
          label="Αναφορές"
          value={counts.reports}
          helper="Πρόοδος προς οικογένεια"
          href={buildReportsHref({ childId: child.id })}
          linkHint="Άνοιγμα αναφορών"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSectionCard
          title="Βασικά στοιχεία"
          description="Στοιχεία ταυτότητας και κατάστασης ωφελούμενου."
        >
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-ink-faint">Όνομα</dt>
              <dd className="font-medium text-ink">{child.first_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Επώνυμο</dt>
              <dd className="font-medium text-ink">{child.last_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Ημερομηνία γέννησης</dt>
              <dd className="text-ink">{formatDateEl(child.date_of_birth)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Ηλικία (εκτίμηση)</dt>
              <dd className="text-ink">{formatApproximateAgeYearsEl(child.date_of_birth)}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Φύλο</dt>
              <dd className="text-ink">{genderLabel}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Κατάσταση</dt>
              <dd className="text-ink">{CHILD_STATUS_LABELS[child.status]}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Προτιμώμενη γλώσσα</dt>
              <dd className="text-ink">{PREFERRED_LANGUAGE_LABELS[child.preferred_language]}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Κέντρο / τοποθεσία</dt>
              <dd className="text-ink">{child.center?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-faint">Ημερομηνία έναρξης</dt>
              <dd className="text-ink">{formatDateEl(child.enrollment_start_date)}</dd>
            </div>
            {(child.school_name || child.school_grade) && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-faint">Σχολείο</dt>
                <dd className="text-ink">
                  {[child.school_name, child.school_grade].filter(Boolean).join(" · ") || "—"}
                </dd>
              </div>
            )}
            {child.notes ? (
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-faint">Σχόλια / παρατηρήσεις</dt>
                <dd className="whitespace-pre-wrap text-ink">{child.notes}</dd>
              </div>
            ) : null}
          </dl>
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Γονείς / κηδεμόνες"
          description="Συνδέσεις με προφίλ γονέων· η διαχείριση ελέγχεται από ρόλο και RLS."
        >
          <ChildParentsPanel
            childId={child.id}
            links={parentLinks}
            eligibleParents={eligibleParents}
            canMutate={canMutate}
          />
        </ProfileSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSectionCard
          title="Θεραπευτικό πρόγραμμα"
          description="Προγράμματα θεραπείας ανά παιδί (MVP)."
        >
          {programs.length === 0 ? (
            <EmptyState
              title="Κανένα πρόγραμμα"
              description="Δεν υπάρχουν καταχωρημένα θεραπευτικά προγράμματα για αυτό το παιδί."
            />
          ) : (
            <ul className="space-y-2">
              {programs.map((p) => (
                <li key={p.id} className="rounded-lg border border-border px-3 py-2">
                  <span className="font-medium text-ink">{p.title ?? "Πρόγραμμα"}</span>
                </li>
              ))}
            </ul>
          )}
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Θεραπευτικοί στόχοι"
          description="Στόχοι ανά παιδί και θεραπευτικό πλάνο· σύνδεση με σημειώσεις συνεδριών."
        >
          <div className="space-y-3">
            {counts.goals === 0 ? (
              <EmptyState
                title="Κανένας στόχος"
                description="Δεν έχουν καταχωρηθεί θεραπευτικοί στόχοι."
              />
            ) : (
              <p className="text-ink">
                Καταχωρημένοι στόχοι: <strong>{counts.goals}</strong>
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Link
                href={buildTherapyGoalsHref({ childId: child.id })}
                className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Λίστα θεραπευτικών στόχων
              </Link>
              {canWriteTherapyGoals ? (
                <Link
                  href={`/therapy-goals/new?child=${encodeURIComponent(child.id)}`}
                  className="rounded-lg bg-clinical-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
                >
                  Νέος στόχος
                </Link>
              ) : null}
            </div>
          </div>
        </ProfileSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSectionCard
          title="Παρουσίες"
          description="Σύνδεση με συνεδρίες και πίνακα παρουσιών (MVP)."
        >
          {counts.sessions === 0 ? (
            <EmptyState
              title="Καμία συνεδρία"
              description="Δεν υπάρχουν συνεδρίες για αυτό το παιδί. Οι παρουσίες θα εμφανίζονται αφού δημιουργηθεί πρόγραμμα."
            />
          ) : (
            <div className="space-y-3">
              <p className="text-ink">
                Συνεδρίες (ως βάση για παρουσίες): <strong>{counts.sessions}</strong>
              </p>
              <Link
                href={buildScheduleHref({
                  view: "list",
                  dateYmd: todayAthensYmd(),
                  filters: { childId: child.id },
                })}
                className="inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Προβολή στο πρόγραμμα
              </Link>
            </div>
          )}
        </ProfileSectionCard>

        <ProfileSectionCard
          title="Σημειώσεις συνεδριών"
          description="Πρόχειρα και οριστικά κείμενα (ορατότητα γονέα σύμφωνα με RLS)."
        >
          {counts.sessionNotes === 0 ? (
            <EmptyState
              title="Καμία σημείωση"
              description="Δεν υπάρχουν σημειώσεις συνεδριών για τις συνεδρίες αυτού του παιδιού."
            />
          ) : (
            <div className="space-y-3">
              <p className="text-ink">
                Σημειώσεις: <strong>{counts.sessionNotes}</strong>
              </p>
              <Link
                href={buildSessionNotesHref({
                  dateYmd: todayAthensYmd(),
                  filters: { childId: child.id },
                })}
                className="inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Προβολή σημειώσεων
              </Link>
            </div>
          )}
        </ProfileSectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSectionCard title="Αναφορές προόδου" description="Αναφορές και δημοσιεύσεις προς γονείς.">
          {counts.reports === 0 ? (
            <EmptyState
              title="Καμία αναφορά"
              description="Δεν υπάρχουν αναφορές προόδου για αυτό το παιδί."
            />
          ) : (
            <div className="space-y-3">
              <p className="text-ink">
                Αναφορές: <strong>{counts.reports}</strong>
              </p>
              <Link
                href={buildReportsHref({ childId: child.id })}
                className="inline-flex rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
              >
                Λίστα αναφορών για αυτό το παιδί
              </Link>
            </div>
          )}
        </ProfileSectionCard>

        <ProfileSectionCard title="Αρχεία" description="Μεταδεδομένα αρχείων (αποθήκευση Supabase Storage — επόμενο στάδιο).">
          {counts.files === 0 ? (
            <EmptyState
              title="Κανένα αρχείο"
              description="Δεν έχουν ανέβει αρχεία συνδεδεμένα με αυτό το παιδί."
            />
          ) : (
            <p className="text-ink">
              Αρχεία: <strong>{counts.files}</strong>
            </p>
          )}
        </ProfileSectionCard>
      </div>
    </div>
  );
}

function ProfileMetricCard({
  label,
  value,
  helper,
  href,
  linkHint,
}: {
  label: string;
  value: string | number;
  helper: string;
  href?: string;
  linkHint?: string;
}) {
  const body = (
    <>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p className="mt-2 text-xl font-semibold tabular-nums text-ink sm:text-2xl">{value}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{helper}</p>
      {href && linkHint ? (
        <p className="mt-3 text-xs font-semibold text-clinical-700 group-hover:underline">{linkHint} →</p>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="group flex min-h-[7.5rem] flex-col rounded-2xl border border-border bg-gradient-to-b from-surface-card to-surface-muted/20 p-4 shadow-shell transition hover:border-clinical-200 hover:shadow-md sm:p-5"
      >
        {body}
      </Link>
    );
  }

  return (
    <div className="flex min-h-[7.5rem] flex-col rounded-2xl border border-border bg-gradient-to-b from-surface-card to-surface-muted/20 p-4 shadow-shell sm:p-5">
      {body}
    </div>
  );
}
