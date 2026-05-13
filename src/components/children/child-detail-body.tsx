import Link from "next/link";
import { buildTherapyGoalsHref } from "@/lib/therapy-goals/search-params";
import { ChildParentsPanel } from "@/components/children/child-parents-panel";
import { ProfileSectionCard } from "@/components/children/profile-section-card";
import { EmptyState } from "@/components/shell/EmptyState";
import type { ChildGender, ChildListItem, ParentLinkRow, TherapyProgramSummary } from "@/lib/data/children/types";
import type { ParentSummary } from "@/lib/data/parents/types";
import {
  CHILD_GENDER_LABELS,
  CHILD_STATUS_LABELS,
  PREFERRED_LANGUAGE_LABELS,
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
  canWriteTherapyGoals: boolean;
  loadWarnings: string[];
};

export function ChildDetailBody({
  child,
  parentLinks,
  eligibleParents,
  programs,
  counts,
  canMutate,
  canWriteTherapyGoals,
  loadWarnings,
}: ChildDetailBodyProps) {
  const genderLabel =
    child.gender && child.gender in CHILD_GENDER_LABELS
      ? CHILD_GENDER_LABELS[child.gender as ChildGender]
      : "—";

  return (
    <div className="space-y-6">
      {loadWarnings.length > 0 ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {loadWarnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Προφίλ παιδιού</p>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {child.first_name} {child.last_name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/children"
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
          >
            ← Λίστα
          </Link>
          {canMutate ? (
            <Link
              href={`/children/${child.id}/edit`}
              className="rounded-lg bg-clinical-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Επεξεργασία
            </Link>
          ) : (
            <span className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-ink-faint">
              Μόνο προβολή (χωρίς δικαίωμα επεξεργασίας)
            </span>
          )}
        </div>
      </div>

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
        />
        <ProfileMetricCard
          label="Συνεδρίες"
          value={counts.sessions}
          helper="Ιστορικό και πρόγραμμα"
        />
        <ProfileMetricCard
          label="Σημειώσεις"
          value={counts.sessionNotes}
          helper="Κλινική τεκμηρίωση"
        />
        <ProfileMetricCard
          label="Αναφορές"
          value={counts.reports}
          helper="Πρόοδος προς οικογένεια"
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
                href={`/schedule?view=list&child=${encodeURIComponent(child.id)}`}
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
                href={`/session-notes?child=${encodeURIComponent(child.id)}`}
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
            <p className="text-ink">
              Αναφορές: <strong>{counts.reports}</strong>
            </p>
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
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface-card p-4 shadow-shell">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs leading-5 text-ink-muted">{helper}</p>
    </div>
  );
}
