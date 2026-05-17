import Link from "next/link";
import type { ChildListItem, ParentLinkRow } from "@/lib/data/children/types";
import {
  CHILD_GENDER_LABELS,
  CHILD_STATUS_LABELS,
  formatApproximateAgeYearsEl,
  formatDateEl,
} from "@/lib/ui/child-labels";
import type { ChildGender } from "@/lib/data/children/types";

type Props = {
  child: ChildListItem;
  parentLinks: ParentLinkRow[];
  canMutate: boolean;
  canScheduleSessions: boolean;
  canWriteGoals: boolean;
  showSecretaryLink: boolean;
};

export function ClinicalProfileHeader({
  child,
  parentLinks,
  canMutate,
  canScheduleSessions,
  canWriteGoals,
  showSecretaryLink,
}: Props) {
  const genderLabel =
    child.gender && child.gender in CHILD_GENDER_LABELS
      ? CHILD_GENDER_LABELS[child.gender as ChildGender]
      : "—";

  return (
    <header className="overflow-hidden rounded-2xl border border-clinical-100 bg-gradient-to-br from-white via-clinical-50/30 to-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-800">
            Κλινικό / εκπαιδευτικό προφίλ
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            {child.first_name} {child.last_name}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {CHILD_STATUS_LABELS[child.status]}
            {child.center?.name ? ` · ${child.center.name}` : ""}
            {child.date_of_birth ? ` · ${formatApproximateAgeYearsEl(child.date_of_birth)}` : ""}
          </p>
          {parentLinks.length > 0 ? (
            <p className="mt-1 text-xs text-ink-faint">
              Γονείς/κηδεμόνες:{" "}
              {parentLinks
                .map((p) =>
                  p.parent
                    ? `${p.parent.last_name} ${p.parent.first_name}`.trim() || "—"
                    : "—"
                )
                .join(", ")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/children"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-white px-4 text-sm font-medium hover:bg-surface-muted"
          >
            ← Λίστα
          </Link>
          {canMutate ? (
            <Link
              href={`/children/${child.id}/edit`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-border bg-white px-4 text-sm font-semibold hover:bg-surface-muted"
            >
              Επεξεργασία στοιχείων
            </Link>
          ) : null}
          {canScheduleSessions ? (
            <Link
              href={`/schedule/new?child=${encodeURIComponent(child.id)}`}
              className="inline-flex min-h-[44px] items-center rounded-xl bg-clinical-600 px-4 text-sm font-bold text-white hover:bg-clinical-700"
            >
              Νέα συνεδρία
            </Link>
          ) : null}
          {canWriteGoals ? (
            <Link
              href={`/therapy-goals/new?child=${encodeURIComponent(child.id)}`}
              className="inline-flex min-h-[44px] items-center rounded-xl border-2 border-clinical-600 bg-white px-4 text-sm font-bold text-clinical-700 hover:bg-clinical-50"
            >
              Νέος στόχος
            </Link>
          ) : null}
        </div>
      </div>

      <dl className="mt-5 grid gap-3 border-t border-clinical-100/80 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-ink-faint">Φύλο</dt>
          <dd className="font-medium">{genderLabel}</dd>
        </div>
        <div>
          <dt className="text-xs text-ink-faint">Έναρξη</dt>
          <dd className="font-medium">{formatDateEl(child.enrollment_start_date)}</dd>
        </div>
        {(child.school_name || child.school_grade) && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-ink-faint">Σχολείο (κλινικό πλαίσιο)</dt>
            <dd className="font-medium">
              {[child.school_name, child.school_grade].filter(Boolean).join(" · ")}
            </dd>
          </div>
        )}
        {child.notes ? (
          <div className="sm:col-span-2 lg:col-span-4">
            <dt className="text-xs text-ink-faint">Κλινικές παρατηρήσεις (σύνοψη)</dt>
            <dd className="whitespace-pre-wrap text-ink">{child.notes}</dd>
          </div>
        ) : null}
      </dl>

      {showSecretaryLink ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-surface-muted/30 px-3 py-2 text-xs text-ink-muted">
          Επιχειρησιακά (πληρωμές, υπενθυμίσεις, γραμματεία):{" "}
          <Link
            href={`/secretary/schedule?child=${encodeURIComponent(child.id)}`}
            className="font-semibold text-clinical-700 underline"
          >
            Άνοιγμα στο Γραμματεία
          </Link>
        </p>
      ) : null}
    </header>
  );
}
