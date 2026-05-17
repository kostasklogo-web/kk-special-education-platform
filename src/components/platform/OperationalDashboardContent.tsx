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
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { DashboardTodaySessionRow } from "@/components/dashboard/dashboard-today-session-row";
import { KpiStatCard } from "@/components/dashboard/kpi-stat-card";
import { OperationalAlertCards } from "@/components/dashboard/operational-alert-cards";
import { EmptyState } from "@/components/shell/EmptyState";
import { PageHeader } from "@/components/shell/PageHeader";
import { getSessionContext } from "@/lib/auth/get-session-context";
import type { RoleCode } from "@/lib/auth/roles";
import { getDefaultOrganizationIdForUser } from "@/lib/data/children/queries";
import { getDashboardOverview } from "@/lib/data/dashboard/queries";
import { buildAttendanceHref } from "@/lib/attendance/search-params";
import { buildReportsHref } from "@/lib/progress-reports/search-params";
import { buildSessionNotesHref } from "@/lib/session-notes/search-params";
import { attendanceStatusLabelEl } from "@/lib/ui/attendance-labels";
import { formatAthensLongDateFromYmd, todayAthensYmd } from "@/lib/schedule/athens-civil";
import { buildScheduleHref } from "@/lib/schedule/search-params";

const ATTENDANCE_FLOW = ["expected", "present", "absent", "cancel_parent", "to_makeup"] as const;

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

const KPI_LINKS = [
  "/children",
  "/parents",
  buildScheduleHref({ view: "day", dateYmd: todayAthensYmd(), filters: {} }),
  buildScheduleHref({ view: "list", dateYmd: todayAthensYmd(), filters: {} }),
  "/therapy-goals",
  "/session-notes",
  "/staff",
  "/rooms",
] as const;

type Props = {
  /** When true, omits the page header (used on platform home which has its own). */
  embedded?: boolean;
};

