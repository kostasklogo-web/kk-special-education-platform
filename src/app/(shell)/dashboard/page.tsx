import Link from "next/link";
import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  FilePenLine,
  FileText,
  Stethoscope,
  Target,
  Users,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { EmptyState } from "@/components/shell/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getDashboardOverview } from "@/lib/data/dashboard/queries";
import { attendanceStatusLabelEl } from "@/lib/ui/attendance-labels";
import { sessionKindLabelEl, sessionStatusLabelEl } from "@/lib/ui/session-labels";
import { formatAthensLongDateFromYmd, formatAthensTimeEl, todayAthensYmd } from "@/lib/schedule/athens-civil";

const ATTENDANCE_FLOW = [
  "expected",
  "present",
  "absent",
  "cancel_parent",
  "to_makeup",
] as const;

const KPI_ICONS: LucideIcon[] = [
  UsersRound,
  Users,
  CalendarDays,
  CalendarRange,
  Target,
  FilePenLine,
  Stethoscope,
  Building2,
];

const sectionShell = "rounded-2xl border border-border bg-surface-card shadow-shell";

export default async function DashboardPage() {
  const ctx = await getSessionContext();
  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  const todayLabel = formatAthensLongDateFromYmd(todayAthensYmd());

  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader
          eyebrow="Επιχειρησιακός πίνακας"
          title="Λειτουργία κέντρου"
          description="Συγκεντρωτική εικόνα προγράμματος, παρουσιών, στόχων και σημειώσεων για τη διοίκηση και την κλινική ομάδα."
        />
        <EmptyState
          icon={AlertCircle}
          title="Δεν εντοπίστηκε οργανισμός"
          description={
            orgErr ??
            "Ρυθμίστε το περιβάλλον επίδειξης (Supabase + seed) ώστε να φορτώσει ο οργανισμός και τα δεδομένα του πίνακα."
          }
        />
      </div>
    );
  }

  const overview = await getDashboardOverview(organizationId);
  const childrenMetric = overview.metrics[0];
  const parentsMetric = overview.metrics[1];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Επιχειρησιακός πίνακας"
        title="Λειτουργία κέντρου"
        description="Ζωντανή εικόνα για πολυθεματικό κέντρο ειδικής αγωγής: ωφελούμενοι, οικογένειες, πρόγραμμα, παρουσίες, κλινικοί στόχοι και τεκμηρίωση."
        meta={<span className="text-ink-muted">{todayLabel}</span>}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/schedule"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50/60"
            >
              Πρόγραμμα
            </Link>
            <Link
              href="/children/new"
              className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700"
            >
              Νέος φάκελος παιδιού
            </Link>
          </div>
        }
      />

      {overview.errors.length > 0 ? (
        <div className="rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-amber-50/40 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <strong className="font-semibold">Περιορισμένη σύνδεση:</strong>{" "}
          <span className="text-amber-900/90">{overview.errors.join(" ")}</span>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric, i) => (
          <KpiStatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            icon={KPI_ICONS[i]}
            emphasis={i < 4}
          />
        ))}
      </div>

      <section
        className={`${sectionShell} border-clinical-100/70 bg-gradient-to-br from-white via-clinical-50/30 to-white px-5 py-5 sm:px-6`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-800">Μητρώο και πρόγραμμα</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">Ωφελούμενοι και οικογένειες</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              Κεντρική διαχείριση φακέλων, κέντρων λειτουργίας και κατάστασης παρέμβασης. Συνδέεται με πρόγραμμα, παρουσίες και
              θεραπευτικούς στόχους.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-clinical-100 bg-white/90 px-5 py-3 text-center shadow-sm">
              <p className="text-2xl font-semibold tabular-nums text-ink">{childrenMetric?.value ?? "—"}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Ενεργοί φάκελοι</p>
            </div>
            <div className="rounded-xl border border-border bg-white/90 px-5 py-3 text-center shadow-sm">
              <p className="text-2xl font-semibold tabular-nums text-ink">{parentsMetric?.value ?? "—"}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Οικογένειες</p>
            </div>
            <Link
              href="/children"
              className="inline-flex items-center justify-center rounded-xl border border-clinical-600 bg-clinical-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-clinical-700"
            >
              Μετάβαση στο μητρώο
            </Link>
          </div>
        </div>
      </section>

      <section
        className={`${sectionShell} border-amber-200/60 bg-gradient-to-r from-amber-50/90 via-white to-surface-card px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6 sm:px-6`}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white shadow-sm">
            <FileText className="h-5 w-5 text-amber-800" aria-hidden />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">Αναφορές σε εκκρεμότητα</h2>
            <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-muted">
              Κλινικές και λειτουργικές αναφορές που αναμένουν ολοκλήρωση ή έλεγχο πριν την κοινοποίηση σε γονείς ή φορείς.
            </p>
          </div>
        </div>
        <div className="mt-4 flex shrink-0 flex-wrap items-center gap-4 sm:mt-0 sm:flex-col sm:items-end">
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-amber-950">{overview.pendingReportCount}</p>
          <Link
            href="/reports"
            className="inline-flex rounded-lg border border-amber-300/80 bg-white px-4 py-2 text-sm font-medium text-amber-950 shadow-sm transition hover:bg-amber-50"
          >
            Διαχείριση αναφορών
          </Link>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.95fr]">
        <div className="space-y-8">
          <section className={sectionShell}>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-base font-semibold text-ink">Σημερινό πρόγραμμα</h2>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-ink-muted">
                  Ροή συνεδριών για γραμματεία και θεραπευτές — ώρα, ωφελούμενος, ειδικότητα και χώρος.
                </p>
              </div>
              <CalendarDays className="h-5 w-5 shrink-0 text-clinical-700" aria-hidden />
            </div>

            {overview.todaySessions.length === 0 ? (
              <div className="p-5 sm:p-6">
                <EmptyState
                  title="Κενό πρόγραμμα για σήμερα"
                  description="Όταν υπάρχουν προγραμματισμένες συνεδρίες, εμφανίζονται εδώ με χρονική σειρά. Ελέγξτε το ημερολόγιο ή προσθέστε νέα συνεδρία από το πρόγραμμα."
                />
              </div>
            ) : (
              <div className="divide-y divide-border">
                {overview.todaySessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/schedule/${session.id}`}
                    className="grid gap-3 px-5 py-4 transition hover:bg-surface-muted/50 sm:px-6 md:grid-cols-[7rem_1fr_auto]"
                  >
                    <div className="text-sm font-semibold text-ink">
                      {formatAthensTimeEl(session.starts_at)}
                      <span className="block text-xs font-normal text-ink-muted">{formatAthensTimeEl(session.ends_at)}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink">{session.child_name}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {session.therapist_name ?? "Χωρίς ανάθεση θεραπευτή"} · {session.discipline_name_el ?? session.discipline_code}
                        {session.room_name ? ` · ${session.room_name}` : ""}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2 md:justify-end">
                      <span className="rounded-full bg-clinical-50 px-2.5 py-1 text-xs font-medium text-clinical-900">
                        {sessionKindLabelEl(session.session_kind)}
                      </span>
                      <span className="rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-ink-muted">
                        {sessionStatusLabelEl(session.status)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <section className={`${sectionShell} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Αξιοποίηση αιθουσών</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">Κατανομή χρήσης χώρων ανά κέντρο για σήμερα.</p>
              </div>
              <BarChart3 className="h-5 w-5 shrink-0 text-clinical-700" aria-hidden />
            </div>
            <div className="space-y-5">
              {overview.occupancy.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-muted">
                  Δεν υπάρχουν συνεδρίες για υπολογισμό πληρότητας. Προσθέστε πρόγραμμα ή ελέγξτε το εύρος ημερομηνιών.
                </p>
              ) : (
                overview.occupancy.map((item) => {
                  const percent = Math.min(100, Math.round((item.used / Math.max(item.total, 1)) * 100));
                  return (
                    <div key={item.label}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-ink">{item.label}</span>
                        <span className="tabular-nums text-ink-muted">
                          {item.used}/{item.total}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-gradient-to-r from-clinical-600 to-clinical-500" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{item.helper}</p>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className={`${sectionShell} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Σύνοψη παρουσιών (εβδομάδα)</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">Καταστάσεις για την τρέχουσα εβδομάδα λειτουργίας.</p>
              </div>
              <ClipboardCheck className="h-5 w-5 shrink-0 text-clinical-700" aria-hidden />
            </div>
            <div className="space-y-3">
              {ATTENDANCE_FLOW.map((status) => (
                <div key={status} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-ink-muted">{attendanceStatusLabelEl(status)}</span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink">
                    {overview.attendanceSummary[status]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className={`${sectionShell} p-5 sm:p-6`}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">Φόρτος θεραπευτικής ομάδας</h2>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">Προγραμματισμένες συνεδρίες ανά επαγγελματία (επόμενες ημέρες).</p>
              </div>
              <Users className="h-5 w-5 shrink-0 text-clinical-700" aria-hidden />
            </div>
            <div className="space-y-3">
              {overview.therapistWorkloads.length === 0 ? (
                <p className="text-sm leading-relaxed text-ink-muted">Δεν υπάρχουν προγραμματισμένες συνεδρίες στο επιλεγμένο διάστημα.</p>
              ) : (
                overview.therapistWorkloads.map((item) => (
                  <div key={item.therapistName} className="rounded-xl border border-border bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.therapistName}</p>
                        <p className="truncate text-xs text-ink-muted">{item.discipline}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-clinical-50 px-2.5 py-1 text-xs font-semibold text-clinical-900">
                        {item.sessions} συνεδρίες
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-ink-faint">{item.helper}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={`${sectionShell} p-5 sm:p-6`}>
            <h2 className="text-base font-semibold text-ink">Κλινική και διοικητική ροή</h2>
            <p className="mt-1 text-sm text-ink-muted">Γρήγορη πρόσβαση σε εκκρεμότητες και καταχωρήσεις.</p>
            <div className="mt-4 grid gap-3">
              <WorkflowLink href="/therapy-goals" icon={Target} label="Θεραπευτικοί στόχοι" value={overview.openGoalCount} />
              <WorkflowLink href="/session-notes" icon={FileText} label="Σημειώσεις συνεδριών" value={overview.draftNoteCount} />
              <WorkflowLink href="/attendance" icon={ClipboardCheck} label="Παρουσίες (αναμενόμενες)" value={overview.attendanceSummary.expected} />
            </div>
          </section>

          <section className="rounded-2xl border border-clinical-100 bg-gradient-to-br from-clinical-50/80 to-white p-5 text-sm text-clinical-900 sm:p-6">
            <h2 className="font-semibold text-clinical-950">Λειτουργία επίδειξης</h2>
            <p className="mt-2 leading-relaxed text-clinical-900/90">
              Η πρόσβαση παραμένει ανοιχτή για την επίδειξη. Ο τρέχων ρόλος εμφανίζεται για έλεγχο δικαιωμάτων:{" "}
              <span className="font-medium">{ctx.roleCodes.join(", ") || "—"}</span>.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function WorkflowLink({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm transition hover:border-clinical-200 hover:bg-clinical-50/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-clinical-700" aria-hidden />
        <span className="truncate font-medium text-ink">{label}</span>
      </span>
      <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink">{value}</span>
    </Link>
  );
}
