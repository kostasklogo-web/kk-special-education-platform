import Link from "next/link";
import { AlertCircle, BarChart3, CalendarDays, ClipboardCheck, FileText, Target, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/shell/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import { getSessionContext } from "@/lib/auth/get-session-context";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getDashboardOverview } from "@/lib/data/dashboard/queries";
import { attendanceStatusLabelEl } from "@/lib/ui/attendance-labels";
import { sessionKindLabelEl, sessionStatusLabelEl } from "@/lib/ui/session-labels";
import { formatAthensTimeEl } from "@/lib/schedule/athens-civil";

const ATTENDANCE_FLOW = [
  "expected",
  "present",
  "absent",
  "cancel_parent",
  "to_makeup",
] as const;

export default async function DashboardPage() {
  const ctx = await getSessionContext();
  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();

  if (orgErr || !organizationId) {
    return (
      <div>
        <PageHeader
          title="Πίνακας λειτουργίας"
          description="Σύνοψη της ημέρας για πρόγραμμα, παρουσίες, στόχους και σημειώσεις."
        />
        <EmptyState
          icon={AlertCircle}
          title="Δεν βρέθηκε οργανισμός"
          description={orgErr ?? "Προσθέστε demo δεδομένα Supabase για να εμφανιστεί ο επιχειρησιακός πίνακας."}
        />
      </div>
    );
  }

  const overview = await getDashboardOverview(organizationId);

  return (
    <div>
      <PageHeader
        title="Πίνακας λειτουργίας"
        description="Ζωντανή εικόνα MVP για την καθημερινή λειτουργία του κέντρου: παιδιά, οικογένειες, πρόγραμμα, παρουσίες, κλινικοί στόχοι και σημειώσεις."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/schedule"
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm hover:bg-surface-muted"
            >
              Πρόγραμμα
            </Link>
            <Link
              href="/children/new"
              className="rounded-lg bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Νέο παιδί
            </Link>
          </div>
        }
      />

      {overview.errors.length > 0 ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Μερική φόρτωση:</strong> {overview.errors.join(" ")}
        </div>
      ) : null}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">{metric.value}</p>
            <p className="mt-1 text-sm text-ink-muted">{metric.helper}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border border-border bg-surface-card shadow-shell">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-ink">Σημερινές συνεδρίες</h2>
              <p className="mt-1 text-sm text-ink-muted">Γρήγορη επιχειρησιακή εικόνα για γραμματεία και κλινική ομάδα.</p>
            </div>
            <CalendarDays className="h-5 w-5 text-clinical-700" aria-hidden />
          </div>

          {overview.todaySessions.length === 0 ? (
            <div className="p-5">
              <EmptyState
                title="Δεν υπάρχουν συνεδρίες σήμερα"
                description="Όταν υπάρχει demo πρόγραμμα, εδώ θα εμφανίζεται η ροή της ημέρας ανά ώρα, παιδί, θεραπευτή και αίθουσα."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {overview.todaySessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/schedule/${session.id}`}
                  className="grid gap-3 px-5 py-4 transition hover:bg-surface-muted/50 md:grid-cols-[7rem_1fr_auto]"
                >
                  <div className="text-sm font-semibold text-ink">
                    {formatAthensTimeEl(session.starts_at)}
                    <span className="block text-xs font-normal text-ink-muted">{formatAthensTimeEl(session.ends_at)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-ink">{session.child_name}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {session.therapist_name ?? "Χωρίς θεραπευτή"} · {session.discipline_name_el ?? session.discipline_code}
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

        <aside className="space-y-6">
          <section className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Πληρότητα αιθουσών</h2>
                <p className="mt-1 text-sm text-ink-muted">Ενδεικτική χρήση χώρων για τη σημερινή λειτουργία.</p>
              </div>
              <BarChart3 className="h-5 w-5 text-clinical-700" aria-hidden />
            </div>
            <div className="space-y-4">
              {overview.occupancy.length === 0 ? (
                <p className="text-sm text-ink-muted">Δεν υπάρχουν συνεδρίες για υπολογισμό πληρότητας.</p>
              ) : (
                overview.occupancy.map((item) => {
                  const percent = Math.min(100, Math.round((item.used / Math.max(item.total, 1)) * 100));
                  return (
                    <div key={item.label}>
                      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-ink">{item.label}</span>
                        <span className="text-ink-muted">
                          {item.used}/{item.total}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                        <div className="h-full rounded-full bg-clinical-600" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="mt-1 text-xs text-ink-faint">{item.helper}</p>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Παρουσίες εβδομάδας</h2>
                <p className="mt-1 text-sm text-ink-muted">Καταχώρηση, απουσίες και αναπληρώσεις.</p>
              </div>
              <ClipboardCheck className="h-5 w-5 text-clinical-700" aria-hidden />
            </div>
            <div className="space-y-3">
              {ATTENDANCE_FLOW.map((status) => (
                <div key={status} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-ink-muted">{attendanceStatusLabelEl(status)}</span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 font-semibold text-ink">
                    {overview.attendanceSummary[status]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">Φόρτος θεραπευτών</h2>
                <p className="mt-1 text-sm text-ink-muted">Συνεδρίες επόμενων ημερών ανά θεραπευτή.</p>
              </div>
              <Users className="h-5 w-5 text-clinical-700" aria-hidden />
            </div>
            <div className="space-y-3">
              {overview.therapistWorkloads.length === 0 ? (
                <p className="text-sm text-ink-muted">Δεν υπάρχουν προγραμματισμένες συνεδρίες.</p>
              ) : (
                overview.therapistWorkloads.map((item) => (
                  <div key={item.therapistName} className="rounded-xl border border-border bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">{item.therapistName}</p>
                        <p className="truncate text-xs text-ink-muted">{item.discipline}</p>
                      </div>
                      <span className="rounded-full bg-clinical-50 px-2.5 py-1 text-xs font-semibold text-clinical-900">
                        {item.sessions} συνεδρίες
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-ink-faint">{item.helper}</p>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-surface-card p-5 shadow-shell">
            <h2 className="text-base font-semibold text-ink">Ροή εργασίας MVP</h2>
            <div className="mt-4 grid gap-3">
              <WorkflowLink href="/therapy-goals" icon={Target} label="Θεραπευτικοί στόχοι" value={overview.openGoalCount} />
              <WorkflowLink href="/session-notes" icon={FileText} label="Σημειώσεις συνεδριών" value={overview.draftNoteCount} />
              <WorkflowLink href="/attendance" icon={ClipboardCheck} label="Παρουσίες" value={overview.attendanceSummary.expected} />
              <WorkflowLink href="/reports" icon={FileText} label="Αναφορές σε εκκρεμότητα" value={overview.pendingReportCount} />
            </div>
          </section>

          <section className="rounded-2xl border border-clinical-100 bg-clinical-50 p-5 text-sm text-clinical-900">
            <h2 className="font-semibold">Προσωρινή λειτουργία ανάπτυξης</h2>
            <p className="mt-2 leading-relaxed">
              Η πρόσβαση είναι ανοιχτή για τοπικές δοκιμές. Ο τρέχων ρόλος έχει πλήρη MVP δικαιώματα:
              {" "}
              {ctx.roleCodes.join(", ")}.
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
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 transition hover:border-clinical-200 hover:bg-clinical-50"
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-clinical-700" aria-hidden />
        <span className="truncate font-medium text-ink">{label}</span>
      </span>
      <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-ink">{value}</span>
    </Link>
  );
}