export async function OperationalDashboardContent({ embedded = false }: Props) {
  const ctx = await getSessionContext();
  const { organizationId, error: orgErr } = await getDefaultOrganizationIdForUser();
  const todayYmd = todayAthensYmd();
  const todayLabel = formatAthensLongDateFromYmd(todayYmd);

  if (orgErr || !organizationId) {
    return (
      <div>
        {!embedded ? (
          <PageHeader
            eyebrow="Επιχειρησιακός πίνακας"
            title="Λειτουργία κέντρου"
            description="Συγκεντρωτική εικόνα προγράμματος, παρουσιών, στόχων και σημειώσεων."
          />
        ) : null}
        <EmptyState
          icon={AlertCircle}
          title="Δεν εντοπίστηκε οργανισμός"
          description={orgErr ?? "Ρυθμίστε το περιβάλλον επίδειξης ώστε να φορτώσουν τα δεδομένα."}
        />
      </div>
    );
  }

  const overview = await getDashboardOverview(organizationId);
  const childrenMetric = overview.metrics[0];
  const parentsMetric = overview.metrics[1];

  const isClinicalTherapistDesk =
    ctx.roleCodes.includes("THERAPIST") &&
    !ctx.roleCodes.some((r: RoleCode) => ["ORG_OWNER", "ORG_ADMIN", "RECEPTION", "SUPERVISOR"].includes(r));

  const therapistUserId = ctx.user?.id ?? null;
  const todaySessionsForUser =
    isClinicalTherapistDesk && therapistUserId
      ? overview.todaySessions.filter((s) => s.therapist_user_id === therapistUserId)
      : overview.todaySessions;

  return (
    <div className={embedded ? "space-y-6" : "space-y-8"}>
      {!embedded ? (
        <PageHeader
          eyebrow="Επιχειρησιακός πίνακας"
          title="Λειτουργία κέντρου"
          description="Ζωντανή εικόνα για πολυθεματικό κέντρο ειδικής αγωγής."
          meta={<span className="text-sm text-ink-muted">{todayLabel}</span>}
          actions={
            <Link
              href="/schedule/control-center"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-clinical-600 bg-clinical-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700"
            >
              Πίνακας προγράμματος
            </Link>
          }
        />
      ) : null}

      {overview.errors.length > 0 ? (
        <div className="rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-amber-50/40 px-4 py-3 text-sm text-amber-950 shadow-sm">
          <strong className="font-semibold">Περιορισμένη σύνδεση:</strong>{" "}
          <span className="text-amber-900/90">{overview.errors.join(" ")}</span>
        </div>
      ) : null}

      <DashboardQuickActions desk={isClinicalTherapistDesk ? "clinical" : "operations"} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric, i) => (
          <KpiStatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            helper={metric.helper}
            icon={KPI_ICONS[i]}
            emphasis={i < 4}
            href={KPI_LINKS[i]}
            variant={i < 4 ? "default" : "muted"}
          />
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-faint">Επείγοντα & εκκρεμότητες</h2>
          <Link href="/attendance" className="text-xs font-semibold text-clinical-700 hover:underline">
            Παρουσιολόγιο →
          </Link>
        </div>
        <OperationalAlertCards items={overview.operationalAlerts} />
      </section>

      <section
        className={`${sectionShell} border-clinical-100/70 bg-gradient-to-br from-white via-clinical-50/30 to-white px-5 py-5 sm:px-6`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-clinical-800">Μητρώο και πρόγραμμα</p>
            <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">Ωφελούμενοι και οικογένειες</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-clinical-100 bg-white/90 px-5 py-3 text-center shadow-sm">
              <p className="text-2xl font-semibold tabular-nums text-ink">{childrenMetric?.value ?? "—"}</p>
              <p className="mt-0.5 text-xs text-ink-muted">Ενεργοί φάκελοι</p>
            </div>
            <Link href="/children" className="inline-flex items-center justify-center rounded-xl border border-clinical-600 bg-clinical-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-clinical-700">
              Μητρώο παιδιών
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1.35fr_0.95fr]">
        <section className={`${sectionShell} overflow-hidden`}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-gradient-to-r from-clinical-50/30 to-transparent px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-base font-semibold text-ink">Σημερινό πρόγραμμα</h2>
              <p className="mt-1 text-sm text-ink-muted">{todayLabel}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link href="/schedule/control-center" className="text-xs font-semibold text-clinical-700 hover:underline">
                Κεντρικός πίνακας
              </Link>
              <Link href={buildScheduleHref({ view: "day", dateYmd: todayYmd, filters: {} })} className="text-xs font-semibold text-ink-muted hover:underline">
                Κλασικό
              </Link>
            </div>
          </div>
          {todaySessionsForUser.length === 0 ? (
            <div className="p-5 sm:p-6">
              <EmptyState title="Κενό πρόγραμμα για σήμερα" description="Δείτε τον πίνακα προγράμματος ή το ημερολόγιο συνεδριών." />
            </div>
          ) : (
            <div className="divide-y divide-border/80">
              {todaySessionsForUser.map((session) => (
                <DashboardTodaySessionRow key={session.id} session={session} />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <section className={`${sectionShell} p-5 sm:p-6`}>
            <h2 className="text-base font-semibold text-ink">Αξιοποίηση αιθουσών</h2>
            <div className="mt-4 space-y-5">
              {overview.occupancy.map((item) => {
                const percent = Math.min(100, Math.round((item.used / Math.max(item.total, 1)) * 100));
                return (
                  <div key={item.label}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium text-ink">{item.label}</span>
                      <span className="tabular-nums text-ink-muted">
                        {item.used}/{item.total}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-clinical-600" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={`${sectionShell} p-5 sm:p-6`}>
            <h2 className="text-base font-semibold text-ink">Παρουσίες (εβδομάδα)</h2>
            <div className="mt-4 space-y-3">
              {ATTENDANCE_FLOW.map((status) => (
                <div key={status} className="flex justify-between text-sm">
                  <span className="text-ink-muted">{attendanceStatusLabelEl(status)}</span>
                  <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                    {overview.attendanceSummary[status]}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className={`${sectionShell} p-5 sm:p-6`}>
            <h2 className="text-base font-semibold text-ink">Κλινική ροή</h2>
            <div className="mt-4 grid gap-3">
              <WorkflowLink href="/therapy-goals" icon={Target} label="Θεραπευτικοί στόχοι" value={overview.openGoalCount} />
              <WorkflowLink
                href={buildSessionNotesHref({ dateYmd: todayAthensYmd(), filters: {} })}
                icon={FileText}
                label="Σημειώσεις"
                value={overview.draftNoteCount}
              />
              <WorkflowLink
                href={buildReportsHref({ status: "open" })}
                icon={FilePenLine}
                label="Αναφορές"
                value={overview.pendingReportCount}
              />
            </div>
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
      className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-border bg-white px-4 py-3 shadow-sm hover:border-clinical-200 hover:bg-clinical-50/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0 text-clinical-700" aria-hidden />
        <span className="truncate font-medium text-ink">{label}</span>
      </span>
      <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold tabular-nums text-ink">{value}</span>
    </Link>
  );
}
